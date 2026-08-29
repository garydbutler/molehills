import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { isDbConfigured, sql } from "@/lib/db";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function confirmationEmail(origin: string, token: string) {
  const url = `${origin}/verify?token=${token}`;
  return {
    subject: "Confirm your spot on the Inchmeal waitlist",
    html: `
      <div style="font-family:Georgia,'Times New Roman',serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#20403b;">
        <p style="font-size:13px;letter-spacing:0.18em;text-transform:uppercase;font-family:Helvetica,Arial,sans-serif;color:#8aa39a;margin:0 0 20px;">Inchmeal · Field notes on steady progress</p>
        <h1 style="font-weight:normal;font-size:24px;line-height:1.3;margin:0 0 16px;">Big things, finished <em>gently</em>.</h1>
        <p style="font-size:15px;line-height:1.6;margin:0 0 28px;">Someone (hopefully you) left this address on the Inchmeal waitlist. Confirm it and you'll be among the first through the window — one quiet email at launch, nothing else, ever.</p>
        <a href="${url}" style="display:inline-block;background:#2e7266;color:#f2f1e4;text-decoration:none;font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;padding:13px 28px;border-radius:999px;">Confirm my email</a>
        <p style="font-size:12px;line-height:1.6;color:#7d938b;margin:32px 0 0;">If you didn't sign up, you can ignore this — nothing happens without a confirm, and we won't email this address again.</p>
      </div>`,
  };
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = typeof (body as { email?: unknown })?.email === "string"
    ? ((body as { email: string }).email).trim().toLowerCase()
    : "";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please provide a valid email address." },
      { status: 400 },
    );
  }

  if (!(await isDbConfigured())) {
    return NextResponse.json(
      { error: "Database not configured. Set POSTGRES_URL." },
      { status: 503 },
    );
  }

  const token = crypto.randomUUID().replace(/-/g, "");

  let alreadyVerified = false;
  try {
    const result = await sql`
      INSERT INTO early_access_signups (email, confirmation_token)
      VALUES (${email}, ${token})
      ON CONFLICT (email) DO UPDATE SET confirmation_token = ${token}
      RETURNING verified_at
    `;
    alreadyVerified = result.rows[0]?.verified_at != null;
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Email verification not configured yet — record the signup silently.
    return NextResponse.json(
      { ok: true, emailed: false },
      { status: alreadyVerified ? 200 : 201 },
    );
  }

  if (!alreadyVerified) {
    try {
      const resend = new Resend(apiKey);
      const message = confirmationEmail(request.nextUrl.origin, token);
      await resend.emails.send({
        from:
          process.env.RESEND_FROM ?? "Inchmeal <onboarding@resend.dev>",
        to: email,
        subject: message.subject,
        html: message.html,
      });
    } catch {
      // Signup is recorded; the confirmation email just failed to send.
      return NextResponse.json(
        { ok: true, emailed: false },
        { status: 201 },
      );
    }
  }

  return NextResponse.json(
    { ok: true, emailed: !alreadyVerified },
    { status: alreadyVerified ? 200 : 201 },
  );
}
