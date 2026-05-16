import { SignJWT, jwtVerify } from "jose"

const getSecret = () =>
  new TextEncoder().encode(`admin:${process.env.NEXTAUTH_SECRET ?? ""}`)

export async function signAdminToken(): Promise<string> {
  return new SignJWT({ admin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(getSecret())
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret())
    return true
  } catch {
    return false
  }
}
