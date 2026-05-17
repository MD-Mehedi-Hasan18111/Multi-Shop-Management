"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, CheckCircle2, AlertOctagon, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!email) {
      setError("No email address provided. Please return to the login or registration page.");
    }
  }, [email]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (!otpCode || otpCode.length !== 6) {
      setError("Please enter a valid 6-digit OTP verification code.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otpCode }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Email verified successfully! Redirecting you to login...");
        setTimeout(() => {
          router.push(`/login?email=${encodeURIComponent(email)}&verified=true`);
        }, 2000);
      } else {
        setError(data.error || "Invalid or expired OTP verification code.");
      }
    } catch (err: any) {
      setError("An error occurred while verifying the code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || cooldown > 0) return;

    setResending(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("A fresh 6-digit verification code has been sent to your email!");
        setCooldown(60); // 60s cooldown
      } else {
        setError(data.error || "Failed to resend verification code.");
      }
    } catch (err: any) {
      setError("An error occurred while resending the code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-24 max-w-md">
      <Card className="rounded-3xl border-none shadow-2xl overflow-hidden bg-white">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 text-center space-y-3">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Mail className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-2xl font-black uppercase tracking-tight">Verify Your Email</CardTitle>
          <CardDescription className="text-white/80 font-medium text-xs">
            We have emailed a 6-digit OTP verification code to:
            <span className="block font-bold text-white mt-1 break-all">{email || "your address"}</span>
          </CardDescription>
        </div>

        <CardContent className="p-8 space-y-6">
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold leading-relaxed">
              <AlertOctagon className="h-5 w-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-700 text-xs font-bold leading-relaxed">
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-green-600" />
              <p>{success}</p>
            </div>
          )}

          {email && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otpCode" className="font-bold text-xs text-zinc-700 uppercase tracking-wide">
                  6-Digit Verification Code (OTP)
                </Label>
                <Input
                  id="otpCode"
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  className="rounded-2xl h-14 text-center text-2xl font-black tracking-[10px] border-zinc-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full h-13 font-bold text-sm rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying Code...
                  </>
                ) : (
                  "Verify & Activate Account"
                )}
              </Button>
            </form>
          )}
        </CardContent>

        {email && (
          <CardFooter className="bg-zinc-50 border-t p-6 flex flex-col items-center gap-3 text-xs text-zinc-500 font-bold">
            <div className="flex items-center gap-1.5">
              <span>Didn't receive the email?</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || cooldown > 0}
                className="text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1 cursor-pointer"
              >
                {resending && <RefreshCw className="h-3 w-3 animate-spin" />}
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
              </button>
            </div>
            <Link href="/login" className="text-zinc-400 hover:text-zinc-600">
              Return to Login
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
