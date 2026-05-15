"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./ThemeProvider";
import { Provider } from "react-redux";
import { store } from "@/lib/redux/store";
import { CartSyncProvider } from "./CartSyncProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Provider store={store}>
        <CartSyncProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </CartSyncProvider>
      </Provider>
    </SessionProvider>
  );
}
