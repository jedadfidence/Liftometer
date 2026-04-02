import { getUserId } from "@/lib/get-user-id";
import { getProductIdsForCampaign, getGmcAccounts } from "@/lib/tokens";
import { fetchProducts } from "@/lib/gmc/products";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const productIds = getProductIdsForCampaign(userId, id);

  if (productIds.length === 0) {
    return Response.json({ products: [] });
  }

  const accounts = getGmcAccounts(userId);
  const allProducts = await fetchProducts(accounts);
  const linked = allProducts.filter((p) => productIds.includes(p.offerId));

  return Response.json({ products: linked });
}
