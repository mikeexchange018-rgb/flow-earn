import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

const ADMIN_EMAIL = "serikitunmishe@gmail.com";

type AdminSession = { admin?: boolean };

function sessionConfig() {
  return {
    password: process.env["SESSION_SECRET"]!,
    name: "flowearn-admin",
    maxAge: 60 * 60 * 12, // 12 hours
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

// Hash both sides to equal-length digests first: timingSafeEqual throws on a
// length mismatch, and the raw length itself would leak through timing.
function matches(input: string, expected: string): boolean {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const expectedPassword = process.env["ADMIN_PASSWORD"];
    if (!expectedPassword) throw new Error("ADMIN_PASSWORD is not set");

    // Only the exact admin address may sign in — any other email fails.
    const normalize = (v: string) => v.trim().toLowerCase();
    const emailOk = matches(normalize(data.email), normalize(ADMIN_EMAIL));
    const passwordOk = matches(data.password, expectedPassword);
    if (!emailOk || !passwordOk) {
      return { ok: false as const }; // generic failure — reveal nothing more
    }

    const session = await useSession<AdminSession>(sessionConfig());
    await session.update({ admin: true });
    return { ok: true as const };
  });

export const getAdminSession = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<AdminSession>(sessionConfig());
  return { unlocked: session.data.admin === true };
});

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<AdminSession>(sessionConfig());
  await session.clear();
  return { ok: true as const };
});
