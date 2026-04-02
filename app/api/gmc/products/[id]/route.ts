import { getUserId } from "@/lib/get-user-id";
import { getGmcAccounts } from "@/lib/tokens";
import { fetchProductById } from "@/lib/gmc/products";
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
  const accounts = getGmcAccounts(userId);
  const product = await fetchProductById(id, accounts);

  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  return Response.json({ product });
}
