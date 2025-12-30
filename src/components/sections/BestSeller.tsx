"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Card from "../cards/Card";
import { buildBestSellers, type BestSellerItem } from "@/domain/bestSeller";
import { fetchTransactionItems } from "@/lib/services/transactionItemsService";

const FALLBACK_IMAGE = "/img/coffee.jpg";
const MAX_ITEMS = 4;

export default function BestSeller() {
  const [items, setItems] = useState<BestSellerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchTransactionItems();
        if (!result.ok) {
          throw new Error(result.error || "Gagal memuat best seller.");
        }

        const bestSellers = buildBestSellers(result.data, {
          maxItems: MAX_ITEMS,
          fallbackImage: FALLBACK_IMAGE,
        });
        if (!isActive) return;
        setItems(bestSellers);
      } catch (err) {
        if (!isActive) return;
        setItems([]);
        setError(
          err instanceof Error ? err.message : "Gagal memuat best seller."
        );
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <Card className="p-6">
      <h2 className="text-lg font-[Poppins] font-semibold mb-4">Best Seller</h2>

      <div className="space-y-1.5">
        {isLoading && (
          <div className="text-sm text-gray-500">Loading...</div>
        )}

        {!isLoading && error && (
          <div className="text-sm text-red-500">{error}</div>
        )}

        {!isLoading && !error && items.length === 0 && (
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
    </Card>
  );
}
