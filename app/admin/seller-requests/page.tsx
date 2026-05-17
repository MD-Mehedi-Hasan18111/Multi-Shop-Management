"use client";

import { use, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  User,
  Mail,
  FileText,
  Check,
  X,
  Eye,
  ShieldAlert,
  Loader2,
  Calendar,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Image from "next/image";

export default function AdminSellerRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  // NID Image Preview Dialog state
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewRequest, setPreviewRequest] = useState<any | null>(null);

  const loadRequests = async (showSkeleton = true) => {
    if (showSkeleton) setLoading(true);
    try {
      const res = await fetch("/api/admin/seller-requests");
      if (res.ok) {
        setRequests(await res.json());
      }
    } catch (err) {
      console.error("Failed to load requests:", err);
    } finally {
      if (showSkeleton) setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const [clickStat, setClickStat] = useState<'approved' | 'rejected' | null>(null);
  const handleAction = async (requestId: string, action: "approved" | "rejected") => {
    try {
      setProcessingId(requestId);
      const res = await fetch("/api/admin/seller-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });

      if (res.ok) {
        // Refresh local status
        const data = await res.json();
        setRequests((current) =>
          current.map((req) => (req._id === requestId ? { ...req, status: action } : req))
        );
        if (previewRequest?._id === requestId) {
          setPreviewRequest(null);
        }
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to process request");
      }
    } catch (err) {
      console.error("Action error:", err);
      alert("An error occurred while processing this request.");
    } finally {
      setProcessingId(null);
      setClickStat(null);
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (filter === "all") return true;
    return req.status === filter;
  });

  return (
    <div className="grid gap-6 md:gap-8 max-w-6xl mx-auto p-4 sm:p-6 pb-24">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight italic uppercase text-zinc-900">Seller Verification</h1>
          <p className="text-zinc-500 text-sm font-medium">Verify customer seller applications, review NID documents, and upgrade merchant privileges.</p>
        </div>
        <Button
          onClick={() => loadRequests(false)}
          variant="outline"
          className="rounded-xl px-4 py-2 font-bold text-xs shadow-sm hover:scale-[1.02] transition shrink-0 border-zinc-200 hover:bg-zinc-50"
        >
          Refresh Data
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 border-b pb-4">
        {(["pending", "approved", "rejected", "all"] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            onClick={() => setFilter(status)}
            className="rounded-xl px-4 py-2 font-bold capitalize text-xs shadow-sm hover:scale-[1.02] transition"
          >
            {status}
            {status === "pending" && requests.filter((r) => r.status === "pending").length > 0 && (
              <Badge className="ml-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full px-1.5 py-0.5 text-[10px] font-black">
                {requests.filter((r) => r.status === "pending").length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-sm text-zinc-500 font-bold">Fetching seller applications...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <Card className="rounded-3xl border-dashed p-16 text-center space-y-4">
          <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto text-zinc-400">
            <Store className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold">No Applications Found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              There are no seller applications matching the "{filter}" status filter.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRequests.map((req) => (
            <Card key={req._id} className="rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition duration-300 border-zinc-200">
              <CardHeader className="p-6 bg-zinc-50 border-b flex flex-row items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider block">Proposed Shop</span>
                  <CardTitle className="text-lg font-bold text-zinc-900">{req.shopName}</CardTitle>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{req.niche}</span>
                  </div>
                </div>
                <Badge
                  variant={
                    req.status === "approved"
                      ? "secondary"
                      : req.status === "rejected"
                        ? "destructive"
                        : "default"
                  }
                  className="rounded-full font-black text-[10px] px-2.5 py-0.5 uppercase tracking-wide"
                >
                  {req.status}
                </Badge>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* User Info */}
                <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center overflow-hidden shrink-0 border">
                    {req.user?.avatar ? (
                      <img src={req.user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-zinc-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-zinc-900 truncate">{req.user?.name || "Customer"}</p>
                    <div className="flex items-center gap-1 text-xs text-zinc-500 truncate">
                      <Mail className="w-3 h-3" />
                      <span>{req.user?.email}</span>
                    </div>
                  </div>
                </div>

                {/* Document details */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2.5 rounded-xl bg-zinc-50 border">
                    <span className="text-zinc-500 font-bold">NID / Document Number:</span>
                    <span className="font-black text-zinc-900">{req.nidNumber}</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-zinc-50 border">
                    <span className="text-zinc-500 font-bold">Submitted Date:</span>
                    <div className="flex items-center gap-1 font-bold text-zinc-800">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Product sourcing description */}
                <div className="p-4 rounded-2xl bg-zinc-50 border text-xs">
                  <span className="text-[10px] text-zinc-400 font-black uppercase tracking-wider block mb-1">Products & Sourcing details</span>
                  <p className="text-zinc-700 leading-relaxed italic">"{req.productDetails}"</p>
                </div>

                {/* NID Document View Button */}
                {req.nidImage && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPreviewRequest(req);
                      setPreviewImage(req.nidImage);
                    }}
                    className="w-full rounded-2xl h-10 font-bold text-xs flex items-center justify-center gap-1 bg-white hover:bg-zinc-50 border-zinc-200 shadow-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View Uploaded ID Photo
                  </Button>
                )}

                {/* Actions */}
                {req.status === "pending" && (
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => handleAction(req._id, "approved")}
                      disabled={processingId !== null}
                      className="flex-1 rounded-2xl h-11 font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20 text-xs flex items-center justify-center gap-1"
                    >
                      {processingId === req._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Approve as Seller
                    </Button>
                    <Button
                      onClick={() => handleAction(req._id, "rejected")}
                      disabled={processingId !== null}
                      variant="outline"
                      className="flex-1 rounded-2xl h-11 font-bold text-destructive hover:bg-destructive/10 border-destructive/20 text-xs flex items-center justify-center gap-1"
                    >
                      {processingId === req._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ID Photo Viewer Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-3xl rounded-3xl p-6 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Seller Document Verification
            </DialogTitle>
            <DialogDescription>
              Review NID / document photo submitted by {previewRequest?.user?.name || "Customer"}
            </DialogDescription>
          </DialogHeader>
          {previewImage && (
            <div className="relative w-full h-[350px] md:h-[450px] rounded-2xl overflow-hidden border bg-zinc-950 mt-4 flex items-center justify-center">
              <img src={previewImage} alt="NID Verification Document" className="max-w-full max-h-full object-contain" />
            </div>
          )}
          {previewRequest && previewRequest.status === "pending" && (
            <div className="flex gap-4 pt-4 border-t mt-4">
              <Button
                onClick={() => {
                  handleAction(previewRequest._id, "approved");
                  setClickStat("approved");
                }}
                disabled={processingId !== null}
                className="flex-1 rounded-2xl h-12 font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20"
              >
                {processingId === previewRequest._id && clickStat === "approved" ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  "Approve Seller Application"
                )}
              </Button>
              <Button
                onClick={() => {
                  handleAction(previewRequest._id, "rejected");
                  setClickStat("rejected");
                }}
                disabled={processingId !== null}
                variant="outline"
                className="flex-1 rounded-2xl h-12 font-bold text-destructive hover:bg-destructive/10 border-destructive/20"
              >
                {processingId === previewRequest._id && clickStat === "rejected" ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  "Reject"
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
