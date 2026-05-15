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
          if (data && data.items) {
            dispatch(setCart(data.items));
          }
        })
        .catch(err => console.error("Error fetching cart:", err));
    }
  }, [session, dispatch]);

  // Sync Redux to DB on change
  useEffect(() => {
    if (session) {
      const timer = setTimeout(() => {
        fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: cartItems,
            total: cartItems.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0),
          }),
        });
      }, 1000); // Debounce sync
      return () => clearTimeout(timer);
    }
  }, [cartItems, session]);

  return <>{children}</>;
}
