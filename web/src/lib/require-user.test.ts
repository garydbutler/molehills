/*
  The one thing that must never regress: an anonymous caller cannot reach a
  paid Gemini route.

  Run with:  npx tsx src/lib/require-user.test.ts
*/
import assert from "node:assert";
import { requireUser } from "./require-user";
import { createMobileToken } from "./auth";

const HEADERS = { "Access-Control-Allow-Origin": "*" };

function req(auth?: string): Request {
  return new Request("https://example.test/api/plan", {
    method: "POST",
    headers: auth ? { authorization: auth } : {},
  });
}

async function main() {
  process.env.AUTH_SECRET ||= "test-secret-for-local-assertions-only";

  // No header at all.
  assert.strictEqual((await requireUser(req(), HEADERS)).user, null);

  // Present but not a bearer token.
  assert.strictEqual((await requireUser(req("Basic abc"), HEADERS)).user, null);

  // Well-formed but garbage signature.
  assert.strictEqual(
    (await requireUser(req("Bearer not.a.jwt"), HEADERS)).user,
    null,
  );

  // A token signed with the wrong secret must not pass.
  const realSecret = process.env.AUTH_SECRET;
  process.env.AUTH_SECRET = "a-different-secret";
  const foreign = await createMobileToken({
    email: "attacker@example.test",
    provider: "google",
    sub: "attacker",
  });
  process.env.AUTH_SECRET = realSecret;
  assert.strictEqual(
    (await requireUser(req(`Bearer ${foreign}`), HEADERS)).user,
    null,
    "token signed with a foreign secret was accepted",
  );

  // The happy path still works, and identity comes from the token.
  const good = await createMobileToken({
    email: "real@example.test",
    provider: "google",
    sub: "user-123",
  });
  const ok = await requireUser(req(`Bearer ${good}`), HEADERS);
  assert.strictEqual(ok.error, null);
  assert.strictEqual(ok.user?.sub, "user-123");
  assert.strictEqual(ok.user?.email, "real@example.test");

  // Every rejection is a 401, not a 500.
  const denied = await requireUser(req(), HEADERS);
  assert.strictEqual(denied.error?.status, 401);

  console.log("require-user: all assertions passed");
}

main();
