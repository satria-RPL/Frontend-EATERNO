"use client";

import { useState, useEffect } from "react";
import { Order } from "@/types/order";

interface VoidModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string, pin: string) => void;
  order: Order | null;
}

export default function VoidModal({ open, onClose, onConfirm, order }: VoidModalProps) {
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [pin, setPin] = useState("");

  useEffect(() => {
    setReason("");
    setCustomReason("");
    setPin("");
  }, [open, order]);

  if (!open || !order) return null;

  const handleSubmit = () => {
    const finalReason = (reason === "Lainnya" ? customReason : reason).trim();
    const pinTrimmed = pin.trim();
    if (!finalReason || !pinTrimmed) return;
    onConfirm(finalReason, pinTrimmed);
  };

  const reasons = ["Batal Pesan", "Salah Input", "Lainnya"];

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-lg font-semibold">
            Void Transaksi {order.id ? `#${order.id}` : ""}
          </h2>
          <button className="text-red-500 text-xl" onClick={onClose}>✕</button>
        </div>

        {/* Total */}
        <div className="mt-4">
          <p className="text-sm text-gray-600">Total Tagihan</p>
          <p className="text-orange-600 font-semibold text-lg">
            Rp {order.price?.toLocaleString("id-ID")}
          </p>
        </div>

        {/* Alasan Void */}
        <div className="mt-6">
          <p className="text-sm font-medium">
            Alasan Void <span className="text-red-500">*</span>
          </p>
          <div className="flex gap-3 mt-2">
            {reasons.map((r) => (
              <button
                key={r}
                className={`px-4 py-2 rounded-md border text-sm transition-all ${
                  reason === r
                    ? "bg-orange-500 text-white border-orange-500"
                    : "border-orange-400 text-black hover:bg-orange-100"
                }`}
                onClick={() => setReason(r)}
              >
                {r}
              </button>
            ))}
          </div>

          {reason === "Lainnya" && (
            <input
              className="w-full mt-3 border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-2 focus:border-orange-400"
              placeholder="Tulis alasan lain..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
            />
          )}
        </div>

        {/* Otorisasi */}
        <div className="mt-6">
          <p className="text-sm font-medium">
            Otorisasi <span className="text-red-500">*</span>
          </p>
          <span className="inline-block border border-orange-400 text-orange-500 rounded-md px-4 py-2 text-sm mt-2">
            {order.name}
          </span>
        </div>

        {/* PIN */}
        <div className="mt-6">
          <p className="text-sm font-medium">
            PIN <span className="text-red-500">*</span>
          </p>
          <input
            type="password"
            className="w-full mt-2 border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-2 focus:border-orange-400"
            placeholder="Masukkan PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
        </div>

        {/* Submit */}
        <div className="mt-8">
          <button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-md text-sm font-medium transition-all"
            onClick={handleSubmit}
            disabled={!reason || (reason === "Lainnya" && !customReason) || !pin}
          >
            Void
          </button>
        </div>
      </div>
    </div>
  );
}
