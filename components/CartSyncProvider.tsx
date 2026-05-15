"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";
import { RootState } from "@/lib/redux/store";
import { setCart } from "@/lib/redux/cartSlice";

export function CartSyncProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  // Sync DB to Redux on login
  useEffect(() => {
    if (session) {
      fetch("/api/cart")
        .then((res) => res.json())
        .then((data) => {
          if (data.items && data.items.length > 0) {
            dispatch(setCart(data.items));
          }
        });
    }
  }, [session, dispatch]);

  // Sync Redux to DB on change
  useEffect(() => {
    if (session && cartItems.length > 0) {
      const timer = setTimeout(() => {
        fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: cartItems,
            total: cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
          }),
        });
      }, 2000); // Debounce sync
      return () => clearTimeout(timer);
    }
  }, [cartItems, session]);

  return <>{children}</>;
}
