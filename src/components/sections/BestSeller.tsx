"use client";

import Image from "next/image";
import Card from "../cards/Card";
import { type BestSellerItem } from "@/domain/bestSeller";

const FALLBACK_IMAGE = "/img/coffee.jpg";

type BestSellerProps = {
  items: BestSellerItem[];
};

export default function BestSeller({ items }: BestSellerProps) {
  return (
    <Card>
      <div className="p-2">
        <h2 className="text-2xl font-medium mb-4">Best Seller</h2>

        <div className="space-y-1.5">
          {items.length === 0 && (
            <div className="text-sm text-gray-500">Belum ada data.</div>
          )}

          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src={item.image || FALLBACK_IMAGE}
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

              <span className="text-lg font-[Poppins] font-semibold">
                {item.sold}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
