"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Store, 
  Upload, 
  CheckCircle2, 
  Hourglass, 
  AlertOctagon, 
  ShieldCheck,
  Loader2, 
  ArrowRight,
  FileText,
  BadgeAlert
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function BecomeSellerPage() {
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [request, setRequest] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("customer");
  const [hasLoaded, setHasLoaded] = useState(false);

  // Form states
  const [shopName, setShopName] = useState("");
  const [niche, setNiche] = useState("");
  const [nidNumber, setNidNumber] = useState("");
  const [nidImage, setNidImage] = useState("");
  const [productDetails, setProductDetails] = useState("");
  const [error, setError] = useState("");

  const loadStatus = async (showSkeleton = true) => {
    if (showSkeleton) setLoading(true);
    try {
      const res = await fetch("/api/user/become-seller");
      if (res.ok) {
        const data = await res.json();
        setUserRole(data.role);
        setRequest(data.request);

        // Sync NextAuth session role in real-time if role mismatch occurs
        if (data.role && session && (session.user as any)?.role !== data.role) {
          await update({ role: data.role });
        }
      }
    } catch (err) {
      console.error("Failed to load seller status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session && !hasLoaded) {
      setHasLoaded(true);
      loadStatus(true);
    } else if (status === "unauthenticated" && !hasLoaded) {
      setHasLoaded(true);
      setLoading(false);
    }
  }, [session, status, hasLoaded]);

  const handleNidUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError("");
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setNidImage(data.secure_url);
    } catch (err: any) {
      console.error("NID image upload error:", err);
      setError("Failed to upload NID image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !niche || !nidNumber || !nidImage || !productDetails) {
      setError("Please fill out all fields and upload your NID photo");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const res = await fetch("/api/user/become-seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopName,
          niche,
          nidNumber,
          nidImage,
          productDetails,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      await loadStatus();
    } catch (err: any) {
      setError(err.message || "An error occurred while submitting your application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-lg">
        <Card className="rounded-3xl border-none shadow-xl p-8 text-center space-y-6">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Verifying Status...</h3>
            <p className="text-sm text-muted-foreground">Checking your seller application details</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-md text-center space-y-6">
        <BadgeAlert className="h-16 w-16 text-yellow-500 mx-auto" />
        <h1 className="text-3xl font-black">Login Required</h1>
        <p className="text-muted-foreground">
          Please log in to your account to submit a seller application request.
        </p>
        <Link href="/login?callbackUrl=/become-seller">
          <Button size="lg" className="w-full font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
            Log In Now
          </Button>
        </Link>
      </div>
    );
  }

  // Already a seller
  if (userRole === "shopkeeper" || userRole === "admin") {
    return (
      <div className="container mx-auto px-4 py-24 max-w-lg text-center space-y-6">
        <div className="w-20 h-20 bg-green-50 dark:bg-green-950/20 text-green-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
          <ShieldCheck className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-black">You are a Verified Seller!</h1>
        <p className="text-muted-foreground">
          Your account already has full merchant seller privileges. You can manage your storefront, products, and categories directly in the Seller Panel.
        </p>
        <div className="flex gap-4">
          <Link href="/shopkeeper/dashboard" className="flex-1">
            <Button size="lg" className="w-full font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
              Go to Seller Panel
            </Button>
          </Link>
          <Link href="/account" className="flex-1">
            <Button size="lg" variant="outline" className="w-full font-bold rounded-2xl">
              Account Page
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Application is pending
  if (request && request.status === "pending") {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="rounded-3xl border-none shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white p-8 text-center space-y-4">
            <Hourglass className="h-14 w-14 animate-pulse mx-auto" />
            <div className="space-y-1">
              <h2 className="text-3xl font-black uppercase tracking-tight">Application Under Review</h2>
              <p className="opacity-90 font-medium">Your request to become a Seller is being verified by the Administrator.</p>
            </div>
          </div>
          <CardContent className="p-8 space-y-6">
            <div>
              <h3 className="font-bold text-lg mb-4 text-zinc-800">Submitted Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-4 rounded-xl bg-zinc-50 border">
                  <span className="text-xs text-muted-foreground block uppercase font-bold">Proposed Shop Name</span>
                  <span className="font-bold text-base text-zinc-900">{request.shopName}</span>
                </div>
                <div className="p-4 rounded-xl bg-zinc-50 border">
                  <span className="text-xs text-muted-foreground block uppercase font-bold">Product Niche</span>
                  <span className="font-bold text-base text-zinc-900">{request.niche}</span>
                </div>
                <div className="p-4 rounded-xl bg-zinc-50 border md:col-span-2">
                  <span className="text-xs text-muted-foreground block uppercase font-bold">NID / ID Card Number</span>
                  <span className="font-bold text-base text-zinc-900">{request.nidNumber}</span>
                </div>
                <div className="p-4 rounded-xl bg-zinc-50 border md:col-span-2">
                  <span className="text-xs text-muted-foreground block uppercase font-bold">Business / Product Details</span>
                  <p className="text-zinc-700 mt-1">{request.productDetails}</p>
                </div>
              </div>
            </div>

            {request.nidImage && (
              <div>
                <h4 className="font-bold text-sm text-zinc-500 mb-2 uppercase">Uploaded NID / Document</h4>
                <div className="relative w-full h-48 rounded-xl overflow-hidden border">
                  <Image src={request.nidImage} alt="NID Image" fill className="object-cover" />
                </div>
              </div>
            )}

            <div className="border-t pt-6 text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                We have notified the Administrator. You will receive an email notification as soon as your application is reviewed and verified.
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => loadStatus(false)} 
                  variant="outline" 
                  className="px-6 font-bold rounded-2xl border-blue-200 hover:bg-blue-50 text-blue-600 shadow-sm"
                >
                  Refresh Status
                </Button>
                <Link href="/account">
                  <Button variant="outline" className="px-6 font-bold rounded-2xl">
                    Back to Account
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Application was approved (just fallback, should trigger redirect via loadStatus)
  if (request && request.status === "approved") {
    return (
      <div className="container mx-auto px-4 py-24 max-w-lg text-center space-y-6">
        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-black">Application Approved!</h1>
        <p className="text-muted-foreground">
          Congratulations! The administrator has verified your details and upgraded your account. You can now access your merchant options.
        </p>
        <Link href="/shopkeeper/dashboard">
          <Button size="lg" className="w-full font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
            Open Seller Panel <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Card className="rounded-3xl border-none shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 text-center space-y-2">
          <Store className="h-12 w-12 mx-auto" />
          <h1 className="text-3xl font-black uppercase tracking-tight">Become a Verified Seller</h1>
          <p className="opacity-90 text-sm font-medium">Submit your registration details to enable merchant seller panel privileges.</p>
        </div>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold">
                <AlertOctagon className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {request && request.status === "rejected" && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                <AlertOctagon className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-bold">Previous Application Declined</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Your previous seller application was declined. You can adjust your information, upload a clearer NID document, and re-apply.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="shopName" className="font-bold text-zinc-700">Proposed Shop Name</Label>
                <Input
                  id="shopName"
                  placeholder="e.g. Mehedi's Fashion Hub"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="rounded-xl h-11 border-zinc-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="niche" className="font-bold text-zinc-700">Product Category / Niche</Label>
                <Input
                  id="niche"
                  placeholder="e.g. Organic Foods, Menswear, Handicrafts"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="rounded-xl h-11 border-zinc-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nidNumber" className="font-bold text-zinc-700">National ID (NID) / Business Registration Number</Label>
                <Input
                  id="nidNumber"
                  placeholder="e.g. 19961592478000150"
                  value={nidNumber}
                  onChange={(e) => setNidNumber(e.target.value)}
                  className="rounded-xl h-11 border-zinc-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-zinc-700">Upload NID Photo / Verification Document</Label>
                <div className="space-y-4">
                  {nidImage ? (
                    <div className="relative w-full h-48 rounded-xl overflow-hidden border group">
                      <Image src={nidImage} alt="NID Preview" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                        <label className="bg-white text-zinc-950 font-bold px-4 py-2 rounded-xl cursor-pointer hover:bg-zinc-100 active:scale-95 transition">
                          Change Photo
                          <input type="file" className="hidden" accept="image/*" onChange={handleNidUpload} disabled={uploading} />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-2xl p-8 hover:bg-zinc-50 cursor-pointer transition group">
                      <input type="file" className="hidden" accept="image/*" onChange={handleNidUpload} disabled={uploading} />
                      {uploading ? (
                        <>
                          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-2" />
                          <span className="font-bold text-sm text-zinc-600">Uploading verification document...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-10 w-10 text-zinc-400 group-hover:text-blue-500 mb-2 transition" />
                          <span className="font-bold text-sm text-zinc-700 group-hover:text-blue-500 transition">Drag & drop or Click to upload NID card</span>
                          <span className="text-xs text-zinc-400 mt-1">Accepts JPG, PNG, WebP up to 5MB</span>
                        </>
                      )}
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="productDetails" className="font-bold text-zinc-700">Product & Sourcing Details</Label>
                <Textarea
                  id="productDetails"
                  placeholder="Tell us about the products you intend to sell, your sourcing methods, and your business background..."
                  value={productDetails}
                  onChange={(e) => setProductDetails(e.target.value)}
                  className="rounded-xl min-h-[120px] border-zinc-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting || uploading}
              className="w-full h-13 font-bold text-base rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting Application...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
