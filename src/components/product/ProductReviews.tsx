"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Stars from "@/components/ui/Stars";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/format";
import type { ReviewDTO } from "@/lib/types";

interface Props {
  productId: string;
  slug: string;
}

export default function ProductReviews({ productId, slug }: Props) {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<ReviewDTO[] | null>(null);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(() => {
    fetch(`/api/products/${productId}/reviews`)
      .then((r) => r.json())
      .then((d) => {
        setReviews(d.reviews ?? []);
        setAverage(d.average ?? 0);
        setCount(d.count ?? 0);
      })
      .catch(() => setReviews([]));
  }, [productId]);

  useEffect(() => {
    load();
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setSignedIn(Boolean(d.user)))
      .catch(() => setSignedIn(false));
  }, [load]);

  const mine = reviews?.find((r) => r.mine);

  const openForm = () => {
    if (mine) {
      setRating(mine.rating);
      setTitle(mine.title);
      setComment(mine.comment);
    }
    setFormOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (rating < 1) {
      setFormError("Pick a star rating");
      return;
    }
    if (comment.trim().length < 10) {
      setFormError("Tell us a little more — at least 10 characters");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, title: title.trim(), comment: comment.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Could not save your review");
        setSubmitting(false);
        return;
      }
      toast(mine ? "Your review was updated" : "Thank you for your review!");
      setFormOpen(false);
      setSubmitting(false);
      load();
    } catch {
      setFormError("Network error — please try again");
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-20 lg:mt-28" id="reviews">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-moss-dark">Reviews</p>
          <h2 className="mt-3 text-display">What customers say</h2>
          {count > 0 && (
            <div className="mt-3 flex items-center gap-2.5">
              <Stars value={average} size={18} />
              <span className="text-sm font-semibold">{average.toFixed(1)}</span>
              <span className="text-sm text-earth">
                · {count} review{count > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {signedIn === false ? (
          <Link href={`/login?next=/products/${slug}`} className="btn btn-outline">
            Sign in to review
          </Link>
        ) : (
          <button onClick={openForm} className="btn btn-secondary">
            {mine ? "Edit your review" : "Write a review"}
          </button>
        )}
      </div>

      {/* Write / edit form */}
      <AnimatePresence>
        {formOpen && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onSubmit={submit}
            className="mt-6 overflow-hidden"
          >
            <div className="card space-y-4 p-6">
              <div>
                <p className="mb-1.5 text-sm font-semibold">Your rating</p>
                <Stars value={rating} size={26} onSelect={setRating} />
              </div>
              <div>
                <label htmlFor="rv-title" className="mb-1.5 block text-sm font-semibold">
                  Title <span className="font-normal text-earth/70">(optional)</span>
                </label>
                <input
                  id="rv-title"
                  className="field"
                  maxLength={80}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Sums it up in a few words"
                />
              </div>
              <div>
                <label htmlFor="rv-comment" className="mb-1.5 block text-sm font-semibold">
                  Your review
                </label>
                <textarea
                  id="rv-comment"
                  rows={4}
                  className="field resize-y"
                  maxLength={1200}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the scent, the texture, the feel on your skin?"
                />
              </div>
              {formError && <p className="form-error">{formError}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? "Saving…" : mine ? "Update Review" : "Submit Review"}
                </button>
                <button type="button" onClick={() => setFormOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* List */}
      <div className="mt-8">
        {reviews === null ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="skeleton h-28" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-sand bg-almond-light p-10 text-center">
            <p className="font-serif text-xl text-earth">No reviews yet</p>
            <p className="mt-2 text-sm text-earth/80">
              Tried this one? Be the first to share how it treated your skin.
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 lg:grid-cols-2">
            {reviews.map((r) => (
              <li key={r._id}>
                <article className={`card h-full p-6 ${r.mine ? "border-moss" : ""}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Stars value={r.rating} />
                      {r.title && <h3 className="mt-2 font-serif text-lg">{r.title}</h3>}
                    </div>
                    {r.mine && (
                      <span className="rounded-full bg-sage/40 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-moss-deep">
                        Your review
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-[15px] leading-relaxed text-earth-deep">{r.comment}</p>
                  <p className="mt-4 text-xs text-earth">
                    <span className="font-bold text-earth-deep">{r.authorName}</span>
                    {" · "}
                    {formatDate(r.createdAt)}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
