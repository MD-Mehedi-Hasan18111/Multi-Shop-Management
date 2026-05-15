"use client";

import React, { useEffect, useState } from "react";
import { Check, X, MessageSquare, Star, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Review {
  _id: string;
  user: { name: string };
  product: { name: string };
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export default function ModerateReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      // Assuming admin/shopkeeper can see all reviews via this endpoint
      const res = await fetch("/api/reviews/moderate"); // I should create this endpoint or update existing GET
      const data = await res.json();
      setReviews(data);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const moderateReview = async (id: string, isApproved: boolean) => {
    try {
      await fetch(`/api/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved }),
      });
      setReviews((prev) =>
        prev.map((r) => (r._id === id ? { ...r, isApproved } : r))
      );
    } catch (error) {
      console.error("Failed to moderate review:", error);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (error) {
      console.error("Failed to delete review:", error);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MessageSquare size={32} className="text-blue-500" />
          Moderate Reviews
        </h1>
        <p className="text-zinc-500">Approve or reject customer reviews before they go public.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50/50 dark:bg-zinc-800/50">
              <TableHead className="pl-6">Product</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="w-[40%]">Comment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [1, 2, 3, 4, 5].map(i => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell colSpan={6} className="h-16 bg-zinc-50/50" />
                </TableRow>
              ))
            ) : reviews.map((review) => (
              <TableRow key={review._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <TableCell className="font-bold pl-6">{review.product.name}</TableCell>
                <TableCell>{review.user.name}</TableCell>
                <TableCell>
                  <div className="flex text-yellow-400">
                    <Star size={14} fill="currentColor" />
                    <span className="ml-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">{review.rating}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-zinc-600 dark:text-zinc-400">
                  {review.comment}
                </TableCell>
                <TableCell>
                  {review.isApproved ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Approved</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">Pending</Badge>
                  )}
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <div className="flex justify-end gap-2">
                    {!review.isApproved ? (
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-3"
                        onClick={() => moderateReview(review._id, true)}
                      >
                        <Check size={16} />
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-orange-600 hover:bg-orange-50 rounded-lg px-3"
                        onClick={() => moderateReview(review._id, false)}
                      >
                        <X size={16} />
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-rose-600 hover:bg-rose-50 rounded-lg px-3"
                      onClick={() => deleteReview(review._id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!loading && reviews.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20 text-zinc-500">
                  No reviews to moderate.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
