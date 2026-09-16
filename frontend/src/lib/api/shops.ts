import { apiClient, ApiError } from "@/lib/api/client";
import {
  shopDetailSchema,
  shopListSchema,
  type ShopDetail,
  type ShopSummary,
} from "@/types/shop";

export async function getShops(): Promise<ShopSummary[]> {
  const data = await apiClient<ShopSummary[]>("/shops", {
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(4000),
  });

  return shopListSchema.parse(data);
}

export async function getShop(slug: string): Promise<ShopDetail | null> {
  try {
    const data = await apiClient<ShopDetail>(`/shops/${slug}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(4000),
    });
    return shopDetailSchema.parse(data);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}
