"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Star, MessageSquare, CheckCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface Review {
  _id: string;
  user: {
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ReviewSection({ productId }: { productId: string }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      setReviews(data);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return alert("Please log in to leave a review");

    try {
      setSubmitting(true);
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment }),
      });

      if (res.ok) {
        setSuccess(true);
        setComment("");
        setRating(5);
        // We don't refresh reviews here because they need moderation first
      } else {
        const err = await res.json();
        alert(err.error || "Failed to submit review");
      }
    } catch (error) {
      console.error("Review submission error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="grid lg:grid-cols-3 gap-12">
        {/* Review Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MessageSquare size={20} className="text-blue-500" />
              Write a Review
            </h3>
            
            {success ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <p className="font-medium">Thank you!</p>
                <p className="text-sm text-zinc-500">Your review has been submitted and is pending moderation.</p>
                <Button variant="outline" onClick={() => setSuccess(false)}>Write another</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setRating(i)}
                        className={`p-1 transition-colors ${
                          i <= rating ? "text-yellow-400" : "text-zinc-200 dark:text-zinc-700"
                        }`}
                      >
                        <Star size={24} fill={i <= rating ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Review</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    placeholder="Share your experience with this product..."
                    className="w-full min-h-[120px] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent resize-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-500/20"
                  disabled={submitting || !session}
                >
                  {submitting ? "Submitting..." : session ? "Submit Review" : "Login to Review"}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Customer Reviews ({reviews.length})</h3>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  {(reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)}
                </span>
                <div className="flex text-yellow-400">
                  <Star size={16} fill="currentColor" />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-32 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />)
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id} className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center font-bold">
                        {review.user.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold">{review.user.name}</p>
                        <p className="text-xs text-zinc-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          fill={i <= review.rating ? "currentColor" : "none"} 
                          className={i <= review.rating ? "" : "text-zinc-200 dark:text-zinc-700"}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                <p className="text-zinc-500 font-medium">No approved reviews yet. Be the first!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
