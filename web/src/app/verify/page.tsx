import Link from "next/link";
import { isDbConfigured, sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  let state: "verified" | "already" | "invalid" | "unconfigured" = "invalid";

  if (token && (await isDbConfigured())) {
    try {
      const result = await sql`
        UPDATE early_access_signups
        SET verified_at = now()
        WHERE confirmation_token = ${token} AND verified_at IS NULL
        RETURNING email
      `;
      if (result.rows.length > 0) {
        state = "verified";
      } else {
        const existing = await sql`
          SELECT email FROM early_access_signups
          WHERE confirmation_token = ${token} AND verified_at IS NOT NULL
        `;
        state = existing.rows.length > 0 ? "already" : "invalid";
      }
    } catch {
      state = "unconfigured";
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div className="cta-box">
        <span className="index-label">UNBIG · Waitlist</span>
        <h1 className="display" style={{ marginTop: 18 }}>
          {state === "verified" && (
            <>
              You&apos;re confirmed — <em>gently</em>
              <span className="dot">.</span>
            </>
          )}
          {state === "already" && (
            <>
              Already confirmed<span className="dot">.</span>
            </>
          )}
          {state === "invalid" && (
            <>
              That link didn&apos;t <em>work</em>
              <span className="dot">.</span>
            </>
          )}
          {state === "unconfigured" && (
            <>
              Almost ready<span className="dot">.</span>
            </>
          )}
        </h1>
        <p className="lead" style={{ margin: "22px auto 0", textAlign: "center" }}>
          {state === "verified" &&
            "Your spot on the waitlist is confirmed. One quiet email at launch — nothing else, ever."}
          {state === "already" &&
            "This address was already confirmed. You're all set — nothing more to do."}
          {state === "invalid" &&
            "The confirmation link looks broken or expired. Try signing up again and we'll send a fresh one."}
          {state === "unconfigured" &&
            "We couldn't reach the list just now. Please try again in a moment."}
        </p>
        <p style={{ marginTop: 32 }}>
          <Link href="/" className="btn-primary">
            Back to UNBIG
          </Link>
        </p>
      </div>
    </main>
  );
}
