// components/commonComp/Navbar.tsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { usePuterStore } from "~/lib/puter";

/**
 * SafeLink:
 * - renders a plain anchor on the server so react-router DOM internals don't run during SSR
 * - renders react-router's <Link> on the client for SPA navigation
 */
const isServer = typeof window === "undefined";

interface SafeLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  "aria-current"?: boolean | "false" | "true" | "page" | "step" | "location" | "date" | "time" | undefined;
}

const SafeLink: React.FC<SafeLinkProps> = ({ to, children, className, onClick, ...rest }) => {
  if (isServer) {
    return (
      <a href={to} className={className} onClick={onClick} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={className} onClick={onClick} {...(rest as any)}>
      {children}
    </Link>
  );
};

/**
 * Lightweight auth helper — cast user to `any` for resiliency until your PuterUser type is extended.
 */
const useAuth = () => {
  const { auth } = usePuterStore();
  const isAuthenticated = !!auth?.isAuthenticated;
  const signIn = auth?.signIn || (() => {});
  const signOut = auth?.signOut || (() => {});
  const user: any = auth?.user || null;
  return { isAuthenticated, signIn, signOut, user };
};

const IconSearch = (props: { className?: string }) => (
  <svg className={props.className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconJobs = (props: { className?: string }) => (
  <svg className={props.className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M4 7h16M8 7v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const IconUpload = (props: { className?: string }) => (
  <svg className={props.className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="3" y="17" width="18" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const AvatarPlaceholder: React.FC<{ name?: string; size?: number }> = ({ name, size = 48 }) => {
  const initials =
    (name || "")
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "R";
  return (
    <div
      className="flex items-center justify-center bg-gray-100 text-gray-800 rounded-full flex-shrink-0"
      style={{ width: size, height: size, fontSize: Math.max(12, Math.floor(size / 2.6)) }}
      aria-hidden
    >
      {initials}
    </div>
  );
};

const getUserName = (user: any): string | undefined => {
  if (!user) return undefined;
  return user.name ?? user.fullName ?? user.displayName ?? user.email ?? undefined;
};

const safeGetPathname = (): string => {
  try {
    if (typeof window !== "undefined" && window.location && window.location.pathname) {
      return window.location.pathname;
    }
  } catch (e) { /* ignore */ }
  return "/";
};

/** NAV item component for mobile with large tap area */
const MobileNavItem: React.FC<{ to: string; label: string; onClick?: () => void; active?: boolean; icon?: React.ReactNode }> = ({ to, label, onClick, active, icon }) => {
  return (
    <SafeLink
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        active ? "bg-sky-50 text-sky-800" : "text-gray-800 hover:bg-gray-50"
      }`}
      aria-current={active ? "page" : undefined}
    >
      <span className="w-6 h-6 text-gray-600">{icon}</span>
      <span className="text-base font-medium">{label}</span>
    </SafeLink>
  );
};

const Navbar: React.FC = () => {
  const { isAuthenticated, signIn, signOut, user } = useAuth();
  const displayName = getUserName(user);
  const [pathname, setPathname] = useState<string>(safeGetPathname());

  useEffect(() => {
    const onPop = () => setPathname(safeGetPathname());
    window.addEventListener?.("popstate", onPop);
    return () => window.removeEventListener?.("popstate", onPop);
  }, []);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const firstFocusableRef = useRef<HTMLInputElement | null>(null);

  // prevent body scroll when drawer open
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (drawerOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [drawerOpen]);

  // close on outside click or escape, and focus-trap basic
  useEffect(() => {
    if (!drawerOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setDrawerOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
      if (e.key === "Tab") {
        // basic trap: if no focusable inside, prevent leaving
        const focusables = drawerRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || focusables.length === 0) return;
        const nodes = Array.from(focusables);
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    // auto-focus search input
    setTimeout(() => firstFocusableRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  const navItems = [
    { to: "/jobs", label: "Find Jobs", icon: <IconJobs className="w-5 h-5" /> },
    { to: "/upload", label: "Upload Resume", icon: <IconUpload className="w-5 h-5" /> },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <SafeLink to="/" className="flex items-center gap-3" aria-label="Home">
            <div className="rounded-md bg-gradient-to-r from-yellow-300 to-yellow-500 p-1">
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M3 12h18" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-lg md:text-xl font-bold tracking-tight text-gray-900">RESUMIND</span>
          </SafeLink>

          {/* Desktop nav */}
          <nav className="hidden md:flex md:gap-4 md:items-center" aria-label="Primary">
            <SafeLink to="/jobs" className={`px-3 py-2 rounded-md text-sm font-medium ${pathname.startsWith("/jobs") ? "bg-sky-100 text-sky-800" : "text-gray-700 hover:bg-gray-50"}`}>Find Jobs</SafeLink>
            <SafeLink to="/upload" className={`px-3 py-2 rounded-md text-sm font-medium ${pathname.startsWith("/upload") ? "bg-sky-100 text-sky-800" : "text-gray-700 hover:bg-gray-50"}`}>Upload Resume</SafeLink>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* compact desktop search */}
            <div className="hidden md:flex">
              <form action="/jobs" method="get">
                <label htmlFor="nav-search" className="sr-only">Search jobs</label>
                <div className="relative">
                  <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input id="nav-search" name="q" className="w-48 pl-10 pr-3 py-1 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200" placeholder="Search jobs..." />
                </div>
              </form>
            </div>

            {/* desktop account */}
            <div className="hidden md:flex md:items-center md:gap-2">
              <div className="flex items-center gap-2">
                <AvatarPlaceholder name={displayName} size={36} />
                <div className="text-sm text-gray-700">{isAuthenticated ? (displayName ?? "Account") : "Guest"}</div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                aria-label="Open menu"
                aria-expanded={drawerOpen}
                onClick={() => setDrawerOpen(true)}
                className="inline-flex items-center justify-center h-10 w-10 rounded-md bg-gray-50 hover:bg-gray-100 focus:outline-none"
              >
                <svg className="h-6 w-6 text-gray-700" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (right-side) */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-sm transform transition-transform duration-300 ease-in-out ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal={drawerOpen}
        aria-label="Main menu"
      >
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/40 transition-opacity ${drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          onClick={() => setDrawerOpen(false)}
          aria-hidden
        />

        {/* Panel */}
        <aside
          ref={drawerRef}
          className="relative ml-auto h-full w-full max-w-sm bg-white shadow-xl overflow-y-auto"
        >
          {/* Header inside drawer */}
          <div className="flex items-center justify-between p-4 border-b">
            <SafeLink to="/" onClick={() => setDrawerOpen(false)} className="flex items-center gap-3">
              <div className="rounded-md bg-yellow-300 p-1">
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M3 12h18" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="font-semibold text-gray-900">RESUMIND</span>
            </SafeLink>

            <button aria-label="Close menu" onClick={() => setDrawerOpen(false)} className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-100 focus:outline-none">
              <svg className="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="p-4">
            <label htmlFor="mobile-search" className="sr-only">Search jobs</label>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-md">
                <IconSearch className="w-5 h-5 text-gray-500" />
              </div>
              <input
                id="mobile-search"
                ref={firstFocusableRef}
                name="q"
                placeholder="Search jobs, titles, companies..."
                className="flex-1 rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-200"
                aria-label="Search jobs"
              />
            </div>
          </div>

          {/* Profile card */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-4">
              <AvatarPlaceholder name={displayName} size={56} />
              <div>
                <div className="text-sm font-semibold text-gray-900">{isAuthenticated ? (displayName ?? "Account") : "Welcome"}</div>
                <div className="text-xs text-gray-500">{isAuthenticated ? "View your profile and settings" : "Sign in or create an account"}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {isAuthenticated ? (
                <>
                  <SafeLink to="/profile" onClick={() => setDrawerOpen(false)} className="block text-center px-3 py-2 rounded-md bg-sky-50 text-sky-700 font-medium">Profile</SafeLink>
                  <button onClick={() => { signOut(); setDrawerOpen(false); }} className="block px-3 py-2 rounded-md bg-gray-100 text-gray-800">Sign out</button>
                </>
              ) : (
                <>
                  <button onClick={() => { signIn(); setDrawerOpen(false); }} className="block text-center px-3 py-2 rounded-md bg-sky-600 text-white font-medium">Sign in</button>
                  <SafeLink to="/signup" onClick={() => setDrawerOpen(false)} className="block px-3 py-2 rounded-md bg-gray-100 text-gray-800 text-center">Sign up</SafeLink>
                </>
              )}
            </div>
          </div>

          {/* Nav items */}
          <div className="p-4">
            <nav className="flex flex-col gap-2" aria-label="Mobile primary">
              {navItems.map((it) => (
                <MobileNavItem
                  key={it.to}
                  to={it.to}
                  label={it.label}
                  onClick={() => setDrawerOpen(false)}
                  active={pathname.startsWith(it.to)}
                  icon={it.icon}
                />
              ))}
            </nav>
          </div>

          {/* Footer quick links */}
          <div className="p-4 border-t">
            <div className="flex flex-col gap-2">
              <SafeLink to="/terms" onClick={() => setDrawerOpen(false)} className="text-sm text-gray-600 hover:underline">Terms</SafeLink>
              <SafeLink to="/privacy" onClick={() => setDrawerOpen(false)} className="text-sm text-gray-600 hover:underline">Privacy</SafeLink>
            </div>
            <div className="mt-4 text-xs text-gray-400">© {new Date().getFullYear()} RESUMIND</div>
          </div>
        </aside>
      </div>
    </header>
  );
};

export default Navbar;
