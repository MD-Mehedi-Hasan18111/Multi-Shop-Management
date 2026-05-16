"use client";

import { useEffect, useState } from "react";
import AnalyticsDashboard from "@/components/shopkeeper/AnalyticsDashboard";
import TopProducts from "@/components/shopkeeper/TopProducts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Download, Upload, Loader2, Package, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function ShopkeeperDashboard() {
  const today = new Date().toISOString().split('T')[0];
  const lastYear = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(lastYear);
  const [endDate, setEndDate] = useState(today);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/reports/low-stock");
        const data = await res.json();
        setLowStock(data);
      } catch (error) {
        console.error("Failed to fetch low stock alerts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLowStock();
  }, []);

  const handleExport = async () => {
    try {
      setExporting(true);
      const res = await fetch("/api/shopkeeper/products/bulk");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export products");
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const formData = new FormData();
      formData.append("file", file);

      // We use text() to read CSV if we want to send it as text, or send as file
      const csvText = await file.text();

      const res = await fetch("/api/shopkeeper/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "text/csv" },
        body: csvText,
      });

      if (res.ok) {
        alert("Products imported successfully!");
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "Import failed");
      }
    } catch (error) {
      console.error("Import failed:", error);
      alert("Failed to parse file");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header & Global Actions */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-5xl font-black tracking-tight italic uppercase">Store Analytics</h1>
          <p className="text-zinc-500 font-medium">Monitoring your performance from {startDate} to {endDate}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-[2rem] border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-zinc-400" />
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40 h-10 rounded-xl border-none bg-white dark:bg-zinc-800 font-bold"
            />
            <span className="text-zinc-300">to</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40 h-10 rounded-xl border-none bg-white dark:bg-zinc-800 font-bold"
            />
          </div>
          <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-700 mx-2" />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl gap-2 font-bold" onClick={handleExport} disabled={exporting}>
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download size={16} />} CSV Export
            </Button>
            <div className="relative">
              <Button variant="outline" size="sm" className="rounded-xl gap-2 font-bold" disabled={importing}>
                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload size={16} />} CSV Import
              </Button>
              <input
                type="file"
                accept=".csv"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleImport}
                disabled={importing}
              />
            </div>
          </div>
        </div>
      </div>

      <AnalyticsDashboard startDate={startDate} endDate={endDate} />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TopProducts startDate={startDate} endDate={endDate} />
        </div>

        <div className="space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-zinc-200/50 overflow-hidden">
            <CardHeader className="bg-red-50/50 border-b border-red-100 p-8">
              <CardTitle className="text-2xl font-black flex items-center gap-3 text-red-600 italic uppercase">
                <AlertTriangle size={24} />
                Low Stock
              </CardTitle>
              <CardDescription className="font-medium">Items needing immediate attention.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-zinc-300 h-10 w-10" /></div>
              ) : lowStock.length === 0 ? (
                <div className="p-20 text-center text-zinc-400 space-y-4">
                  <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto opacity-50">
                    <Package size={32} />
                  </div>
                  <p className="text-sm font-bold uppercase tracking-widest">Inventory Healthy</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-zinc-50/30">
                    <TableRow>
                      <TableHead className="pl-8 py-5">Product</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="pr-8 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStock.map((product) => (
                      <TableRow key={product._id} className="hover:bg-zinc-50/50 transition-colors border-zinc-100">
                        <TableCell className="font-bold pl-8 py-5">{product.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`rounded-lg px-3 py-1 font-bold ${product.stock <= 2 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                            {product.stock} units
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-8 text-right">
                          <Link href={`/shopkeeper/products/${product._id}`} className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors">
                            Restock
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
