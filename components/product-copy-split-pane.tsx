"use client";

import React, { useCallback, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, GripVertical, PanelLeftClose } from "lucide-react";
import { countProductMappingResults } from "@/lib/oai-mc/mapper";
import type { GmcProduct, OaiMcProductDraft } from "@/lib/types/gmc";

const MIN_LEFT_WIDTH = 20;
const MAX_LEFT_WIDTH = 65;
const DEFAULT_LEFT_WIDTH = 42;

interface ProductCopySplitPaneProps {
  product: GmcProduct;
  draft: OaiMcProductDraft;
  onDraftChange: (draft: OaiMcProductDraft) => void;
}

function SourceField({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <p className="text-sm font-mono mt-0.5 break-all">{value || "—"}</p>
    </div>
  );
}

function MappingDot({ mapped }: { mapped: boolean }) {
  return (
    <span
      className={`inline-block h-1.5 w-1.5 rounded-full shrink-0 mt-0.5 ${
        mapped ? "bg-green-500" : "bg-amber-400"
      }`}
    />
  );
}

function DraftField({
  label,
  value,
  onChange,
  readOnly = false,
  multiline = false,
  mapped,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  multiline?: boolean;
  mapped: boolean;
}) {
  return (
    <div className="py-1.5 space-y-1">
      <div className="flex items-center gap-1.5">
        <MappingDot mapped={mapped} />
        <Label className="text-xs text-muted-foreground">{label}</Label>
      </div>
      {multiline ? (
        <Textarea
          value={value}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange?.(e.target.value)}
          readOnly={readOnly}
          rows={3}
          className="text-sm font-mono resize-none"
        />
      ) : (
        <Input
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value)}
          readOnly={readOnly}
          className="text-sm font-mono h-8"
        />
      )}
    </div>
  );
}

export function ProductCopySplitPane({
  product,
  draft,
  onDraftChange,
}: ProductCopySplitPaneProps) {
  const [leftWidth, setLeftWidth] = useState(DEFAULT_LEFT_WIDTH);
  const [collapsed, setCollapsed] = useState(false);
  const [widthBeforeCollapse, setWidthBeforeCollapse] = useState(DEFAULT_LEFT_WIDTH);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const attrs = product.productAttributes;

  const { mapped } = countProductMappingResults(draft);
  const fieldCount = 8; // total tracked fields

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (collapsed) return;
      e.preventDefault();
      dragging.current = true;

      const onMouseMove = (ev: MouseEvent) => {
        if (!dragging.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const pct = ((ev.clientX - rect.left) / rect.width) * 100;
        setLeftWidth(Math.min(MAX_LEFT_WIDTH, Math.max(MIN_LEFT_WIDTH, pct)));
      };

      const onMouseUp = () => {
        dragging.current = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [collapsed]
  );

  function handleCollapse() {
    setWidthBeforeCollapse(leftWidth);
    setCollapsed(true);
  }

  function handleExpand() {
    setCollapsed(false);
    setLeftWidth(widthBeforeCollapse);
  }

  function update(field: keyof OaiMcProductDraft, value: string) {
    const next = structuredClone(draft);
    switch (field) {
      case "title":
        next.title = value;
        break;
      case "description":
        next.description = value;
        break;
      case "link":
        next.link = value;
        break;
      case "imageLink":
        next.imageLink = value;
        break;
      case "brand":
        next.brand = value;
        break;
      case "productTypes":
        next.productTypes = value.split(",").map((s) => s.trim()).filter(Boolean);
        break;
    }
    onDraftChange(next);
  }

  const priceFormatted = attrs.price
    ? `${(Number(attrs.price.amountMicros) / 1_000_000).toFixed(2)} ${attrs.price.currencyCode}`
    : "—";

  return (
    <div ref={containerRef} className="flex flex-1 min-h-0">
      {/* Left pane or collapsed tab */}
      {collapsed ? (
        <button
          type="button"
          onClick={handleExpand}
          className="flex w-9 flex-col items-center justify-start pt-4 border-r border-border bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer shrink-0"
        >
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground mb-2" />
          <span className="text-[11px] font-medium text-muted-foreground tracking-wide [writing-mode:vertical-rl]">
            Source
          </span>
        </button>
      ) : (
        <div className="flex flex-col shrink-0" style={{ width: `${leftWidth}%` }}>
          {/* Left pane header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <PanelLeftClose className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">GMC Source</span>
            </div>
            <button
              type="button"
              onClick={handleCollapse}
              className="flex items-center gap-1 rounded-md bg-muted/50 border border-border px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors"
            >
              <ChevronLeft className="h-3 w-3" />
              Hide
            </button>
          </div>

          {/* Left pane content */}
          <ScrollArea className="flex-1 overflow-hidden">
            <div className="p-4 space-y-1">
              {/* Product image */}
              {attrs.imageLink && (
                <div className="py-1.5">
                  <Label className="text-xs text-muted-foreground">Image</Label>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={attrs.imageLink}
                    alt={attrs.title}
                    className="mt-1 max-w-xs rounded border border-border object-contain"
                  />
                </div>
              )}
              <SourceField label="Title" value={attrs.title} />
              <SourceField label="Description" value={attrs.description} />
              <SourceField label="Link / URL" value={attrs.link} />
              <SourceField label="Price" value={priceFormatted} />
              <SourceField label="Availability" value={attrs.availability} />
              <SourceField label="Brand" value={attrs.brand} />
              <SourceField
                label="Product Types"
                value={attrs.productTypes?.join(", ") ?? "—"}
              />
              <SourceField label="Offer ID" value={product.offerId} />
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Drag handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`w-1.5 shrink-0 flex items-center justify-center ${
          collapsed
            ? "bg-border/30"
            : "bg-border/50 hover:bg-border cursor-col-resize transition-colors"
        }`}
      >
        {!collapsed && (
          <GripVertical className="h-4 w-4 text-muted-foreground/40" />
        )}
      </div>

      {/* Right pane */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
            <span className="text-sm font-semibold">OAI MC Draft</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
              {mapped} / {fieldCount} mapped
            </span>
          </div>
        </div>

        <ScrollArea className="flex-1 overflow-hidden">
          <div className="p-4 space-y-1">
            <DraftField
              label="Title"
              value={draft.title}
              onChange={(v) => update("title", v)}
              mapped={!!draft.title}
            />
            <DraftField
              label="Description"
              value={draft.description}
              onChange={(v) => update("description", v)}
              multiline
              mapped={!!draft.description}
            />
            <DraftField
              label="Link"
              value={draft.link}
              onChange={(v) => update("link", v)}
              mapped={!!draft.link}
            />
            <DraftField
              label="Image Link"
              value={draft.imageLink}
              onChange={(v) => update("imageLink", v)}
              mapped={!!draft.imageLink}
            />
            <DraftField
              label="Price Amount (micros)"
              value={draft.price.amountMicros}
              readOnly
              mapped={!!draft.price.amountMicros}
            />
            <DraftField
              label="Currency"
              value={draft.price.currencyCode}
              readOnly
              mapped
            />
            <DraftField
              label="Availability"
              value={draft.availability}
              readOnly
              mapped
            />
            <DraftField
              label="Brand"
              value={draft.brand}
              onChange={(v) => update("brand", v)}
              mapped={!!draft.brand}
            />
            <DraftField
              label="Product Types (comma-separated)"
              value={draft.productTypes.join(", ")}
              onChange={(v) => update("productTypes", v)}
              mapped={draft.productTypes.length > 0}
            />
            <DraftField
              label="Offer ID"
              value={draft.offerId}
              readOnly
              mapped={!!draft.offerId}
            />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
