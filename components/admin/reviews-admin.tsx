"use client";

import { useState } from "react";
import { Check, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Badge, Button, EmptyState, Skeleton, StarRating } from "@/components/ui/primitives";
import { moderateReview, removeReview } from "@/lib/data/admin";
import { useReviews } from "@/lib/hooks";
import { cn, formatDate } from "@/lib/utils";

const FILTERS = ["pending", "approved", "rejected", "all"] as const;

export function ReviewsAdmin() {
  const { data: reviews, loading } = useReviews({ includeAll: true });
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("pending");

  const visible = reviews.filter((review) => (filter === "all" ? true : review.status === filter));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1">
          {FILTERS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={cn(
                "rounded-full px-3.5 py-2 text-[0.7rem] capitalize transition-colors",
                filter === value
                  ? "bg-cream text-ink"
                  : "text-cream/45 hover:bg-cream/8 hover:text-cream",
              )}
            >
              {value}
              <span className="ml-1.5 text-[0.6rem] opacity-50">
                {value === "all"
                  ? reviews.length
                  : reviews.filter((review) => review.status === value).length}
              </span>
            </button>
          ))}
        </div>
        <p className="text-[0.72rem] text-cream/30">
          Approved reviews appear on the dish page and homepage
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-2xl" />
          ))
        ) : visible.length === 0 ? (
          <EmptyState
            title={`No ${filter === "all" ? "" : filter} reviews.`}
            description="Reviews submitted from dish pages land here for moderation before publishing."
          />
        ) : (
          visible.map((review) => (
            <article
              key={review.id}
              className="rounded-2xl border border-cream/10 bg-cream/[0.02] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[0.85rem] text-cream/85">{review.userName}</p>
                  <p className="mt-0.5 text-[0.66rem] text-cream/30">
                    {review.productName} · {formatDate(review.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating value={review.rating} size={12} />
                  <Badge
                    tone={
                      review.status === "approved"
                        ? "success"
                        : review.status === "rejected"
                          ? "danger"
                          : "neutral"
                    }
                  >
                    {review.status}
                  </Badge>
                </div>
              </div>

              <blockquote className="mt-3 text-[0.86rem] leading-relaxed text-cream/55">
                {review.comment}
              </blockquote>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-cream/8 pt-3">
                {review.status !== "approved" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        await moderateReview(review.id, "approved");
                        toast.success("Review published");
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "Action failed.");
                      }
                    }}
                  >
                    <Check className="size-3.5" /> Approve
                  </Button>
                ) : null}
                {review.status !== "rejected" ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      try {
                        await moderateReview(review.id, "rejected");
                        toast.success("Review rejected");
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "Action failed.");
                      }
                    }}
                  >
                    <X className="size-3.5" /> Reject
                  </Button>
                ) : null}
                <button
                  type="button"
                  onClick={async () => {
                    if (!window.confirm("Delete this review permanently?")) return;
                    try {
                      await removeReview(review.id);
                      toast.success("Review deleted");
                    } catch (error) {
                      toast.error(error instanceof Error ? error.message : "Delete failed.");
                    }
                  }}
                  className="ml-auto inline-flex items-center gap-1.5 text-[0.68rem] uppercase tracking-[0.12em] text-cream/30 hover:text-red-300"
                >
                  <Trash2 className="size-3.5" /> Delete
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
