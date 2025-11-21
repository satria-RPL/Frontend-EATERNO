import React, { useState } from "react";
import { Order } from "@/types/order";

export default function VoidModal({ order, onClose, onConfirm }: { order: Order; onClose: () => void; onConfirm: () => void; }) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold">Void Transaksi {order.id}</h3>
        <p className="text-sm text-gray-600 mt-2">Apakah anda yakin ingin membatalkan transaksi ini?</p>
        <textarea value={reason} onChange={(e)=>setReason(e.target.value)} placeholder="Alasan void (opsional)" className="w-full mt-3 p-2 border rounded" />
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="btn-outline">Batal</button>
          <button onClick={() => onConfirm()} className="btn">Confirm Void</button>
        </div>
      </div>
    </div>
  );
}
