/*
  The Apple native sign-in endpoint must mint a session only for a token
  Apple actually signed. Anything else is a way in.

  Run with:  npx tsx src/app/api/auth/apple/native/route.test.ts
*/
import assert from "node:assert";
import { SignJWT, generateKeyPair } from "jose";
import { POST } from "./route";

function req(body: unknown): Request {
  return new Request("https://example.test/api/auth/apple/native", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as never;
}

async function main() {
  process.env.AUTH_SECRET ||= "test-secret-for-local-assertions-only";

  // Missing token.
  assert.strictEqual((await POST(req({}) as never)).status, 400);

  // Not a JWT at all.
  assert.strictEqual(
    (await POST(req({ identityToken: "garbage" }) as never)).status,
    401,
  );

  /*
    The important one: a perfectly well-formed token with the right issuer and
    audience, signed by a key that is not Apple's. If this ever returns 200,
    anyone can mint themselves an account for any `sub` they like — including
    one that already has a subscription.
  */
  const { privateKey } = await generateKeyPair("ES256");
  const forged = await new SignJWT({ email: "attacker@example.test" })
    .setProtectedHeader({ alg: "ES256", kid: "not-apples-key" })
    .setIssuer("https://appleid.apple.com")
    .setAudience("app.inchmeal.mobile")
    .setSubject("victim-apple-sub")
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(privateKey);

  const res = await POST(req({ identityToken: forged }) as never);
  assert.strictEqual(
    res.status,
    401,
    "a token signed with a non-Apple key was accepted",
  );

  console.log("apple native sign-in: all assertions passed");
}

main();
