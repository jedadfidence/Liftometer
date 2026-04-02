"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AlertCircle, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductTable } from "@/components/product-table";
import { EmptyState } from "@/components/empty-state";
import type { GmcProduct, ProductCampaignLink } from "@/lib/types/gmc";

export default function ProductsPage() {
  const [products, setProducts] = useState<GmcProduct[]>([]);
  const [links, setLinks] = useState<ProductCampaignLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/gmc/products");
        if (!res.ok) throw new Error(`Failed to fetch products (${res.status})`);
        const data = await res.json();
        if (!cancelled) {
          setProducts(data.products ?? []);
          setLinks(data.links ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
          toast.error("Failed to load products");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <EmptyState icon={AlertCircle} title="Failed to load products" description={error} />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <EmptyState
          icon={Package}
          title="No products found"
          description="Connect a Google Merchant Center account to see your products here."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Products</h1>
      <ProductTable products={products} productCampaignLinks={links} />
    </div>
  );
}
