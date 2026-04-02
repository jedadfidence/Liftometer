import type { GmcProduct, GmcAccount } from "@/lib/types/gmc";
import { MOCK_PRODUCTS } from "./mock-data";
import { merchantApiUrl } from "./client";

export async function fetchProducts(accounts: GmcAccount[]): Promise<GmcProduct[]> {
  if (process.env.USE_MOCK_DATA === "true") {
    return MOCK_PRODUCTS;
  }

  const allProducts: GmcProduct[] = [];

  for (const account of accounts) {
    const res = await fetch(merchantApiUrl(account.merchantId, "products"), {
      headers: { Authorization: `Bearer ${account.accessToken}` },
    });

    if (!res.ok) continue;

    const data = await res.json();
    const products = (data.resources ?? []) as GmcProduct[];
    for (const product of products) {
      allProducts.push({ ...product, accountId: account.merchantId, accountName: account.name });
    }
  }

  return allProducts;
}

export async function fetchProductById(
  productId: string,
  accounts: GmcAccount[],
): Promise<GmcProduct | null> {
  if (process.env.USE_MOCK_DATA === "true") {
    return MOCK_PRODUCTS.find((p) => p.offerId === productId) ?? null;
  }

  const products = await fetchProducts(accounts);
  return products.find((p) => p.offerId === productId) ?? null;
}
