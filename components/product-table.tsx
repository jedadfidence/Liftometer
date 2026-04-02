"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, ArrowUp, ArrowDown, Search, SlidersHorizontal, Copy } from "lucide-react";
import {
  Table, TableHeader, TableBody, TableRow, TableCell, TableHead,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { ProductDetail } from "@/components/product-detail";
import { ProductFilterBar, ProductFilterChips, type ProductFilters } from "@/components/product-filter-bar";
import { formatBudget, microsToUsd } from "@/lib/utils";
import type { GmcProduct, GmcAvailability, ProductCampaignLink } from "@/lib/types/gmc";

type SortColumn = "title" | "price" | "availability" | "brand";
type SortDirection = "asc" | "desc";

const COLUMN_LABELS: Record<SortColumn, string> = {
  title: "Product",
  price: "Price",
  availability: "Availability",
  brand: "Brand",
};

const FRIENDLY_AVAILABILITY: Record<GmcAvailability, string> = {
  AVAILABILITY_UNSPECIFIED: "Unspecified",
  IN_STOCK: "In Stock",
  OUT_OF_STOCK: "Out of Stock",
  PREORDER: "Preorder",
  LIMITED_AVAILABILITY: "Limited",
  BACKORDER: "Backorder",
};

const AVAILABILITY_CLASS: Record<GmcAvailability, string> = {
  AVAILABILITY_UNSPECIFIED: "bg-muted text-muted-foreground",
  IN_STOCK: "bg-[var(--color-status-enabled)] text-white",
  OUT_OF_STOCK: "bg-destructive text-destructive-foreground",
  PREORDER: "bg-blue-500 text-white",
  LIMITED_AVAILABILITY: "bg-amber-500 text-white",
  BACKORDER: "bg-orange-500 text-white",
};

function getSortValue(product: GmcProduct, column: SortColumn): string | number {
  const attrs = product.productAttributes;
  switch (column) {
    case "title": return attrs.title;
    case "price": return Number(attrs.price.amountMicros);
    case "availability": return attrs.availability;
    case "brand": return attrs.brand ?? "";
  }
}

interface ProductTableProps {
  products: GmcProduct[];
  productCampaignLinks: ProductCampaignLink[];
}

export function ProductTable({ products, productCampaignLinks }: ProductTableProps) {
  const router = useRouter();
  const [rawSearch, setRawSearch] = useState("");
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<SortColumn>("title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filters, setFilters] = useState<ProductFilters>({ account: [], availability: [], brand: [] });
  const [detailProduct, setDetailProduct] = useState<GmcProduct | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    timerRef.current = setTimeout(() => { setSearch(rawSearch); }, 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [rawSearch]);

  const handleSort = useCallback((column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  }, [sortColumn]);

  const campaignCountByProduct = useMemo(() => {
    const map = new Map<string, number>();
    for (const link of productCampaignLinks) {
      map.set(link.productId, link.campaignIds.length);
    }
    return map;
  }, [productCampaignLinks]);

  const filtered = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return products
      .filter((p) => {
        const attrs = p.productAttributes;
        if (
          lowerSearch &&
          !attrs.title.toLowerCase().includes(lowerSearch) &&
          !p.offerId.toLowerCase().includes(lowerSearch)
        ) return false;
        if (filters.account.length > 0 && !filters.account.includes(p.accountName)) return false;
        if (filters.availability.length > 0 && !filters.availability.includes(attrs.availability)) return false;
        if (filters.brand.length > 0 && !filters.brand.includes(attrs.brand)) return false;
        return true;
      })
      .sort((a, b) => {
        const aVal = getSortValue(a, sortColumn);
        const bVal = getSortValue(b, sortColumn);
        const cmp =
          typeof aVal === "number" && typeof bVal === "number"
            ? aVal - bVal
            : String(aVal).localeCompare(String(bVal));
        return sortDirection === "asc" ? cmp : -cmp;
      });
  }, [products, search, filters, sortColumn, sortDirection]);

  function SortIcon({ column }: { column: SortColumn }) {
    if (sortColumn !== column) return <ArrowUpDown className="size-3.5 text-muted-foreground/50" />;
    return sortDirection === "asc" ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />;
  }

  const EMPTY_FILTERS: ProductFilters = { account: [], availability: [], brand: [] };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={rawSearch}
            onChange={(e) => setRawSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <ProductFilterBar products={products} filters={filters} onFiltersChange={setFilters} />
      </div>
      <ProductFilterChips filters={filters} onFiltersChange={setFilters} />

      {filtered.length === 0 ? (
        <EmptyState
          icon={SlidersHorizontal}
          title="No products match your filters"
          description="Try adjusting your search or filter criteria."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setRawSearch(""); setSearch(""); setFilters(EMPTY_FILTERS); }}
            >
              Clear all filters
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12" />
              {(Object.keys(COLUMN_LABELS) as SortColumn[]).map((col) => (
                <TableHead key={col}>
                  <button
                    type="button"
                    onClick={() => handleSort(col)}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    {COLUMN_LABELS[col]}
                    <SortIcon column={col} />
                  </button>
                </TableHead>
              ))}
              <TableHead>Status</TableHead>
              <TableHead>Campaigns</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => {
              const attrs = p.productAttributes;
              const issueCount = p.productStatus?.itemLevelIssues?.length ?? 0;
              const campaignCount = campaignCountByProduct.get(p.offerId) ?? 0;

              return (
                <TableRow key={p.offerId}>
                  {/* Image */}
                  <TableCell>
                    {attrs.imageLink ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={attrs.imageLink}
                        alt={attrs.title}
                        width={36}
                        height={36}
                        className="rounded object-cover bg-muted size-9"
                      />
                    ) : (
                      <div className="size-9 rounded bg-muted" />
                    )}
                  </TableCell>

                  {/* Title + offerId */}
                  <TableCell>
                    <div className="font-medium">{attrs.title}</div>
                    <div className="font-mono text-xs text-muted-foreground mt-0.5">{p.offerId}</div>
                  </TableCell>

                  {/* Price */}
                  <TableCell className="font-mono">
                    {formatBudget(microsToUsd(Number(attrs.price.amountMicros)))}
                    <span className="ml-1 text-xs text-muted-foreground">{attrs.price.currencyCode}</span>
                  </TableCell>

                  {/* Availability */}
                  <TableCell>
                    <Badge className={AVAILABILITY_CLASS[attrs.availability]}>
                      {FRIENDLY_AVAILABILITY[attrs.availability] ?? attrs.availability}
                    </Badge>
                  </TableCell>

                  {/* Brand */}
                  <TableCell>{attrs.brand}</TableCell>

                  {/* Status */}
                  <TableCell>
                    {issueCount > 0 ? (
                      <Badge variant="destructive">{issueCount} issue{issueCount !== 1 ? "s" : ""}</Badge>
                    ) : (
                      <Badge className="bg-[var(--color-status-enabled)] text-white">Approved</Badge>
                    )}
                  </TableCell>

                  {/* Campaigns */}
                  <TableCell>
                    <Badge variant="secondary">{campaignCount}</Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button variant="ghost" size="xs" onClick={() => setDetailProduct(p)}>
                        View
                      </Button>
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => router.push(`/dashboard/products/copy/${p.offerId}`)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copy to OAI
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <Sheet open={!!detailProduct} onOpenChange={(open) => { if (!open) setDetailProduct(null); }}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <div className="px-6 py-6 space-y-6">
            <div className="space-y-4">
              <SheetTitle className="text-lg">
                {detailProduct?.productAttributes.title ?? "Product Detail"}
              </SheetTitle>
              {detailProduct && (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    setDetailProduct(null);
                    router.push(`/dashboard/products/copy/${detailProduct.offerId}`);
                  }}
                >
                  <Copy className="h-4 w-4" />
                  Copy to OAI
                </Button>
              )}
            </div>
            {detailProduct && <ProductDetail product={detailProduct} />}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
