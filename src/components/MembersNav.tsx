"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function isActive(href: string) {
    if (href === "/members") return pathname === "/members";
    return pathname.startsWith(href);
  }

  function linkClass(href: string, base: string) {
    return `${base} ${
      isActive(href)
        ? "bg-dark-surface text-sand"
        : "text-gray-300 hover:bg-dark-surface hover:text-sand"
    }`;
  }

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

        {/* Desktop nav */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/members"
            className={linkClass("/members", "rounded-lg px-3 py-2 text-sm transition-colors")}
          >
            דף הבית
          </Link>
          <Link
            href="/members/documents"
            className={linkClass("/members/documents", "rounded-lg px-3 py-2 text-sm transition-colors")}
          >
            מסמכים
          </Link>
          <Link
            href="/members/gallery"
            className={linkClass("/members/gallery", "rounded-lg px-3 py-2 text-sm transition-colors")}
          >
            גלריה
          </Link>
          <Link
            href="/members/events"
            className={linkClass("/members/events", "rounded-lg px-3 py-2 text-sm transition-colors")}
          >
            אירועים
          </Link>
          {userRole === "admin" && (
            <Link
              href="/admin"
              className="rounded-lg bg-olive/20 px-3 py-2 text-sm text-olive-light transition-colors hover:bg-olive/30"
            >
              ⚙️ ניהול
            </Link>
          )}
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-dark-surface hover:text-gray-300"
          >
            אתר ראשי
          </Link>

          {/* Profile dropdown */}
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

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 md:hidden"
          aria-label={menuOpen ? "סגור תפריט" : "פתח תפריט"}
          aria-expanded={menuOpen}
        >
          <span
            className={`block h-0.5 w-6 bg-white transition-transform ${
              menuOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-opacity ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-transform ${
              menuOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="bg-dark-bg/95 backdrop-blur-md md:hidden">
          <div className="flex flex-col items-center gap-3 px-4 py-6">
            <div className="mb-2 flex items-center gap-2">
              {userImage ? (
                <img
                  src={userImage}
                  alt=""
                  className="h-10 w-10 rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-olive text-lg font-bold text-white">
                  {userName.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-bold text-gray-200">{userName}</p>
                <p className="text-xs text-gray-500">{userEmail}</p>
              </div>
            </div>
            <Link
              href="/members"
              className={linkClass("/members", "w-full rounded-lg px-4 py-3 text-center transition-colors")}
            >
              דף הבית
            </Link>
            <Link
              href="/members/documents"
              className={linkClass("/members/documents", "w-full rounded-lg px-4 py-3 text-center transition-colors")}
            >
              מסמכים
            </Link>
            <Link
              href="/members/gallery"
              className={linkClass("/members/gallery", "w-full rounded-lg px-4 py-3 text-center transition-colors")}
            >
              גלריה
            </Link>
            <Link
              href="/members/events"
              className={linkClass("/members/events", "w-full rounded-lg px-4 py-3 text-center transition-colors")}
            >
              אירועים
            </Link>
            {userRole === "admin" && (
              <Link
                href="/admin"
                className="w-full rounded-lg bg-olive/20 px-4 py-3 text-center text-olive-light transition-colors hover:bg-olive/30"
              >
                ⚙️ ניהול
              </Link>
            )}
            <Link
              href="/"
              className="w-full rounded-lg px-4 py-3 text-center text-gray-500 transition-colors hover:bg-dark-surface hover:text-gray-300"
            >
              אתר ראשי
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full rounded-lg px-4 py-3 text-center text-red-400 transition-colors hover:bg-red-400/10"
            >
              התנתקות
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
