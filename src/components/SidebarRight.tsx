"use client";

import Image from "next/image";

export default function SidebarRight() {
  return (
    <aside
      className="
        fixed top-20 right-0 bottom-0 w-[360px] border-l border-gray-200 bg-white p-4 flex flex-col"
    >
      {/* HEADER: info meja + kasir */}
      <div className="mb-4 border-b border-orange-100 pb-2">
        <div className="flex justify-between items-center text-sm">
          <span className="font-semibold">Table No. #4</span>
          <span className="text-gray-400 text-xs font-semibold">#5011CB14</span>
        </div>
      </div>

      <div className="overflow-y-auto overscroll-y-contain px-4 pb-4 space-y-4 hide-scrollbar">
        {/* LIST ORDER */}
        <div className="space-y-4 pb-3 border-b border-orange-100">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-sm">Caramel Capucinno</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">1x</p>
              </div>
              <button className="text-red-500 text-xs">
                <Image
                  src="/icon/trash.png"
                  height={20}
                  width={20}
                  alt="trash"
                />
              </button>
            </div>

            <div className="flex justify-between text-xs text-gray-500 space-y-1">
              <div>
                <p>Sugar 100g</p>
                <p>Large Cup</p>
              </div>
              <div>
                <p>&nbsp;&nbsp; + Rp 5.000</p>
                <p>&nbsp;&nbsp; + Rp 5.000</p>
              </div>
            </div>

            <p className="text-right text-sm font-semibold text-orange-500 mt-2">
              Rp 20.000
            </p>
          </div>
        </div>

        {/* RINGKASAN */}
        <div className="bg-white py-3 text-xs mb-4">
          <div className="flex justify-between mb-1">
            <span>Items</span>
            <span>2x</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Subtotal</span>
            <span>50.000</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Tax (10%)</span>
            <span>4.000</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Discon Used</span>
            <span className="text-red-500">-4.000</span>
          </div>
          <div className="flex justify-between mb-8">
            <span>Rounding</span>
            <span>-1</span>
          </div>

          <div className="flex justify-between mt-2 pt-2 text-sm font-semibold border-t border-orange-100">
            <span>Total</span>
            <span className="text-orange-500">Rp 50.000</span>
          </div>
        </div>

        {/* PEMBAYARAN VIA */}
        <div className="mb-4">
          <p className="text-xs font-semibold mb-2">Pembayaran Via</p>
          <div className="flex flex-wrap gap-2">
            {["Cash", "QRIS", "Bank"].map((m) => (
              <button
                key={m}
                className="px-3 py-1 rounded-full border text-xs bg-white"
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* CUPON DISC */}
        <div className="mb-4">
          <p className="text-xs font-semibold mb-2">Cupon Disc</p>
          <div className="space-y-2 text-xs">
            <button className="w-full flex justify-between items-center px-3 py-2 rounded-lg bg-orange-100 text-orange-600">
              <span>GEBYAR HARI RAYA</span>
              <span>●</span>
            </button>
            <button className="w-full flex justify-between items-center px-3 py-2 rounded-lg bg-gray-100 text-gray-500">
              <span>17 AGUSTUS</span>
              <span>○</span>
            </button>
          </div>
        </div>

        {/* PEMBAYARAN CASH */}
        <div className="mb-4">
          <p className="text-xs font-semibold mb-1">Pembayaran Cash</p>
          <input
            type="number"
            className="w-full rounded-lg border px-3 py-2 text-sm mb-1"
            placeholder="Rp"
          />
          <div className="flex justify-between text-xs">
            <span>Return</span>
            <span className="text-orange-500 font-semibold">Rp 500.000</span>
          </div>
        </div>

        {/* BUTTON PROSES */}
        <button className="w-full bg-orange-500 text-white py-3 rounded-2xl text-sm font-semibold">
          Proses Order
        </button>
      </div>
    </aside>
  );
}
