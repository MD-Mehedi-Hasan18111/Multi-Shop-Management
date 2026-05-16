"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, Package, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function ProductSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=5`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : data.products || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (slug: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/product/${slug}`);
  };

  return (
    <div className="relative flex-1 max-w-md mx-2 sm:mx-4" ref={dropdownRef}>
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
        <Input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-10 py-5 bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-blue-600/20 transition-all text-sm font-medium"
        />
        {query && (
          <button 
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
          >
            <X size={14} className="text-zinc-500" />
          </button>
        )}
      </div>

      {isOpen && (query.length >= 2 || loading) && (
        <div className="absolute top-full mt-3 w-full bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-2">
            {loading ? (
              <div className="p-8 flex flex-col items-center justify-center gap-3 text-zinc-400">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <p className="text-xs font-bold uppercase tracking-widest">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-1">
                {results.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => handleSelect(product.slug)}
                    className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all group text-left"
                  >
                    <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-200 dark:border-zinc-700">
                      {product.images?.[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <Package size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mt-0.5">
                        BDT {product.price.toFixed(2)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center space-y-3">
                <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-300">
                  <Search size={24} />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">No results found</p>
                  <p className="text-xs text-zinc-500">Try searching for something else</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
