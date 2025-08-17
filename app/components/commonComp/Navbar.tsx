// components/commonComp/Navbar.tsx
import React, { useEffect, useRef, useState } from "react";
import { usePuterStore } from "~/lib/puter";

/**
 * SafeLink
 * - Always renders a plain <a href="..."> so SSR & client DOM match (avoids hydration mismatch).
 * - On client click we attempt SPA navigation via history.pushState + dispatch popstate.
 * - Falls back to normal anchor navigation when modifier keys are used or in case of errors.
 *
 * We omit `href` from AnchorHTMLAttributes in the props so we avoid typing conflicts
 * (e.g. different aria-current typing between anchor and Link types).
 */
interface SafeLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}
const SafeLink: React.FC<SafeLinkProps> = ({ to, children, onClick, ...rest }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick();

    // allow normal navigation when modifier keys used or non-left click
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.altKey ||
      e.ctrlKey ||
      e.shiftKey ||
      (e.currentTarget.getAttribute("target") || "").length > 0
    ) {
      return;
    }

    // Attempt SPA navigation using history API. Keep href for SSR/non-JS fallback.
    try {
      e.preventDefault();
      const url = to;
      const current = window.location.pathname + window.location.search + window.location.hash;
      if (url !== current) {
        window.history.pushState({}, "", url);
        window.dispatchEvent(new PopStateEvent("popstate"));
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      // If anything goes wrong, just let the browser handle the anchor
    }
  };

  return (
    <a href={to} onClick={handleClick} {...(rest as any)}>
      {children}
    </a>
  );
};

/* -------------------------
   Auth helper (uses your store)
   ------------------------- */
const useAuth = () => {
  const { auth } = usePuterStore();
  const isAuthenticated = !!auth?.isAuthenticated;
  const signIn = auth?.signIn || (async () => {});
  const signOut = auth?.signOut || (async () => {});
  const user: any = auth?.user || null;
  return { isAuthenticated, signIn, signOut, user };
};

/* -------------------------
   Small presentational helpers
   ------------------------- */
const AvatarPlaceholder: React.FC<{ name?: string; size?: number }> = ({ name, size = 40 }) => {
  const initials =
    (name || "")
      .split(" ")
      .map((p) => (p ? p[0] : ""))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "R";
  return (
    <div
      className="inline-flex items-center justify-center bg-gray-100 text-gray-800 rounded-full flex-shrink-0"
      style={{ width: size, height: size, fontSize: Math.max(10, Math.floor(size / 2.8)) }}
      aria-hidden
    >
      {initials}
    </div>
  );
};

const IconSearch: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Safely derive a display name from various possible user shapes */
const getDisplayName = (user: any): string | null => {
  if (!user) return null;
  // prefer username from your PuterUser, fallback to common fields if available
  return (user.username ?? user.name ?? user.fullName ?? user.displayName ?? user.email) || null;
};

/* -------------------------
   Navbar component
   ------------------------- */
const Navbar: React.FC = () => {
  const { isAuthenticated, signIn, signOut, user } = useAuth();
  const displayName = getDisplayName(user);

  // clientPath is null during SSR. Set on mount to avoid hydration mismatch.
  const [clientPath, setClientPath] = useState<string | null>(null);
  useEffect(() => {
    setClientPath(typeof window !== "undefined" ? window.location.pathname : "/");
    const onPop = () => setClientPath(window.location?.pathname ?? "/");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // mobile drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  // desktop profile menu
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (drawerOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [drawerOpen]);

  // Close drawer/profile on outside click & keyboard, trap focus in drawer
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (drawerOpen && drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setDrawerOpen(false);
      }
      if (profileOpen && profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        setProfileOpen(false);
      }
      if (e.key === "Tab" && drawerOpen && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const nodes = Array.from(focusable);
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
    // autofocus first field in drawer
    if (drawerOpen) setTimeout(() => firstInputRef.current?.focus(), 50);

    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen, profileOpen]);

  const navItems = [
    { to: "/jobs", label: "Find Jobs" },
    { to: "/upload", label: "Upload Resume" },
  ];

  const activeClass = (to: string) => (clientPath ? (clientPath.startsWith(to) ? "bg-sky-100 text-sky-800" : "") : "");

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
          <nav className="hidden md:flex md:gap-3 md:items-center" aria-label="Primary">
            <SafeLink to="/jobs" className={`px-3 py-2 rounded-md text-sm font-medium ${activeClass("/jobs")}`}>Find Jobs</SafeLink>
            <SafeLink to="/upload" className={`px-3 py-2 rounded-md text-sm font-medium ${activeClass("/upload")}`}>Upload Resume</SafeLink>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Compact search on desktop */}
            <div className="hidden md:flex items-center">
              <form action="/jobs" method="get" className="relative">
                <label htmlFor="nav-search" className="sr-only">Search jobs</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <IconSearch className="w-4 h-4" />
                  </span>
                  <input
                    id="nav-search"
                    name="q"
                    className="w-48 pl-10 pr-3 py-1 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                    placeholder="Search jobs..."
                    aria-label="Search jobs"
                  />
                </div>
              </form>
            </div>

            {/* Desktop account: avatar + dropdown */}
            <div className="hidden md:flex items-center gap-3 relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((s) => !s)}
                aria-haspopup="true"
                aria-expanded={profileOpen}
                className="inline-flex items-center gap-3 px-3 py-1 rounded-md hover:bg-gray-50 focus:outline-none"
              >
                <AvatarPlaceholder name={displayName ?? undefined} size={36} />
                <div className="text-sm text-gray-700">{isAuthenticated ? (displayName ?? "Account") : "Guest"}</div>
                <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {profileOpen && (
                <div role="menu" aria-label="Account menu" className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-md shadow-lg py-2">
                  {isAuthenticated ? (
                    <>
                      <SafeLink to="/profile" onClick={() => setProfileOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</SafeLink>
                      <button
                        onClick={async () => {
                          await signOut();
                          setProfileOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={async () => {
                          await signIn();
                          setProfileOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Sign in
                      </button>
                      <SafeLink to="/signup" onClick={() => setProfileOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Sign up</SafeLink>
                    </>
                  )}
                </div>
              )}
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
        className={`h-screen fixed inset-y-0 right-0 z-50 flex w-full max-w-sm transform transition-transform duration-300 ease-in-out ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
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
        <aside ref={drawerRef} className="relative ml-auto h-full w-full max-w-sm bg-white shadow-xl overflow-y-auto">
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
                ref={firstInputRef}
                name="q"
                placeholder="Search jobs, titles, companies..."
                className="flex-1 rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-200"
                aria-label="Search jobs"
              />
            </div>
          </div>

          {/* Profile + actions */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-4">
              <AvatarPlaceholder name={displayName ?? undefined} size={56} />
              <div>
                <div className="text-sm font-semibold text-gray-900">{isAuthenticated ? (displayName ?? "Account") : "Welcome"}</div>
                <div className="text-xs text-gray-500">{isAuthenticated ? "View your profile and settings" : "Sign in or create an account"}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {isAuthenticated ? (
                <>
                  <SafeLink to="/profile" onClick={() => setDrawerOpen(false)} className="block text-center px-3 py-2 rounded-md bg-sky-50 text-sky-700 font-medium">Profile</SafeLink>
                  <button onClick={async () => { await signOut(); setDrawerOpen(false); }} className="block px-3 py-2 rounded-md bg-gray-100 text-gray-800">Sign out</button>
                </>
              ) : (
                <>
                  <button onClick={async () => { await signIn(); setDrawerOpen(false); }} className="block text-center px-3 py-2 rounded-md bg-sky-600 text-white font-medium">Sign in</button>
                  <SafeLink to="/signup" onClick={() => setDrawerOpen(false)} className="block px-3 py-2 rounded-md bg-gray-100 text-gray-800 text-center">Sign up</SafeLink>
                </>
              )}
            </div>
          </div>

          {/* Nav items */}
          <div className="p-4">
            <nav className="flex flex-col gap-2" aria-label="Mobile primary">
              {navItems.map((it) => (
                <SafeLink
                  key={it.to}
                  to={it.to}
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg ${clientPath && clientPath.startsWith(it.to) ? "bg-sky-50 text-sky-800" : "text-gray-800 hover:bg-gray-50"}`}
                >
                  <span className="text-base font-medium">{it.label}</span>
                </SafeLink>
              ))}
            </nav>
          </div>

          {/* Footer */}
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
