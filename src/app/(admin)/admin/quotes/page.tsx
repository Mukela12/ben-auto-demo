"use client";

import { useEffect, useState } from "react";
import type { QuoteRequest } from "@/types";
import { formatCurrency } from "@/lib/utils";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  contacted: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  negotiating: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  quoted: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  sold: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  lost: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const statusOptions = ["all", "new", "contacted", "negotiating", "quoted", "sold", "lost"];

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchQuotes = () => {
    const params = filter !== "all" ? `?status=${filter}` : "";
    fetch(`/api/quotes${params}`)
      .then((r) => r.json())
      .then((data) => { setQuotes(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchQuotes(); }, [filter]);

  const updateQuoteStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    await fetch(`/api/quotes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchQuotes();
    setUpdatingId(null);
  };

  const updateNotes = async (id: string, adminNotes: string) => {
    await fetch(`/api/quotes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminNotes }),
    });
  };

  const newCount = quotes.filter((q) => q.status === "new").length;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-[var(--font-inter-tight)] text-2xl font-black text-foreground">
            Quote Requests
            {newCount > 0 && (
              <span className="ml-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#ff5f00] text-xs font-bold text-white">
                {newCount}
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage purchase inquiries from potential buyers</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {statusOptions.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-all ${
              filter === s
                ? "bg-[#ff5f00] text-white"
                : "bg-card text-muted-foreground hover:bg-secondary"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-card" />
          ))}
        </div>
      ) : quotes.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No quote requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.map((quote) => (
            <div key={quote.id} className="rounded-xl border border-border bg-card">
              {/* Row */}
              <button
                onClick={() => setExpandedId(expandedId === quote.id ? null : quote.id)}
                className="flex w-full items-center gap-4 p-4 text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{quote.referenceNumber}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${statusColors[quote.status] || ""}`}>
                      {quote.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-foreground">{quote.customerName}</p>
                  <p className="text-xs text-muted-foreground">{quote.car?.name} — {quote.car?.salePrice ? formatCurrency(quote.car.salePrice) : "N/A"}</p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  {new Date(quote.createdAt).toLocaleDateString()}
                </div>
                <svg className={`h-4 w-4 text-muted-foreground transition-transform ${expandedId === quote.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded Details */}
              {expandedId === quote.id && (
                <div className="border-t border-border p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 text-sm">
                      <h4 className="font-semibold text-foreground">Customer Details</h4>
                      <p><span className="text-muted-foreground">Email:</span> <span className="text-foreground">{quote.customerEmail}</span></p>
                      <p><span className="text-muted-foreground">Phone:</span> <span className="text-foreground">{quote.customerPhone}</span></p>
                      {quote.financingInterest && <p className="text-[#ff5f00]">Interested in financing</p>}
                      {quote.tradeInInterest && <p className="text-[#ff5f00]">Has trade-in vehicle</p>}
                      {quote.message && (
                        <div className="mt-2 rounded-lg bg-secondary p-3">
                          <p className="text-xs text-muted-foreground">Message:</p>
                          <p className="mt-1 text-sm text-foreground">{quote.message}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-foreground">Update Status</h4>
                      <div className="flex flex-wrap gap-2">
                        {["new", "contacted", "negotiating", "quoted", "sold", "lost"].map((s) => (
                          <button
                            key={s}
                            onClick={() => updateQuoteStatus(quote.id, s)}
                            disabled={updatingId === quote.id || quote.status === s}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                              quote.status === s
                                ? "bg-[#ff5f00] text-white"
                                : "border border-border text-muted-foreground hover:bg-secondary disabled:opacity-50"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>

                      <div className="mt-3">
                        <label className="text-xs font-medium text-foreground">Admin Notes</label>
                        <textarea
                          defaultValue={quote.adminNotes || ""}
                          onBlur={(e) => updateNotes(quote.id, e.target.value)}
                          rows={2}
                          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[#ff5f00]"
                          placeholder="Add notes about this inquiry..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
