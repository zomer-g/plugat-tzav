import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByEmail, getPrivacyPolicy, recordConsent } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = getUserByEmail(session.user.email);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await req.json();
  const { policyVersion, name, phone, relationToPlugah, agreeToMailings } = body;

  // Validate policy version matches current
  const policy = getPrivacyPolicy();
  if (!policyVersion || policyVersion !== policy.currentVersion) {
    return NextResponse.json(
      { error: "Policy version mismatch. Please refresh the page." },
      { status: 400 }
    );
  }

  // Sanitize inputs
  const sanitize = (val: unknown, maxLen: number): string | undefined => {
    if (typeof val !== "string") return undefined;
    return val.trim().slice(0, maxLen) || undefined;
  };

  const updated = recordConsent(user.id, policyVersion, {
    name: sanitize(name, 100),
    phone: sanitize(phone, 20),
    relationToPlugah: sanitize(relationToPlugah, 200),
    agreeToMailings: agreeToMailings === true,
  });

  if (!updated) {
    return NextResponse.json({ error: "Failed to save consent" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
