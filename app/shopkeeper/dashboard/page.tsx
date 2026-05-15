"use client";

import AnalyticsDashboard from "@/components/shopkeeper/AnalyticsDashboard";
import TopProducts from "@/components/shopkeeper/TopProducts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Download, Upload } from "lucide-react";
import Link from "next/link";

export default function ShopkeeperDashboard() {
  return (
    <div className="space-y-8 p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-zinc-500">Welcome back! Here's what's happening with your shop.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link 
            href="/api/products/export" 
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <Download size={16} />
            Export Products
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
            <Upload size={16} />
            Bulk Import
          </button>
        </div>
      </div>

      <AnalyticsDashboard />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TopProducts />
        </div>

        <div className="space-y-8">
          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <CardHeader className="bg-destructive/5 border-b border-destructive/10">
              <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                <AlertTriangle size={20} />
                Low Stock Alerts
              </CardTitle>
              <CardDescription>Items needing immediate attention.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Product</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="pr-6 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* These would be fetched from an API in a real scenario */}
                  <TableRow>
                    <TableCell className="font-medium pl-6">Organic Cotton T-Shirt</TableCell>
                    <TableCell><Badge variant="destructive">4 left</Badge></TableCell>
                    <TableCell className="pr-6 text-right font-medium text-blue-600 hover:underline cursor-pointer">Restock</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium pl-6">Ceramic Coffee Mug</TableCell>
                    <TableCell><Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">8 left</Badge></TableCell>
                    <TableCell className="pr-6 text-right font-medium text-blue-600 hover:underline cursor-pointer">Restock</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Link href="/shopkeeper/products/new" className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-center">
                <p className="text-sm font-medium">Add Product</p>
              </Link>
              <Link href="/shopkeeper/coupons" className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-center">
                <p className="text-sm font-medium">Create Coupon</p>
              </Link>
              <Link href="/shopkeeper/orders" className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-center">
                <p className="text-sm font-medium">View Orders</p>
              </Link>
              <Link href="/shopkeeper/reviews" className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-center">
                <p className="text-sm font-medium">Moderate Reviews</p>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

