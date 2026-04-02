"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Package, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { ProductCopySplitPane } from "@/components/product-copy-split-pane";
import { mapProduct, countProductMappingResults } from "@/lib/oai-mc/mapper";
import Link from "next/link";
import type { GmcProduct, OaiMcProductDraft } from "@/lib/types/gmc";

export default function ProductCopyPage() {
  const params = useParams<{ productId: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<GmcProduct | null>(null);
  const [draft, setDraft] = useState<OaiMcProductDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/gmc/products/${params.productId}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        if (!cancelled) {
          setProduct(data.product);
          setDraft(mapProduct(data.product));
        }
      } catch {
        if (!cancelled) toast.error("Failed to load product");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [params.productId]);

  async function handleSubmit() {
    if (!draft || !product) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/oai-mc/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, source_product_id: product.offerId }),
      });
      if (!res.ok) throw new Error("Failed to create draft");
      const result = await res.json();
      toast.success(`Product draft created: ${result.product_title}`);
      if (result.warnings?.length > 0) {
        for (const w of result.warnings) toast.warning(w);
      }
      router.push("/dashboard/products");
    } catch {
      toast.error("Failed to copy product");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[60vh]" />
      </div>
    );
  }

  if (!product || !draft) {
    return (
      <EmptyState
        icon={Package}
        title="Product not found"
        description="This product could not be loaded."
      />
    );
  }

  const { mapped, actionNeeded } = countProductMappingResults(draft);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight">Copy Product to OAI</h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary">{mapped} mapped</Badge>
          {actionNeeded > 0 && (
            <Badge variant="outline" className="text-amber-600">
              {actionNeeded} need input
            </Badge>
          )}
          <Button onClick={handleSubmit} disabled={submitting} className="rounded-full">
            <Send className="mr-2 h-4 w-4" />
            {submitting ? "Creating..." : "Create Draft"}
          </Button>
        </div>
      </div>
      <ProductCopySplitPane product={product} draft={draft} onDraftChange={setDraft} />
    </div>
  );
}
