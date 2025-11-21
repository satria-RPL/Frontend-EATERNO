"use client";

import { addons } from "@/data/addons";

type AddOnsModalProps = {
  open: boolean;
  onClose: () => void;
  product?: {
    id: number;
    name: string;
  } | null;
};

export default function AddOnsModal({
  open,
  onClose,
  product,
}: AddOnsModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[600px] p-6 max-h-[80vh] overflow-y-auto hide-scrollbar">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">
            Add - Ons {product ? ` · ${product.name}` : ""}
          </h1>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        {addons.map((group) => (
          <div key={group.id} className="mb-6">
            <h2 className="text-lg font-semibold mb-2">{group.category}</h2>

            <div className="space-y-2">
              {group.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center border p-3 rounded-lg bg-orange-50/40"
                >
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-orange-600 font-semibold">
                      Rp {item.price.toLocaleString("id-ID")}
                    </p>
                  </div>

                  {/* tombol + dummy dulu */}
                  <button className="bg-orange-500 text-white px-3 py-1 rounded-lg text-sm">
                    +
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-4 flex justify-between items-center border-t pt-3">
          <span className="text-sm font-medium text-gray-600">
            Total Add - Ons
          </span>
          <span className="text-sm font-semibold text-orange-600">Rp 0</span>
        </div>
      </div>
    </div>
  );
}
