export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category: { _id: string; name: string; slug: string };
  shop?: { _id: string; shopName: string; logo: string; slug: string; isBlocked?: boolean };
  stock: number;
  lowStockThreshold?: number;
  averageRating?: number;
  reviewCount?: number;
  barcode?: string;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}
