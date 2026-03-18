"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface OnboardingFormProps {
  policyText: string;
  policyVersion: number;
  userName: string;
  userEmail: string;
}

export default function OnboardingForm({
  policyText,
  policyVersion,
  userName,
  userEmail,
}: OnboardingFormProps) {
  const router = useRouter();
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [phone, setPhone] = useState("");
  const [relationToPlugah, setRelationToPlugah] = useState("");
  const [agreeToMailings, setAgreeToMailings] = useState(false);
  const [agreeToPolicy, setAgreeToPolicy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreeToPolicy) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/members/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policyVersion,
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          relationToPlugah: relationToPlugah.trim() || undefined,
          agreeToMailings,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }

      // Refresh the page — layout will re-check consent and render children
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה לא צפויה");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl py-8" dir="rtl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-sand">ברוכים הבאים לאזור האישי</h1>
        <p className="mt-2 text-gray-400">
          לפני שנמשיך, נבקש ממך לקרוא ולאשר את מדיניות הפרטיות שלנו
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Privacy Policy Text */}
        <div className="rounded-xl border border-dark-border bg-dark-card p-6">
          <h2 className="mb-4 text-lg font-bold text-white">
            📋 מדיניות פרטיות <span className="text-sm font-normal text-gray-400">(גרסה {policyVersion})</span>
          </h2>
          <div
            className="max-h-64 overflow-y-auto rounded-lg border border-dark-border bg-dark-bg p-4 text-sm leading-relaxed text-gray-300 whitespace-pre-wrap"
            tabIndex={0}
            role="document"
            aria-label="טקסט מדיניות הפרטיות"
          >
            {policyText}
          </div>
        </div>

        {/* Profile Questions */}
        <div className="rounded-xl border border-dark-border bg-dark-card p-6">
          <h2 className="mb-4 text-lg font-bold text-white">
            פרטים אישיים <span className="text-sm font-normal text-gray-400">(לא חובה)</span>
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="onb-name" className="mb-1 block text-sm text-gray-400">
                שם
              </label>
              <input
                id="onb-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-white placeholder-gray-600 focus:border-olive focus:outline-none"
                placeholder="השם שלך"
                maxLength={100}
              />
            </div>

            <div>
              <label htmlFor="onb-relation" className="mb-1 block text-sm text-gray-400">
                קשר לפלוגה
              </label>
              <input
                id="onb-relation"
                type="text"
                value={relationToPlugah}
                onChange={(e) => setRelationToPlugah(e.target.value)}
                className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-white placeholder-gray-600 focus:border-olive focus:outline-none"
                placeholder="לדוגמה: לוחם, מפקד, בן משפחה..."
                maxLength={200}
              />
            </div>

            <div>
              <label htmlFor="onb-email" className="mb-1 block text-sm text-gray-400">
                אימייל
              </label>
              <input
                id="onb-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-white placeholder-gray-600 focus:border-olive focus:outline-none"
                placeholder="your@email.com"
                dir="ltr"
                maxLength={200}
              />
            </div>

            <div>
              <label htmlFor="onb-phone" className="mb-1 block text-sm text-gray-400">
                טלפון
              </label>
              <input
                id="onb-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-white placeholder-gray-600 focus:border-olive focus:outline-none"
                placeholder="050-0000000"
                dir="ltr"
                maxLength={20}
              />
            </div>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-4 rounded-xl border border-dark-border bg-dark-card p-6">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={agreeToMailings}
              onChange={(e) => setAgreeToMailings(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-dark-border accent-olive"
            />
            <span className="text-sm text-gray-300">
              אני מסכים/ה לקבל עדכונים, דיוורים והתראות מהפלוגה
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={agreeToPolicy}
              onChange={(e) => setAgreeToPolicy(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-dark-border accent-olive"
              required
            />
            <span className="text-sm font-bold text-white">
              קראתי ואני מסכים/ה למדיניות הפרטיות *
            </span>
          </label>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-600/50 bg-red-900/20 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!agreeToPolicy || submitting}
          className="w-full rounded-xl bg-olive py-4 text-lg font-bold text-white transition-all hover:bg-olive-light disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "שומר..." : "אישור והמשך לאזור האישי"}
        </button>
      </form>
    </div>
  );
}
