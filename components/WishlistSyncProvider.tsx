"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";
import { RootState } from "@/lib/redux/store";
import { setWishlist } from "@/lib/redux/wishlistSlice";

export function WishlistSyncProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { data: session } = useSession();

  // Sync DB to Redux on login or load
  useEffect(() => {
    if (session) {
      fetch("/api/wishlist")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.products) {
            const items = data.products.map((p: any) => ({
              id: p._id,
              name: p.name,
              price: p.price,
              image: p.images?.[0] || "",
              slug: p.slug
            }));
            dispatch(setWishlist(items));
          }
        })
        .catch(err => console.error("Error fetching wishlist:", err));
    }
  }, [session, dispatch]);

  return <>{children}</>;
}
