"use client";
/**
 * DOU kit auth: Dynamic.xyz login (email + social + EVM/Solana wallets).
 * The Dynamic SDK is lazy-loaded ONLY when NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID is set.
 * Without it, <AuthButton/> still renders and shows a friendly "Login opening soon" state.
 */
import { createContext, lazy, Suspense, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export const DYNAMIC_ENV_ID = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID ?? "";

export type AuthUser = { id: string; handle: string; email?: string; avatar?: string; wallet?: string; chain?: string };
export type AuthState = {
  configured: boolean;
  ready: boolean;
  user: AuthUser | null;
  open: () => void;
  logout: () => void;
  /** Send native token from the connected wallet (only used when crypto payments are enabled). */
  pay?: (amount: string, toAddress: string) => Promise<string | undefined>;
};
const noop = () => {};
export const AuthCtx = createContext<AuthState>({ configured: false, ready: true, user: null, open: noop, logout: noop });
export const useAuth = () => useContext(AuthCtx);

const DynamicShell = lazy(() => import("./DynamicShell"));

/** Links the signed-in Dynamic user to the existing local profile (localStorage), so points/badges carry over. */
function useLinkLocal(user: AuthUser | null, onLink?: (u: AuthUser | null) => void) {
  useEffect(() => {
    try {
      if (user) localStorage.setItem("dou.auth.user", JSON.stringify(user));
      else localStorage.removeItem("dou.auth.user");
    } catch {}
    onLink?.(user);
  }, [user, onLink]);
}

export function AuthProvider({ children, appName, onLink }: { children: ReactNode; appName: string; onLink?: (u: AuthUser | null) => void }) {
  const [state, setState] = useState<AuthState>({ configured: !!DYNAMIC_ENV_ID, ready: !DYNAMIC_ENV_ID, user: null, open: noop, logout: noop });
  useLinkLocal(state.user, onLink);
  if (!DYNAMIC_ENV_ID) return <AuthCtx.Provider value={state}>{children}</AuthCtx.Provider>;
  return (
    <Suspense fallback={<AuthCtx.Provider value={state}>{children}</AuthCtx.Provider>}>
      <DynamicShell envId={DYNAMIC_ENV_ID} appName={appName} onState={setState}>
        <AuthCtx.Provider value={state}>{children}</AuthCtx.Provider>
      </DynamicShell>
    </Suspense>
  );
}

export type AuthLabels = { login: string; soon: string; soonBody: string; logout: string; account: string };
export const AUTH_EN: AuthLabels = {
  login: "Log in / Sign up",
  soon: "Login opening soon",
  soonBody: "Email, social and wallet login are almost ready. Your points and badges are saved on this device in the meantime.",
  logout: "Log out",
  account: "Account",
};

/** Header button: Log in / Sign up → Dynamic modal; avatar + handle + logout when signed in. */
export function AuthButton({ labels = AUTH_EN, className = "" }: { labels?: AuthLabels; className?: string }) {
  const a = useAuth();
  const [pop, setPop] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!pop) return;
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setPop(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [pop]);
  if (a.user) {
    return (
      <div ref={ref} className={`auth-wrap ${className}`}>
        <button type="button" className="auth-btn auth-user" onClick={() => setPop((v) => !v)} aria-expanded={pop} aria-label={labels.account}>
          {a.user.avatar ? <img src={a.user.avatar} alt="" className="auth-av" /> : <span className="auth-av auth-av-txt">{a.user.handle.slice(0, 1).toUpperCase()}</span>}
          <span className="auth-handle">{a.user.handle}</span>
        </button>
        {pop && (
          <div className="auth-pop" role="menu">
            <div className="auth-pop-name">{a.user.handle}</div>
            {a.user.email ? <div className="auth-pop-sub">{a.user.email}</div> : null}
            {a.user.wallet ? <div className="auth-pop-sub">{a.user.wallet.slice(0, 6)}…{a.user.wallet.slice(-4)}</div> : null}
            <button type="button" className="auth-btn auth-out" onClick={() => { setPop(false); a.logout(); }}>{labels.logout}</button>
          </div>
        )}
      </div>
    );
  }
  return (
    <div ref={ref} className={`auth-wrap ${className}`}>
      <button type="button" className="auth-btn auth-login" onClick={() => (a.configured && a.ready ? a.open() : setPop((v) => !v))}>
        {labels.login}
      </button>
      {pop && !a.configured && (
        <div className="auth-pop" role="dialog" aria-label={labels.soon}>
          <div className="auth-pop-name">🔐 {labels.soon}</div>
          <div className="auth-pop-sub">{labels.soonBody}</div>
        </div>
      )}
    </div>
  );
}
