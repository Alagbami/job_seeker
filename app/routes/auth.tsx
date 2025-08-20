// import {usePuterStore} from "~/lib/puter";
// import {useEffect} from "react";
// import {Link, useLocation, useNavigate} from "react-router";

// export const meta = () => ([
//     { title: 'Resumind | Auth' },
//     { name: 'description', content: 'Log into your account' },
// ])

// const Auth = () => {
//     const { isLoading, auth } = usePuterStore();
//     const location = useLocation();
//     const next = location.search.split('next=')[1];
//     const navigate = useNavigate();

//     useEffect(() => {
//         if(auth.isAuthenticated) navigate(next);
//     }, [auth.isAuthenticated, next])

//     return (
//         <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center">
//             <div className="gradient-border shadow-lg">
//                 {/* <Link to="/" className="absolute top-4 left-4">
//                     <img src="/images/logo.svg" alt="logo" className="w-10 h-10" />
//                 </Link> */}
//                 <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
//                     <div className="flex flex-col items-center gap-2 text-center">
//                         <h1>Welcome</h1>
//                         <h2>Log In to Continue Your Job Journey</h2>
//                     </div>
//                     <div>
//                         {isLoading ? (
//                             <button className="auth-button animate-pulse">
//                                 <p>Signing you in...</p>
//                             </button>
//                         ) : (
//                             <>
//                                 {auth.isAuthenticated ? (
//                                     <button className="auth-button" onClick={auth.signOut}>
//                                         <p>Log Out</p>
//                                     </button>
//                                 ) : (
//                                     <button className="auth-button" onClick={auth.signIn}>
//                                         <p>Log In</p>
//                                     </button>
//                                 )}
//                             </>
//                         )}
//                     </div>
//                 </section>
//             </div>
//         </main>
//     )
// }

// export default Auth

// app/routes/auth.tsx
import React, { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { Link, useLocation, useNavigate } from "react-router";

export const meta = () => [
  { title: "Resumind | Auth" },
  { name: "description", content: "Log into your account" },
];

const spinner = (
  <svg className="animate-spin h-4 w-4 inline-block" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
    <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const SocialButton: React.FC<{
  provider: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}> = ({ provider, label, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-200"
    aria-label={`Sign in with ${label}`}
  >
    {/* provider icon placeholders */}
    <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-white">
      {provider === "google" ? (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M21 12.3c0-.8-.1-1.6-.4-2.3H12v4.3h5.5c-.2 1.3-.9 2.4-1.9 3.2v2.6h3.1C20.2 18.1 21 15.4 21 12.3z" fill="#4285F4" />
        </svg>
      ) : (
        // github icon
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 2C7.6 2 4 5.6 4 10c0 3.5 2.3 6.5 5.5 7.6.4.1.6-.2.6-.5v-1.9c-2.2.5-2.7-1-2.7-1-.4-1-1.1-1.3-1.1-1.3-.9-.6.1-.6.1-.6 1 .1 1.6 1 1.6 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.7-1.4-1.7-.2-3.5-.9-3.5-4 0-.9.3-1.6.8-2.2-.1-.2-.4-1 .1-2 0 0 .7-.2 2.3.8a7.7 7.7 0 012 0c1.6-1 2.3-.8 2.3-.8.5 1 .2 1.8.1 2 .5.6.8 1.3.8 2.2 0 3.1-1.8 3.7-3.5 3.9.4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5C17.7 16.5 20 13.5 20 10c0-4.4-3.6-8-8-8z" fill="#111" />
        </svg>
      )}
    </span>
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const Auth: React.FC = () => {
  const { isLoading, auth, init, error: storeError } = usePuterStore();
  const location = useLocation();
  const navigate = useNavigate();

  // try read ?next= after route (supports both ?next=... and ?next=...&...)
  const qs = typeof location.search === "string" ? location.search : "";
  const nextParam = (() => {
    const m = qs.match(/[?&]next=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : "/jobs";
  })();

  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [magicSent, setMagicSent] = useState(false);

  // initialize puter & auth check
  useEffect(() => {
    init();
  }, [init]);

  // if already signed in elsewhere, redirect
  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate(nextParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.isAuthenticated]);

  // clear local error when store error changes
  useEffect(() => {
    if (storeError) setLocalError(storeError);
  }, [storeError]);

  const trySignIn = async (provider?: string) => {
    setLocalError(null);
    setMagicSent(false);
    setBusy(true);

    try {
      // Prefer using the runtime puter object if it supports provider param:
      const runtimePuter = (typeof window !== "undefined" ? (window as any).puter : null);
      if (provider && runtimePuter?.auth?.signIn) {
        // attempt to call provider-aware signIn(provider) — if the platform supports it
        try {
          await runtimePuter.auth.signIn(provider);
        } catch {
          // fall back to store auth.signIn below
          await auth.signIn();
        }
      } else {
        // fallback: call the store-exposed signIn (your puter wrapper)
        await auth.signIn();
      }

      // ensure the store refreshes user state (the store functions do this, but double-check)
      await auth.checkAuthStatus?.();

      // if signed in now — navigate
      if (auth.isAuthenticated) {
        navigate(nextParam);
      } else {
        // Signed-in not detected — still redirect? No, show message
        setLocalError("Sign-in completed but authentication wasn't detected. Please refresh or try again.");
      }
    } catch (err: any) {
      const msg = err?.message || "Sign-in failed — please try again.";
      setLocalError(msg);
    } finally {
      setBusy(false);
    }
  };

  const handlePasswordless = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLocalError(null);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError("Please enter a valid email address.");
      return;
    }

    setBusy(true);

    try {
      // Best-effort: if the runtime Puter API supports a magic-link flow, call it (non-standard).
      const runtimePuter = (typeof window !== "undefined" ? (window as any).puter : null);
      if (runtimePuter?.auth?.requestMagicLink) {
        await runtimePuter.auth.requestMagicLink({ email });
        setMagicSent(true);
      } else {
        // If the Puter runtime doesn't expose magic-link, fall back to the generic signIn()
        // (note: this will likely open the provider sign-in flow; implement magic-link server-side to fully support)
        await auth.signIn();
        // If signIn completes and user is authenticated, we navigate in effect above
        setMagicSent(true);
      }
    } catch (err: any) {
      setLocalError(err?.message || "Unable to start passwordless flow. Try another sign-in method.");
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    setBusy(true);
    try {
      await auth.signOut();
      navigate("/");
    } catch (err: any) {
      setLocalError(err?.message || "Sign out failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[url('/images/bg-auth.svg')] bg-cover flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <section className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-sm text-gray-500">Sign in to continue your job journey</p>
          </div>

          {/* status / errors for screen readers */}
          <div className="mt-4" role="status" aria-live="polite">
            { (busy || isLoading) ? (
              <div className="text-sm text-gray-600 flex items-center gap-2">
                {spinner} <span>Processing…</span>
              </div>
            ) : null }
            {magicSent && !localError && (
              <div className="text-sm text-green-600">Magic link sent — check your email.</div>
            )}
            {localError && (
              <div className="mt-2 text-sm text-red-600">{localError}</div>
            )}
          </div>

          {/* Social sign-in */}
          <div className="mt-6 grid gap-3">
            <SocialButton provider="google" label="Continue with Google" onClick={() => trySignIn("google")} disabled={busy || isLoading} />
            <SocialButton provider="github" label="Continue with GitHub" onClick={() => trySignIn("github")} disabled={busy || isLoading} />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <div className="text-xs text-gray-400">or</div>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Passwordless form */}
          <form onSubmit={handlePasswordless} className="mt-6 grid gap-3">
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-200"
              aria-label="Email for magic link"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={busy || isLoading}
                className="flex-1 px-4 py-2 rounded-md bg-sky-600 text-white font-medium hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {busy ? <> {spinner} Sending…</> : "Send sign-in link"}
              </button>

              <button
                type="button"
                onClick={() => { setEmail(""); setLocalError(null); }}
                className="px-3 py-2 rounded-md bg-gray-100"
              >
                Reset
              </button>
            </div>
          </form>

          {/* fallback manual login / sign out */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-gray-600">
              Need help? <Link to="/support" className="text-sky-600 hover:underline">Contact Support</Link>
            </div>

            <div className="flex gap-3">
              {auth.isAuthenticated ? (
                <>
                  <button onClick={signOut} disabled={busy || isLoading} className="px-4 py-2 rounded-md bg-gray-100">
                    Sign out
                  </button>
                  <Link to="/profile" className="px-4 py-2 rounded-md bg-sky-50 text-sky-700">View profile</Link>
                </>
              ) : (
                <button
                  onClick={() => trySignIn()}
                  disabled={busy || isLoading}
                  className="px-4 py-2 rounded-md bg-white border"
                >
                  Use default sign-in
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Auth;
