"use client";

import { useState } from "react";
import type { PrivacyPolicyData, PrivacyPolicyVersion } from "@/lib/db";

interface Props {
  initialPolicy: PrivacyPolicyData;
}

export default function PrivacyPolicyManagement({ initialPolicy }: Props) {
  const [policy, setPolicy] = useState(initialPolicy);
  const [text, setText] = useState(
    policy.versions.find((v) => v.version === policy.currentVersion)?.text || ""
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [viewingVersion, setViewingVersion] = useState<PrivacyPolicyVersion | null>(null);

  const currentVersion = policy.versions.find(
    (v) => v.version === policy.currentVersion
  );
  const hasChanges = currentVersion ? text !== currentVersion.text : text.trim().length > 0;

  async function handleSave() {
    if (!text.trim()) {
      setMessage("יש להזין טקסט למדיניות הפרטיות");
      return;
    }

    if (!hasChanges) {
      setMessage("לא בוצעו שינויים בטקסט");
      return;
    }

    const confirmed = confirm(
      "שמירת גרסה חדשה תחייב את כל המשתמשים לאשר מחדש את מדיניות הפרטיות.\n\nלהמשיך?"
    );
    if (!confirmed) return;

    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/privacy-policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      const newVersion = await res.json();

      setPolicy((prev) => ({
        currentVersion: newVersion.version,
        versions: [...prev.versions, newVersion],
      }));

      setMessage(`גרסה ${newVersion.version} נשמרה בהצלחה! כל המשתמשים יתבקשו לאשר מחדש.`);
    } catch (err) {
      setMessage(`שגיאה: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Warning banner */}
      {policy.currentVersion > 0 && hasChanges && (
        <div className="rounded-lg border border-yellow-600/50 bg-yellow-900/20 p-4">
          <p className="text-sm text-yellow-300">
            ⚠️ שינוי הטקסט ושמירתו ייצור גרסה חדשה ויחייב את כל המשתמשים לאשר
            מחדש את מדיניות הפרטיות.
          </p>
        </div>
      )}

      {/* Editor */}
      <div className="rounded-lg border border-dark-border bg-dark-surface p-6">
        <label
          htmlFor="policy-text"
          className="mb-2 block text-lg font-bold text-white"
        >
          טקסט מדיניות הפרטיות
        </label>
        <p className="mb-4 text-sm text-gray-400">
          הטקסט יוצג למשתמשים בכניסה הראשונה לאזור האישי. ניתן לכתוב בעברית.
        </p>
        <textarea
          id="policy-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          dir="rtl"
          rows={15}
          className="w-full rounded-lg border border-dark-border bg-dark-bg px-4 py-3 text-white placeholder-gray-500 focus:border-olive focus:outline-none focus:ring-1 focus:ring-olive"
          placeholder="הזינו כאן את טקסט מדיניות הפרטיות..."
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {text.length.toLocaleString()} תווים
          </span>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="rounded-lg bg-olive px-6 py-2 font-bold text-white transition-colors hover:bg-olive-light disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "שומר..."
              : policy.currentVersion === 0
                ? "פרסום מדיניות פרטיות"
                : "שמירת גרסה חדשה"}
          </button>
        </div>
      </div>

      {/* Status message */}
      {message && (
        <div
          className={`rounded-lg p-4 text-sm ${
            message.startsWith("שגיאה")
              ? "border border-red-600/50 bg-red-900/20 text-red-300"
              : "border border-green-600/50 bg-green-900/20 text-green-300"
          }`}
        >
          {message}
        </div>
      )}

      {/* Version history */}
      {policy.versions.length > 0 && (
        <div className="rounded-lg border border-dark-border bg-dark-surface p-6">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex w-full items-center justify-between text-lg font-bold text-white"
          >
            <span>📜 היסטוריית גרסאות ({policy.versions.length})</span>
            <span className="text-gray-400">{showHistory ? "▲" : "▼"}</span>
          </button>

          {showHistory && (
            <div className="mt-4 space-y-3">
              {[...policy.versions].reverse().map((v) => (
                <div
                  key={v.version}
                  className={`rounded-lg border p-4 ${
                    v.version === policy.currentVersion
                      ? "border-olive/50 bg-olive/10"
                      : "border-dark-border bg-dark-bg"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white">
                        גרסה {v.version}
                      </span>
                      {v.version === policy.currentVersion && (
                        <span className="rounded-full bg-olive/30 px-2 py-0.5 text-xs text-olive-light">
                          נוכחית
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">
                        {new Date(v.createdAt).toLocaleDateString("he-IL", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <button
                        onClick={() =>
                          setViewingVersion(
                            viewingVersion?.version === v.version ? null : v
                          )
                        }
                        className="text-sm text-sand hover:underline"
                      >
                        {viewingVersion?.version === v.version
                          ? "הסתר"
                          : "הצג טקסט"}
                      </button>
                    </div>
                  </div>

                  {viewingVersion?.version === v.version && (
                    <div className="mt-3 max-h-48 overflow-y-auto rounded border border-dark-border bg-dark-bg p-3 text-sm text-gray-300 whitespace-pre-wrap" dir="rtl">
                      {v.text}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
