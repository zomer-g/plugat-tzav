import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserByEmail, getPrivacyPolicy, getCurrentPolicyVersion } from "@/lib/db";
import MembersNav from "@/components/MembersNav";
import OnboardingForm from "@/components/OnboardingForm";

export const metadata = {
  title: "אזור אישי | פלוגת צב",
};

export default async function MembersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/auth/signin");

  const user = getUserByEmail(session.user.email);
  if (!user || !user.active) {
    redirect("/auth/denied");
  }

  // Check privacy policy consent
  const policy = getPrivacyPolicy();
  const currentPolicy = getCurrentPolicyVersion();
  const needsConsent =
    policy.currentVersion > 0 &&
    user.consentVersion !== policy.currentVersion;

  return (
    <div className="min-h-screen bg-dark-bg">
      <MembersNav
        userName={user.name}
        userImage={user.image}
        userRole={user.role}
        userEmail={user.email}
      />
      <main className="mx-auto max-w-7xl px-4 py-8 pt-24">
        {needsConsent && currentPolicy ? (
          <OnboardingForm
            policyText={currentPolicy.text}
            policyVersion={currentPolicy.version}
            userName={user.name}
            userEmail={user.email}
          />
        ) : (
          children
        )}
      </main>
    </div>
  );
}
