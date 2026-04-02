"use client";

import { Package, CheckSquare, Square } from "lucide-react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GmcProduct } from "@/lib/types/gmc";
import { microsToUsd, formatBudget } from "@/lib/utils";

interface ProductToggleListProps {
  products: GmcProduct[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export function ProductToggleList({
  products,
  selectedIds,
  onSelectionChange,
}: ProductToggleListProps) {
  if (products.length === 0) return null;

  const allSelected = products.every((p) => selectedIds.includes(p.offerId));

  function toggleAll() {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(products.map((p) => p.offerId));
    }
  }

  function toggleProduct(offerId: string) {
    if (selectedIds.includes(offerId)) {
      onSelectionChange(selectedIds.filter((id) => id !== offerId));
    } else {
      onSelectionChange([...selectedIds, offerId]);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="size-4" />
            Linked Products ({products.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAll}
            className="rounded-full gap-1.5 text-xs h-7 px-3"
          >
            {allSelected ? (
              <>
                <Square className="size-3.5" />
                Deselect All
              </>
            ) : (
              <>
                <CheckSquare className="size-3.5" />
                Select All
              </>
            )}
          </Button>
        </div>
        <CardDescription>
          Select products to also copy to OpenAI Merchant Center
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {products.map((product) => {
          const isSelected = selectedIds.includes(product.offerId);
          const priceUsd = microsToUsd(
            Number(product.productAttributes.price.amountMicros)
          );
          const formattedPrice = formatBudget(priceUsd);
          const currency = product.productAttributes.price.currencyCode;
          const brand = product.productAttributes.brand;
          const title = product.productAttributes.title;
          const imageLink = product.productAttributes.imageLink;

          return (
            <label
              key={product.offerId}
              className="flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer hover:bg-accent/50 transition-colors"
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleProduct(product.offerId)}
              />
              {imageLink ? (
                <div className="relative size-9 shrink-0 overflow-hidden rounded">
                  <Image
                    src={imageLink}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="36px"
                  />
                </div>
              ) : (
                <div className="size-9 shrink-0 rounded bg-muted flex items-center justify-center">
                  <Package className="size-4 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium leading-tight">
                  {title}
                </p>
                <p className="truncate text-xs text-muted-foreground mt-0.5">
                  {formattedPrice} {currency}
                  {brand ? ` · ${brand}` : ""}
                </p>
              </div>
            </label>
          );
        })}
      </CardContent>
    </Card>
  );
}
