"use client";

import React, { useEffect, useState } from "react";
import { Ticket, Plus, Trash2, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Coupon {
  _id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export default function CouponManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    type: "percentage",
    value: 0,
    expiryDate: "",
    usageLimit: 0
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/coupons");
      const data = await res.json();
      setCoupons(data);
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const createCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCoupon),
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons([data, ...coupons]);
        setIsDialogOpen(false);
        setNewCoupon({ code: "", type: "percentage", value: 0, expiryDate: "", usageLimit: 0 });
      }
    } catch (error) {
      console.error("Failed to create coupon:", error);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Ticket size={32} className="text-blue-500" />
            Coupons & Discounts
          </h1>
          <p className="text-zinc-500">Create and manage discount codes for your customers.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-blue-500/20">
              <Plus size={20} />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">New Discount Code</DialogTitle>
            </DialogHeader>
            <form onSubmit={createCoupon} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. SUMMER25"
                  className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent uppercase font-bold tracking-widest outline-none focus:ring-2 focus:ring-blue-500"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <select 
                    className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent outline-none"
                    value={newCoupon.type}
                    onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value as any })}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Value ({newCoupon.type === "percentage" ? "%" : "$"})</label>
                  <input
                    type="number"
                    required
                    className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent outline-none"
                    value={newCoupon.value}
                    onChange={(e) => setNewCoupon({ ...newCoupon, value: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Expiry Date</label>
                <input
                  type="date"
                  required
                  className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent outline-none"
                  value={newCoupon.expiryDate}
                  onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Usage Limit (0 for unlimited)</label>
                <input
                  type="number"
                  className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent outline-none"
                  value={newCoupon.usageLimit}
                  onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: Number(e.target.value) })}
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl mt-4">
                Create Coupon
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50/50 dark:bg-zinc-800/50">
              <TableHead className="pl-6">Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead className="pr-6 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               [1, 2, 3].map(i => <TableRow key={i} className="animate-pulse h-16 bg-zinc-50/50" />)
            ) : coupons.map((coupon) => (
              <TableRow key={coupon._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <TableCell className="pl-6 font-black tracking-widest text-blue-600">{coupon.code}</TableCell>
                <TableCell className="capitalize">{coupon.type}</TableCell>
                <TableCell className="font-bold">
                  {coupon.type === "percentage" ? `${coupon.value}%` : `$${coupon.value}`}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{coupon.usedCount}</span>
                    <span className="text-zinc-400">/</span>
                    <span className="text-zinc-500 text-sm">{coupon.usageLimit === 0 ? "∞" : coupon.usageLimit}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <Calendar size={14} />
                    {new Date(coupon.expiryDate).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <Badge className={coupon.isActive ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}>
                    {coupon.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
