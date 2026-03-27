"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/status-badge";
import { microsToUsd, formatBudget } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import type { GadsCampaign } from "@/lib/types/gads";

/* ------------------------------------------------------------------ */
/*  Collapsible section                                                */
/* ------------------------------------------------------------------ */

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card>
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              open ? "rotate-0" : "-rotate-90"
            }`}
          />
        </div>
      </CardHeader>
      {open && <CardContent>{children}</CardContent>}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Key-value row                                                      */
/* ------------------------------------------------------------------ */

function Row({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={`text-right ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CampaignDetail                                                     */
/* ------------------------------------------------------------------ */

export function CampaignDetail({ campaign }: { campaign: GadsCampaign }) {
  const c = campaign;

  return (
    <div className="space-y-4">
      {/* Core Info */}
      <CollapsibleSection title="Core Info">
        <Row label="Name" value={c.name} />
        <Row label="ID" value={c.id} mono />
        <Row label="Status" value={<StatusBadge status={c.status} />} />
        <Row label="Type" value={c.advertisingChannelType} />
        {c.advertisingChannelSubType && (
          <Row label="Sub-type" value={c.advertisingChannelSubType} />
        )}
      </CollapsibleSection>

      <Separator />

      {/* Budget */}
      <CollapsibleSection title="Budget">
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
      </CollapsibleSection>

      <Separator />

      {/* Bidding */}
      <CollapsibleSection title="Bidding">
        <Row label="Strategy Type" value={c.biddingStrategyType} />
      </CollapsibleSection>

      <Separator />

      {/* Network Settings */}
      <CollapsibleSection title="Network Settings">
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
      </CollapsibleSection>

      <Separator />

      {/* Geo Targeting */}
      <CollapsibleSection title="Geo Targeting">
        <Row
          label="Positive Geo Target Type"
          value={c.geoTargetTypeSetting.positiveGeoTargetType}
        />
        <Row
          label="Negative Geo Target Type"
          value={c.geoTargetTypeSetting.negativeGeoTargetType}
        />
      </CollapsibleSection>

      <Separator />

      {/* Scheduling */}
      {(c.startDate || c.endDate) && (
        <>
          <CollapsibleSection title="Scheduling">
            {c.startDate && <Row label="Start Date" value={c.startDate} mono />}
            {c.endDate && <Row label="End Date" value={c.endDate} mono />}
          </CollapsibleSection>
          <Separator />
        </>
      )}

      {/* Tracking */}
      {(c.trackingUrlTemplate || c.finalUrlSuffix) && (
        <>
          <CollapsibleSection title="Tracking">
            {c.trackingUrlTemplate && (
              <Row label="URL Template" value={c.trackingUrlTemplate} mono />
            )}
            {c.finalUrlSuffix && (
              <Row label="Final URL Suffix" value={c.finalUrlSuffix} mono />
            )}
          </CollapsibleSection>
          <Separator />
        </>
      )}

      {/* Ad Rotation */}
      {c.adServingOptimizationStatus && (
        <>
          <CollapsibleSection title="Ad Rotation">
            <Row
              label="Serving Optimization"
              value={c.adServingOptimizationStatus}
            />
          </CollapsibleSection>
          <Separator />
        </>
      )}

      {/* Additional Settings */}
      {c.urlExpansionOptOut !== undefined && (
        <CollapsibleSection title="Additional Settings">
          <Row
            label="URL Expansion Opt-out"
            value={c.urlExpansionOptOut ? "Yes" : "No"}
          />
        </CollapsibleSection>
      )}
    </div>
  );
}
