"use client";

import React, { useEffect, useState } from "react";
import { Package, ArrowUpRight } from "lucide-react";


interface TopProduct {
  _id: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
}

export default function TopProducts() {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const res = await fetch("/api/reports/top-products");
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch top products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  if (loading) {
    return <div className="animate-pulse h-64 bg-zinc-100 dark:bg-zinc-800 rounded-2xl" />;
  }

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Package size={20} className="text-orange-500" />
          Top Selling Products
        </h3>
      </div>

      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={product._id}
            className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-500">
                <Package size={20} />
              </div>
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{product.name}</p>
                <p className="text-xs text-zinc-500">{product.totalQuantity} units sold</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-zinc-900 dark:text-zinc-100">
                BDT {product.totalRevenue.toFixed(2)}
              </p>
              <p className="text-[10px] text-green-500 flex items-center justify-end gap-0.5">
                Revenue <ArrowUpRight size={10} />
              </p>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="text-center py-8 text-zinc-500">
            No sales data available yet.
          </div>
        )}
      </div>
    </div>
  );
}
