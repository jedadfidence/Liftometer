"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Package, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { ProductDetail } from "@/components/product-detail";
import Link from "next/link";
import type { GmcProduct } from "@/lib/types/gmc";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<GmcProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/gmc/products/${params.id}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        if (!cancelled) setProduct(data.product);
      } catch {
        if (!cancelled) toast.error("Failed to load product");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!product) {
    return <EmptyState icon={Package} title="Product not found" description="This product could not be loaded." />;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/products"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{product.productAttributes.title}</h1>
      </div>
      <Button asChild className="rounded-full">
        <Link href={`/dashboard/products/copy/${product.offerId}`}>
          <Copy className="mr-2 h-4 w-4" />Copy to OAI
        </Link>
      </Button>
      <ProductDetail product={product} />
    </div>
  );
}
