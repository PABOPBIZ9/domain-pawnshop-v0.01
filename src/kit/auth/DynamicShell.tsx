"use client";
import { useEffect, type ReactNode } from "react";
import { DynamicContextProvider, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";
import type { AuthState, AuthUser } from "./auth";

function Bridge({ onState }: { onState: (s: AuthState) => void }) {
  const { user, primaryWallet, setShowAuthFlow, handleLogOut, sdkHasLoaded } = useDynamicContext();
  useEffect(() => {
    const u: AuthUser | null = user
      ? {
          id: user.userId ?? primaryWallet?.address ?? "user",
          handle: user.username || user.alias || (user.email ? user.email.split("@")[0] : "") || (primaryWallet ? `${primaryWallet.address.slice(0, 6)}…` : "player"),
          email: user.email ?? undefined,
          wallet: primaryWallet?.address,
          chain: primaryWallet?.chain,
        }
      : null;
    onState({
      configured: true,
      ready: !!sdkHasLoaded,
      user: u,
      open: () => setShowAuthFlow(true),
      logout: () => { void handleLogOut(); },
      pay: primaryWallet ? (amount, toAddress) => primaryWallet.sendBalance({ amount, toAddress }) : undefined,
    });
  }, [user, primaryWallet, setShowAuthFlow, handleLogOut, sdkHasLoaded, onState]);
  return null;
}

export default function DynamicShell({ envId, appName, onState, children }: { envId: string; appName: string; onState: (s: AuthState) => void; children: ReactNode }) {
  return (
    <DynamicContextProvider settings={{ environmentId: envId, appName, walletConnectors: [EthereumWalletConnectors, SolanaWalletConnectors] }}>
      <Bridge onState={onState} />
      {children}
    </DynamicContextProvider>
  );
}
