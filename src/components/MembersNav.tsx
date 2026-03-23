"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

interface MembersNavProps {
  userName: string;
  userImage: string;
  userRole: "admin" | "member";
  userEmail: string;
}

export default function MembersNav({
  userName,
  userImage,
  userRole,
  userEmail,
}: MembersNavProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav
      aria-label="ניווט אזור אישי"
      className="fixed top-0 right-0 left-0 z-50 border-b border-dark-surface bg-dark-bg/95 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo + title */}
        <Link href="/members" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="פלוגת צב"
            width={40}
            height={40}
            className="rounded"
          />
          <div>
            <span className="text-lg font-bold text-sand">אזור אישי</span>
            <span className="mr-2 text-sm text-gray-500">פלוגת צב</span>
          </div>
        </Link>

        {/* Profile dropdown */}
        <div className="flex items-center gap-3">
          {userRole === "admin" && (
            <Link
              href="/admin"
              className="hidden rounded-lg bg-olive/20 px-3 py-2 text-sm text-olive-light transition-colors hover:bg-olive/30 sm:block"
            >
              ⚙️ ניהול
            </Link>
          )}
          <Link
            href="/"
            className="hidden rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-dark-surface hover:text-gray-300 sm:block"
          >
            אתר ראשי
          </Link>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-dark-surface"
              aria-expanded={profileOpen}
              aria-haspopup="true"
              aria-label="תפריט משתמש"
            >
              {userImage ? (
                <img
                  src={userImage}
                  alt=""
                  className="h-8 w-8 rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-olive text-sm font-bold text-white">
                  {userName.charAt(0)}
                </div>
              )}
              <span className="text-sm text-gray-300">{userName.split(" ")[0]}</span>
            </button>
            {profileOpen && (
              <div className="absolute left-0 mt-2 w-56 rounded-xl bg-dark-card p-2 shadow-xl">
                <div className="border-b border-dark-surface px-3 py-2">
                  <p className="text-sm font-bold text-gray-200">{userName}</p>
                  <p className="text-xs text-gray-500">{userEmail}</p>
                </div>
                {userRole === "admin" && (
                  <Link
                    href="/admin"
                    className="block w-full rounded-lg px-3 py-2 text-right text-sm text-olive-light transition-colors hover:bg-olive/10 sm:hidden"
                    onClick={() => setProfileOpen(false)}
                  >
                    ⚙️ ניהול
                  </Link>
                )}
                <Link
                  href="/"
                  className="block w-full rounded-lg px-3 py-2 text-right text-sm text-gray-300 transition-colors hover:bg-dark-surface sm:hidden"
                  onClick={() => setProfileOpen(false)}
                >
                  אתר ראשי
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="mt-1 w-full rounded-lg px-3 py-2 text-right text-sm text-red-400 transition-colors hover:bg-red-400/10"
                >
                  התנתקות
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
