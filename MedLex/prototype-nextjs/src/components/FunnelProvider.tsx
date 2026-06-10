"use client";

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from "react";
import {
  funnelReducer,
  initialFunnelState,
  type FunnelAction,
  type FunnelState,
} from "@/lib/funnel-types";

type FunnelContextValue = {
  state: FunnelState;
  dispatch: React.Dispatch<FunnelAction>;
};

const FunnelContext = createContext<FunnelContextValue | null>(null);

export function FunnelProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(funnelReducer, initialFunnelState);
  return (
    <FunnelContext.Provider value={{ state, dispatch }}>
      {children}
    </FunnelContext.Provider>
  );
}

export function useFunnel() {
  const ctx = useContext(FunnelContext);
  if (!ctx) throw new Error("useFunnel must be used within FunnelProvider");
  return ctx;
}
