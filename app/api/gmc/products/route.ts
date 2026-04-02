import { getUserId } from "@/lib/get-user-id";
import { getGmcAccounts, getProductCampaignLinks } from "@/lib/tokens";
import { fetchProducts } from "@/lib/gmc/products";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = getGmcAccounts(userId);
  const products = await fetchProducts(accounts);
  const links = getProductCampaignLinks(userId);

  return Response.json({ products, links });
}
