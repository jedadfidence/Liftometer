"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { microsToUsd, formatBudget } from "@/lib/utils";
import { ChevronDown, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { GadsCampaign } from "@/lib/types/gads";
import type { GmcProduct } from "@/lib/types/gmc";

/* ------------------------------------------------------------------ */
/*  Collapsible section with smooth height animation                   */
/* ------------------------------------------------------------------ */

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
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
        {title}
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
/*  Key-value row                                                      */
/* ------------------------------------------------------------------ */

function Row({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-center justify-between gap-4 py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("text-right", mono && "font-mono text-xs")}>{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CampaignDetail                                                     */
/* ------------------------------------------------------------------ */

export function CampaignDetail({ campaign }: { campaign: GadsCampaign }) {
  const c = campaign;
  const [linkedProducts, setLinkedProducts] = useState<GmcProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      setProductsLoading(true);
      try {
        const res = await fetch(`/api/gads/campaigns/${campaign.id}/products`);
        const data = await res.json();
        setLinkedProducts(data.products ?? []);
      } catch {
        // Degrade gracefully
      } finally {
        setProductsLoading(false);
      }
    }
    loadProducts();
  }, [campaign.id]);

  return (
    <div>
      {/* Core Info */}
      <Section title="Core Info">
        <Row label="Name" value={c.name} />
        <Row label="ID" value={c.id} mono />
        <Row label="Status" value={<StatusBadge status={c.status} />} />
        <Row label="Type" value={c.advertisingChannelType} />
        {c.advertisingChannelSubType && (
          <Row label="Sub-type" value={c.advertisingChannelSubType} />
        )}
      </Section>

      {/* Budget */}
      <Section title="Budget">
        <Row
          label="Daily Amount"
          value={formatBudget(microsToUsd(c.budget.amountMicros))}
          mono
        />
        {c.budget.totalAmountMicros !== undefined && (
          <Row
            label="Total Amount"
            value={formatBudget(microsToUsd(c.budget.totalAmountMicros))}
            mono
          />
        )}
        <Row label="Delivery Method" value={c.budget.deliveryMethod} />
        <Row label="Period" value={c.budget.period} />
      </Section>

      {/* Bidding */}
      <Section title="Bidding">
        <Row label="Strategy Type" value={c.biddingStrategyType} />
      </Section>

      {/* Network Settings */}
      <Section title="Network Settings">
        <Row
          label="Google Search"
          value={c.networkSettings.targetGoogleSearch ? "Yes" : "No"}
        />
        <Row
          label="Search Partners"
          value={c.networkSettings.targetSearchNetwork ? "Yes" : "No"}
        />
        <Row
          label="Display Network"
          value={c.networkSettings.targetContentNetwork ? "Yes" : "No"}
        />
      </Section>

      {/* Geo Targeting */}
      <Section title="Geo Targeting">
        <Row
          label="Positive Geo Target Type"
          value={c.geoTargetTypeSetting.positiveGeoTargetType}
        />
        <Row
          label="Negative Geo Target Type"
          value={c.geoTargetTypeSetting.negativeGeoTargetType}
        />
      </Section>

      {/* Scheduling */}
      {(c.startDate || c.endDate) && (
        <Section title="Scheduling">
          {c.startDate && <Row label="Start Date" value={c.startDate} mono />}
          {c.endDate && <Row label="End Date" value={c.endDate} mono />}
        </Section>
      )}

      {/* Tracking */}
      {(c.trackingUrlTemplate || c.finalUrlSuffix) && (
        <Section title="Tracking">
          {c.trackingUrlTemplate && (
            <Row label="URL Template" value={c.trackingUrlTemplate} mono />
          )}
          {c.finalUrlSuffix && (
            <Row label="Final URL Suffix" value={c.finalUrlSuffix} mono />
          )}
        </Section>
      )}

      {/* Ad Rotation */}
      {c.adServingOptimizationStatus && (
        <Section title="Ad Rotation">
          <Row
            label="Serving Optimization"
            value={c.adServingOptimizationStatus}
          />
        </Section>
      )}

      {/* Additional Settings */}
      {c.urlExpansionOptOut !== undefined && (
        <Section title="Additional Settings">
          <Row
            label="URL Expansion Opt-out"
            value={c.urlExpansionOptOut ? "Yes" : "No"}
          />
        </Section>
      )}

      {/* Linked Products */}
      <Section title={`Linked Products (${linkedProducts.length})`} defaultOpen={false}>
        {productsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : linkedProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No linked products</p>
        ) : (
          <div className="space-y-2">
            {linkedProducts.map((product) => {
              const attrs = product.productAttributes;
              const priceUsd = microsToUsd(Number(attrs.price.amountMicros));
              return (
                <div
                  key={product.offerId}
                  className="flex items-center gap-3 rounded-md border border-border p-2"
                >
                  {attrs.imageLink ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={attrs.imageLink}
                      alt={attrs.title}
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attrs.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBudget(priceUsd)}{attrs.brand ? ` · ${attrs.brand}` : ""}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/products/${product.offerId}`}
                    className="text-xs text-muted-foreground hover:text-foreground flex-shrink-0"
                  >
                    View →
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}
