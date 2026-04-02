"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { microsToUsd, formatBudget } from "@/lib/utils";
import type { GmcProduct, GmcIssueSeverity } from "@/lib/types/gmc";
import type { GadsCampaign } from "@/lib/types/gads";

/* ------------------------------------------------------------------ */
/*  Collapsible section — mirrors CampaignDetail exactly               */
/* ------------------------------------------------------------------ */

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(defaultOpen ? undefined : 0);

  useEffect(() => {
    if (!contentRef.current) return;
    if (open) {
      const h = contentRef.current.scrollHeight;
      setHeight(h);
      const timer = setTimeout(() => setHeight(undefined), 200);
      return () => clearTimeout(timer);
    } else {
      const h = contentRef.current.scrollHeight;
      setHeight(h);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setHeight(0));
      });
    }
  }, [open]);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        className="flex w-full items-center justify-between py-3 text-sm font-semibold hover:text-foreground transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            !open && "-rotate-90"
          )}
        />
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden transition-[height] duration-200 ease-in-out"
        style={{ height: height !== undefined ? `${height}px` : "auto" }}
      >
        <div className="pb-4 space-y-1">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Key-value row — grid layout matching CampaignDetail                */
/* ------------------------------------------------------------------ */

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="grid grid-cols-[120px_1fr] gap-y-1.5 text-sm items-start py-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn(mono && "font-mono text-xs")}>{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Availability badge                                                  */
/* ------------------------------------------------------------------ */

const AVAILABILITY_CONFIG: Record<string, { label: string; className: string }> = {
  IN_STOCK: { label: "In Stock", className: "bg-green-100 text-green-800" },
  OUT_OF_STOCK: { label: "Out of Stock", className: "bg-red-100 text-red-800" },
  PREORDER: { label: "Pre-order", className: "bg-blue-100 text-blue-800" },
  LIMITED_AVAILABILITY: { label: "Limited", className: "bg-amber-100 text-amber-800" },
  BACKORDER: { label: "Backorder", className: "bg-orange-100 text-orange-800" },
  AVAILABILITY_UNSPECIFIED: { label: "Unknown", className: "bg-gray-100 text-gray-600" },
};

function AvailabilityBadge({ availability }: { availability: string }) {
  const cfg = AVAILABILITY_CONFIG[availability] ?? { label: availability, className: "bg-gray-100 text-gray-600" };
  return <Badge className={cfg.className}>{cfg.label}</Badge>;
}

/* ------------------------------------------------------------------ */
/*  Severity badge                                                      */
/* ------------------------------------------------------------------ */

function SeverityBadge({ severity }: { severity: GmcIssueSeverity }) {
  const cfg: Record<GmcIssueSeverity, { label: string; className: string }> = {
    SEVERITY_UNSPECIFIED: { label: "Unspecified", className: "bg-gray-100 text-gray-600" },
    NOT_IMPACTED: { label: "Not Impacted", className: "bg-gray-100 text-gray-600" },
    DEMOTED: { label: "Demoted", className: "bg-amber-100 text-amber-800" },
    DISAPPROVED: { label: "Disapproved", className: "bg-red-100 text-red-800" },
  };
  const c = cfg[severity] ?? cfg.SEVERITY_UNSPECIFIED;
  return <Badge className={c.className}>{c.label}</Badge>;
}

/* ------------------------------------------------------------------ */
/*  Channel type badge for linked campaigns                            */
/* ------------------------------------------------------------------ */

function ChannelBadge({ channelType }: { channelType: string }) {
  const cfg: Record<string, { label: string; className: string }> = {
    SEARCH: { label: "Search", className: "bg-blue-100 text-blue-800" },
    SHOPPING: { label: "Shopping", className: "bg-green-100 text-green-800" },
    PERFORMANCE_MAX: { label: "PMax", className: "bg-amber-100 text-amber-800" },
    DISPLAY: { label: "Display", className: "bg-purple-100 text-purple-800" },
  };
  const c = cfg[channelType] ?? { label: channelType, className: "bg-gray-100 text-gray-600" };
  return <Badge className={c.className}>{c.label}</Badge>;
}

/* ------------------------------------------------------------------ */
/*  Format price from GmcPrice                                         */
/* ------------------------------------------------------------------ */

function formatPrice(price: { amountMicros: string; currencyCode: string } | undefined): string | null {
  if (!price) return null;
  const usd = parseInt(price.amountMicros, 10) / 1_000_000;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currencyCode || "USD",
  }).format(usd);
}

/* ------------------------------------------------------------------ */
/*  ProductDetail                                                       */
/* ------------------------------------------------------------------ */

export function ProductDetail({ product }: { product: GmcProduct }) {
  const a = product.productAttributes;
  const s = product.productStatus;
  const d = product.automatedDiscounts;

  // Linked campaigns state
  const [campaigns, setCampaigns] = useState<GadsCampaign[] | null>(null);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingCampaigns(true);
    fetch(`/api/gmc/products/${encodeURIComponent(product.offerId)}/campaigns`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setCampaigns(data.campaigns ?? []);
          setLoadingCampaigns(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCampaigns([]);
          setLoadingCampaigns(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [product.offerId]);

  // Dimension helpers
  const hasDimensions =
    a.productHeight || a.productLength || a.productWidth || a.productWeight;

  const formatDimension = (dim: { value: number; unit: string } | undefined) =>
    dim ? `${dim.value} ${dim.unit}` : null;

  // Categories / GTINs
  const hasCategories =
    (a.productTypes && a.productTypes.length > 0) ||
    (a.gtins && a.gtins.length > 0);

  // Issues
  const issues = s?.itemLevelIssues ?? [];
  const issueCount = issues.length;

  return (
    <div>
      {/* 1. Core Info */}
      <Section title="Core Info">
        <Row label="Title" value={a.title} />
        <Row label="Description" value={a.description} />
        <Row label="Offer ID" value={product.offerId} mono />
        <Row label="Brand" value={a.brand} />
        {a.color && <Row label="Color" value={a.color} />}
        <Row label="Availability" value={<AvailabilityBadge availability={a.availability} />} />
        <Row label="Language" value={product.contentLanguage} />
        <Row label="Feed Label" value={product.feedLabel} />
        <Row label="Data Source" value={product.dataSource} mono />
      </Section>

      {/* 2. Pricing */}
      <Section title="Pricing">
        <Row label="Price" value={formatPrice(a.price)} mono />
        {a.salePrice && <Row label="Sale Price" value={formatPrice(a.salePrice)} mono />}
        {a.salePriceEffectiveDate && (
          <Row
            label="Sale Dates"
            value={`${a.salePriceEffectiveDate.startDate} – ${a.salePriceEffectiveDate.endDate}`}
            mono
          />
        )}
        {d.priorPrice && (
          <Row label="Prior Price" value={formatPrice(d.priorPrice)} mono />
        )}
        {d.priorPriceProgressive && (
          <Row label="Prior (Prog.)" value={formatPrice(d.priorPriceProgressive)} mono />
        )}
        {d.gadPrice && (
          <Row label="GAD Price" value={formatPrice(d.gadPrice)} mono />
        )}
      </Section>

      {/* 3. Images */}
      <Section title="Images">
        {a.imageLink && (
          <div className="mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={a.imageLink}
              alt={a.title}
              className="max-w-full rounded border border-border"
              style={{ maxHeight: 200 }}
            />
          </div>
        )}
        {a.additionalImageLinks && a.additionalImageLinks.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Additional Images</p>
            {a.additionalImageLinks.map((link, i) => (
              <a
                key={i}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs font-mono text-blue-600 hover:underline truncate"
              >
                {link}
              </a>
            ))}
          </div>
        )}
      </Section>

      {/* 4. Dimensions — only if any exist */}
      {hasDimensions && (
        <Section title="Dimensions">
          <Row label="Height" value={formatDimension(a.productHeight)} mono />
          <Row label="Length" value={formatDimension(a.productLength)} mono />
          <Row label="Width" value={formatDimension(a.productWidth)} mono />
          <Row label="Weight" value={formatDimension(a.productWeight)} mono />
        </Section>
      )}

      {/* 5. Categories — only if any exist */}
      {hasCategories && (
        <Section title="Categories">
          {a.productTypes && a.productTypes.length > 0 && (
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground font-medium mb-1">Product Types</p>
              {a.productTypes.map((pt, i) => (
                <p key={i} className="text-sm pl-2 border-l-2 border-border">
                  {pt}
                </p>
              ))}
            </div>
          )}
          {a.gtins && a.gtins.length > 0 && (
            <div className="space-y-0.5 mt-2">
              <p className="text-xs text-muted-foreground font-medium mb-1">GTINs</p>
              {a.gtins.map((gtin, i) => (
                <p key={i} className="text-sm font-mono pl-2 border-l-2 border-border">
                  {gtin}
                </p>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* 6. Status */}
      {s?.destinationStatuses && s.destinationStatuses.length > 0 && (
        <Section title="Status" defaultOpen={false}>
          <div className="space-y-3">
            {s.destinationStatuses.map((ds, i) => (
              <div key={i} className="rounded-md border border-border p-2.5 space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {ds.reportingContext}
                </p>
                {ds.approvedCountries.length > 0 && (
                  <Row
                    label="Approved"
                    value={
                      <span className="text-green-700 text-xs">
                        {ds.approvedCountries.join(", ")}
                      </span>
                    }
                  />
                )}
                {ds.pendingCountries.length > 0 && (
                  <Row
                    label="Pending"
                    value={
                      <span className="text-amber-700 text-xs">
                        {ds.pendingCountries.join(", ")}
                      </span>
                    }
                  />
                )}
                {ds.disapprovedCountries.length > 0 && (
                  <Row
                    label="Disapproved"
                    value={
                      <span className="text-red-700 text-xs">
                        {ds.disapprovedCountries.join(", ")}
                      </span>
                    }
                  />
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 7. Issues */}
      <Section
        title={
          <span>
            Issues{" "}
            {issueCount > 0 && (
              <Badge className="ml-1.5 bg-red-100 text-red-800 text-xs">{issueCount}</Badge>
            )}
          </span>
        }
        defaultOpen={issueCount > 0}
      >
        {issueCount === 0 ? (
          <p className="text-sm text-muted-foreground">No issues found.</p>
        ) : (
          <div className="space-y-3">
            {issues.map((issue, i) => (
              <div key={i} className="rounded-md border border-border p-2.5 space-y-1.5">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={issue.severity} />
                  <span className="text-xs font-mono text-muted-foreground">{issue.code}</span>
                </div>
                {issue.description && (
                  <p className="text-sm font-medium">{issue.description}</p>
                )}
                {issue.detail && (
                  <p className="text-xs text-muted-foreground">{issue.detail}</p>
                )}
                {issue.resolution && (
                  <Row label="Resolution" value={issue.resolution} />
                )}
                {issue.attribute && (
                  <Row label="Attribute" value={issue.attribute} mono />
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* 8. Linked Campaigns */}
      <Section title="Linked Campaigns" defaultOpen>
        {loadingCampaigns ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        ) : campaigns && campaigns.length > 0 ? (
          <div className="space-y-2">
            {campaigns.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <ChannelBadge channelType={c.advertisingChannelType} />
                  <span className="text-sm font-medium truncate">{c.name}</span>
                </div>
                <a
                  href={`/dashboard/campaigns`}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0 ml-2"
                >
                  View <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No linked campaigns.</p>
        )}
      </Section>
    </div>
  );
}
