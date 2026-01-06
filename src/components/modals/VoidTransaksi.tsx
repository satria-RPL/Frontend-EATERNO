"use client";

import { useState, useEffect } from "react";
import { Order } from "@/types/order";

interface VoidModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string, pin: string) => void;
  order: Order | null;
  authName?: string;
  authRole?: string;
}

export default function VoidModal({
  open,
  onClose,
  onConfirm,
  order,
  authName,
  authRole,
}: VoidModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-lg font-semibold">
            Void Transaksi {order.id}
          </h2>
          <button className="text-xl text-red-500" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-600">Total Tagihan</p>
          <p className="text-lg font-semibold text-orange-600">
            Rp {order.price?.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium">
            Alasan Void <span className="text-red-500">*</span>
          </p>
          <div className="mt-2 flex gap-3">
            {reasons.map((r) => (
              <button
                key={r}
                className={`rounded-md border px-4 py-2 text-sm transition-all ${
                  reason === r
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-orange-400 text-black hover:bg-orange-100"
                }`}
                onClick={() => setReason(r)}
                type="button"
              >
                {r}
              </button>
            ))}
          </div>

          {reason === "Lainnya" && (
            <input
              className="mt-3 w-full rounded-md border px-3 py-2 text-sm focus:border-2 focus:border-orange-400 focus:outline-none"
              placeholder="Tulis alasan lain..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
            />
          )}
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium">
            Otorisasi <span className="text-red-500">*</span>
          </p>
          <span className="mt-2 inline-block rounded-md border border-orange-400 px-4 py-2 text-sm text-orange-500">
            {authName || "Unknown"}
          </span>
          {authRole && <p className="mt-1 text-xs text-gray-500">{authRole}</p>}
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium">
            PIN <span className="text-red-500">*</span>
          </p>
          <input
            type="password"
            className="mt-2 w-full rounded-md border px-3 py-2 text-sm focus:border-2 focus:border-orange-400 focus:outline-none"
            placeholder="Masukkan PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
        </div>

        <div className="mt-8">
          <button
            className="w-full rounded-md bg-orange-500 py-2.5 text-sm font-medium text-white transition-all hover:bg-orange-600"
            onClick={handleSubmit}
            disabled={!reason || (reason === "Lainnya" && !customReason) || !pin}
            type="button"
          >
            Void
          </button>
        </div>
      </div>
    </div>
  );
}
