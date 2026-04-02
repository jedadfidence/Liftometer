import type { GmcProduct, OaiMcProductDraft } from "@/lib/types/gmc";

export function mapProduct(product: GmcProduct): OaiMcProductDraft {
  const attrs = product.productAttributes;
  return {
    title: attrs.title,
    description: attrs.description,
    link: attrs.link,
    imageLink: attrs.imageLink,
    availability: attrs.availability,
    brand: attrs.brand,
    price: {
      amountMicros: attrs.price.amountMicros,
      currencyCode: attrs.price.currencyCode,
    },
    productTypes: attrs.productTypes,
    offerId: product.offerId,
  };
}

export function countProductMappingResults(draft: OaiMcProductDraft): { mapped: number; actionNeeded: number } {
  let mapped = 0;
  let actionNeeded = 0;

  if (draft.title) mapped++; else actionNeeded++;
  if (draft.description) mapped++; else actionNeeded++;
  if (draft.link) mapped++; else actionNeeded++;
  if (draft.imageLink) mapped++; else actionNeeded++;
  if (draft.brand) mapped++; else actionNeeded++;
  if (draft.price.amountMicros) mapped++; else actionNeeded++;
  if (draft.offerId) mapped++; else actionNeeded++;
  mapped++; // availability always maps

  return { mapped, actionNeeded };
}
