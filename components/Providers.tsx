"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./ThemeProvider";
import { Provider } from "react-redux";
import { store } from "@/lib/redux/store";
import { CartSyncProvider } from "./CartSyncProvider";
import { WishlistSyncProvider } from "./WishlistSyncProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Provider store={store}>
        <CartSyncProvider>
          <WishlistSyncProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </WishlistSyncProvider>
        </CartSyncProvider>
      </Provider>
    </SessionProvider>
  );
}
