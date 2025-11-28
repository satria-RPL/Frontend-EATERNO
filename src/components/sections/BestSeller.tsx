"use client";

import bestData from "@/data/bestSeller.json"; // tetap ada, tidak aku hapus
import { products } from "@/data/products";     // ⬅ tambahan
import Card from "../cards/Card";
import Image from "next/image";

export default function BestSeller() {
  // =============================
  // Tambahan: Ambil dari products
  // =============================
  const bestSellerFromProducts = [...products]
    .sort((a, b) => b.available - a.available) // pakai available sebagai dummy sold
    .slice(0, 4)
    .map((p) => ({
      name: p.name,
      price: p.price,
      sold: p.available,
      image: p.image,
    }));

  return (
    <Card className="p-6">
      <h2 className="text-lg font-[Poppins] font-semibold mb-4">Best Seller</h2>

      <div className="space-y-1.5">
        {bestSellerFromProducts.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between"
          >
            {/* Left: Image + name + price */}
            <div className="flex items-center gap-3">
              <Image
                src={item.image || "/products/sandwich.png"} // fallback
                alt="product"
                width={50}
                height={50}
                className="rounded-md object-cover"
              />

              <div>
                <p className="font-semibold font-[Poppins]">{item.name}</p>
                <p className="text-sm text-orange-500 font-[Poppins]">
                  Rp {item.price.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {/* Right: Sold */}
            <span className="text-lg font-[Outfit] font-semibold">
              {item.sold}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
