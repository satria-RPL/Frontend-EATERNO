"use client";

import bestData from "@/data/bestSeller.json";
import Card from "../cards/Card";

// komponen BestSeller untuk menampilkan daftar produk terlaris
export default function BestSeller() {
  return (
    <Card>
      <h2 className="text-lg font-semibold mb-4">Best Seller</h2>

      <div className="space-y-4">
        {bestData.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between border-b pb-2"
          >
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-gray-500">
                Rp {item.price.toLocaleString("id-ID")}
              </p>
            </div>

            <span className="text-lg font-bold">{item.sold}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
