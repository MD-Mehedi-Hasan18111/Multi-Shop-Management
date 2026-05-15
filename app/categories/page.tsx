import { Metadata } from "next";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Link from "next/link";
import { Tag, Package } from "lucide-react";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse products by category.",
};

export default async function CategoriesPage() {
  await dbConnect();

  const categoriesData = await Category.find({}).lean();
  const categories = JSON.parse(JSON.stringify(categoriesData));

  // Get product count per category
  const categoryIds = categories.map((c: any) => c._id);
  const countAgg = await Product.aggregate([
    { $match: { category: { $in: categoryIds.map((id: string) => new mongoose.Types.ObjectId(id)) }, isActive: true } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  const countMap: Record<string, number> = {};
  countAgg.forEach((item: any) => {
    countMap[item._id.toString()] = item.count;
  });

  const COLORS = [
    "from-blue-500 to-cyan-400",
    "from-purple-500 to-pink-400",
    "from-orange-500 to-amber-400",
    "from-green-500 to-emerald-400",
    "from-rose-500 to-red-400",
    "from-indigo-500 to-violet-400",
    "from-teal-500 to-cyan-400",
    "from-fuchsia-500 to-pink-400",
  ];

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">Shop by Category</h1>
        <p className="text-lg text-muted-foreground">Find exactly what you&apos;re looking for</p>
      </div>

      {categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category: any, index: number) => (
            <Link
              key={category._id}
              href={`/products?category=${category.slug}`}
              className="group relative overflow-hidden rounded-3xl p-8 h-52 flex flex-col justify-end transition-all hover:scale-[1.02] hover:shadow-2xl"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${COLORS[index % COLORS.length]} opacity-90 group-hover:opacity-100 transition-opacity`} />
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 text-white space-y-2">
                <Tag className="h-6 w-6" />
                <h3 className="text-2xl font-black">{category.name}</h3>
                <p className="text-white/80 text-sm font-medium">
                  {countMap[category._id] || 0} Products
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 space-y-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
          <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-400">
            <Package size={40} />
          </div>
          <h2 className="text-2xl font-black">No categories yet</h2>
          <p className="text-muted-foreground">Categories will appear here once products are added.</p>
        </div>
      )}
    </div>
  );
}
