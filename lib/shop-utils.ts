import ShopSettings from "@/models/ShopSettings";

/**
 * Attaches shop information (name, logo, slug) to a list of products.
 * This is useful in Next.js server components where we fetch products directly from DB.
 */
export async function attachShopInfo(products: any[]) {
  if (!products || products.length === 0) return [];

  const shopkeeperIds = Array.from(new Set(products.map(p => p.shopkeeper?.toString()).filter(Boolean)));

  if (shopkeeperIds.length === 0) return products;

  const shopSettings = await ShopSettings.find({
    shopkeeper: { $in: shopkeeperIds }
  }).lean();

  const shopMap = new Map();
  shopSettings.forEach(setting => {
    shopMap.set(setting.shopkeeper.toString(), {
      _id: setting._id.toString(),
      shopName: setting.shopName,
      logo: setting.logo,
      slug: setting.slug,
      isBlocked: setting.isBlocked
    });
  });

  return products.map(product => {
    const shopkeeperId = product.shopkeeper?.toString();
    return {
      ...product,
      shop: shopMap.get(shopkeeperId) || null
    };
  });
}
