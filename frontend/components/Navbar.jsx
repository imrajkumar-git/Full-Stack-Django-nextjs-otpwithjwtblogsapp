"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import Avatar from "./Avatar";
import { useAuth } from "@/context/AuthContext";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/experience", label: "Experience" },
  { href: "/skills", label: "Skills" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-2xl transition-all duration-300 ${
        scrolled
          ? "border-emerald-400/15 bg-black/50 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.6)]"
          : "border-white/5 bg-black/25"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/25 to-sky-500/25 ring-1 ring-emerald-400/30 transition group-hover:ring-sky-400/60">
            <Image src="/logo.png" alt="RK logo" width={44} height={44} className="object-contain" />
          </span>
          <span className="font-display text-2xl font-bold tracking-tight text-white">
            Rajkumar<span className="text-emerald-400">.</span>
            <span className="text-sky-400">dev</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-0.5 rounded-full border border-white/10 bg-white/5 p-1 lg:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-gradient-to-r from-emerald-500 to-sky-500 text-black shadow-glow"
                      : "text-slate-200 hover:text-emerald-300"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />

          {loading ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-white/10" />
          ) : user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 transition hover:border-emerald-400/40"
              >
                <Avatar user={user} size={30} />
                <span className="max-w-[110px] truncate text-sm font-medium text-slate-200">
                  {user.username || user.email}
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-white/10 bg-black/90 py-1 text-sm shadow-glow backdrop-blur-xl">
                  <div className="truncate border-b border-white/10 px-4 py-2 text-slate-400">
                    {user.email}
                  </div>
                  <Link href="/dashboard" className="block px-4 py-2 text-slate-200 hover:bg-white/5">
                    Dashboard
                  </Link>
                  {user.is_staff && (
                    <Link href="/admin" className="block px-4 py-2 text-slate-200 hover:bg-white/5">
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="block w-full px-4 py-2 text-left text-red-400 hover:bg-white/5"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-emerald-300 lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle navigation menu"
        >
          <span className="text-xl">{open ? "✕" : "☰"}</span>
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-black/60 px-5 pb-6 pt-2 backdrop-blur-2xl lg:hidden">
          <ul className="flex flex-col gap-1">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block rounded-xl px-4 py-3 text-base font-medium ${
                      active
                        ? "bg-gradient-to-r from-emerald-500 to-sky-500 text-black"
                        : "text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex items-center justify-between">
            <ThemeToggle />
            {user && (
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="text-sm font-medium text-slate-200">
                  Dashboard
                </Link>
                <button onClick={logout} className="text-sm font-medium text-red-400">
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
