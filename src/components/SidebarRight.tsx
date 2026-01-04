"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ReceiptText, CheckCircle2, CircleSlash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Wallet, QrCode, Landmark } from "lucide-react";
import { getCoupons } from "@/lib/services/couponService";

const paymentOptions = [
  {
    value: "Cash",
    label: "Cash",
    icon: <Wallet size={14} />,
  },
  {
    value: "Qris",
    label: "QRIS",
    icon: <QrCode size={14} />,
  },
  {
    value: "Bank",
    label: "Bank",
    icon: <Landmark size={14} />,
  },
];

import { getCartLineKey, useCartStore } from "@/data/cart";
import Loading from "./ui/Loading";

function formatRp(value: number) {
  return value.toLocaleString("id-ID");
}

export default function SidebarRight() {
  const [isRouting, setIsRouting] = useState(false);
  const [orderCode, setOrderCode] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [selectedCoupons, setSelectedCoupons] = useState<string[]>([]);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const tableParam = searchParams?.get("table");
  const selectedTable = tableParam ? Number(tableParam) : null;
  const nameParam = searchParams?.get("name");
  const orderTypeParam = searchParams?.get("orderType");
  const isPaymentsPage = pathname?.includes("/main/products/payments");

  const toggleCoupon = (coupon: string) => {
    if (selectedCoupons.includes(coupon)) {
      setSelectedCoupons((prev) => prev.filter((c) => c !== coupon));
    } else {
      setSelectedCoupons((prev) => [...prev, coupon]);
    }
  };

  type PromotionRule = {
    type: "percentage_discount" | "fixed_discount";
    value: number;
  };

  const [coupons, setCoupons] = useState<Coupon[]>([]);

  type Coupon = {
    name: string;
    rules: PromotionRule[];
  };

  useEffect(() => {
    getCoupons()
      .then(({ promotions, rules }) => {
        const mappedCoupons = promotions.map((promo) => ({
          name: promo.name,
          rules: rules
            .filter((r) => r.promotionId === promo.id)
            .map((r) => ({
              type: r.ruleType as "percentage_discount" | "fixed_discount",
              value: Number(r.value),
            })),
        }));

        setCoupons(mappedCoupons);
      })
      .catch((err) => console.error("Failed load coupons", err));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("lastTransactionCode");
    if (stored) setOrderCode(stored);
  }, []);

  const cart = useCartStore((s) => s.cart);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getTotal = useCartStore((s) => s.getTotal);

  const itemsCount = cart.reduce((sum, i) => sum + (i.qty || 0), 0);
  const isCartEmpty = cart.length === 0;
  const subtotal = getSubtotal();
  const taxPercent = 10;
  const discount = (() => {
    let totalDiscount = 0;

    const activeCoupons = coupons.filter((c) =>
      selectedCoupons.includes(c.name)
    );

    for (const coupon of activeCoupons) {
      for (const rule of coupon.rules ?? []) {
        if (rule.type === "percentage_discount") {
          totalDiscount += (subtotal * rule.value) / 100;
        }

        if (rule.type === "fixed_discount") {
          totalDiscount += rule.value;
        }
      }
    }

    return Math.min(totalDiscount, subtotal);
  })();
  const rounding = 0;
  const tax = Math.round((subtotal * taxPercent) / 100);
  const total = getTotal({ taxPercent, discount, rounding });

  const handleRemove = (productId: number, lineKey?: string) => {
    removeFromCart(productId, lineKey);
  };

  const router = useRouter();
  const handleContinue = () => {
    const chosenMethod = paymentMethod || "Qris";
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (selectedTable) params.set("table", selectedTable.toString());
    if (nameParam) params.set("name", nameParam);
    if (orderTypeParam) params.set("orderType", orderTypeParam);
    if (chosenMethod) params.set("method", chosenMethod);

    const query = params.toString();
    setIsRouting(true);

    router.push(
      query ? `/main/products/payments?${query}` : "/main/products/payments"
    );
  };

  return (
    <>
      {isRouting && (
        <div className="fixed inset-0 z-40 bg-white flex items-center justify-center">
          <Loading />
        </div>
      )}
      <aside className="fixed top-22 right-0 bottom-0 w-[360px] border-l border-gray-200 bg-white p-4 flex flex-col">
        {/* HEADER: info meja + kasir */}
        <div className="mb-4 border-b border-orange-100 pb-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold">
              {selectedTable ? `Table No. #${selectedTable}` : "Table No. —"}
            </span>
            <span className="text-gray-400 text-xs font-semibold">
              {orderCode ? `#${orderCode}` : "#-"}
            </span>
          </div>
        </div>

        <div className="overflow-y-auto overscroll-y-contain px-4 pb-4 space-y-4 hide-scrollbar flex-1">
          {/* LIST ORDER */}
          <div className="space-y-4 pb-3 border-b border-orange-100">
            {cart.length === 0 && (
              <div className="text-sm text-gray-500">Cart kosong</div>
            )}

            {cart.map((item, idx) => {
              const addonsTotal = (item.addons || []).reduce(
                (s: number, a: any) => s + (a.price || 0) * (a.qty || 0),
                0
              );
              const productPrice = item.price ?? 0;
              const itemTotal = (productPrice + addonsTotal) * (item.qty ?? 1);

              return (
                <div key={`${item.productId}-${idx}`}>
                  <div className="flex justify-between items-center mb-2 gap-2">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">
                        {item.productName}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs">{item.qty ?? 1}x</p>
                    </div>

                    <button
                      onClick={() =>
                        handleRemove(item.productId, getCartLineKey(item))
                      }
                      className="text-red-500 text-xs"
                      aria-label="remove item"
                    >
                      <Image
                        src="/icon/trash.png"
                        height={18}
                        width={18}
                        alt="trash"
                      />
                    </button>
                  </div>

                  {/* ADDONS */}
                  {item.addons?.length > 0 && (
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <div>
                        {item.addons.map((a: any, i: number) => (
                          <p key={`${item.productId}-${a.id}-${i}`}>
                            {a.name} × {a.qty}
                          </p>
                        ))}
                      </div>
                      <div className="text-right">
                        {item.addons.map((a: any, i: number) => (
                          <p key={`${item.productId}-${a.id}-price-${i}`}>
                            + Rp {formatRp((a.price || 0) * (a.qty || 0))}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-right text-sm font-semibold text-orange-500 mt-2">
                    Rp {formatRp(itemTotal)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* RINGKASAN */}
          <div className="bg-white py-3 text-xs mb-4">
            <div className="flex justify-between mb-1">
              <span>Items</span>
              <span>{itemsCount}x</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Subtotal</span>
              <span>Rp {formatRp(subtotal)}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Tax (10%)</span>
              <span>Rp {formatRp(tax)}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Discount</span>
              <span className="text-red-500">-Rp {formatRp(discount)}</span>
            </div>
            <div className="flex justify-between mb-8">
              <span>Rounding</span>
              <span>{rounding}</span>
            </div>

            <div className="flex justify-between mt-2 pt-2 text-sm font-semibold border-t border-orange-100">
              <span>Total</span>
              <span className="text-orange-500">Rp {formatRp(total)}</span>
            </div>
          </div>

          {!isPaymentsPage && (
            <>
              {/* PEMBAYARAN VIA */}
              <div className="mb-4">
                <p className="text-xs font-semibold mb-2">Pembayaran Via</p>

                <div className="flex flex-wrap gap-2">
                  {paymentOptions.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setPaymentMethod(m.value)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-[5px] border text-xs transition ${
                        paymentMethod === m.value
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-white text-gray-600 border-gray-200"
                      }`}
                    >
                      {m.icon}
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* COUPON DISC */}
              <div className="mb-4">
                <p className="text-xs font-semibold mb-2">Coupon Disc</p>
                <div className="space-y-2 text-xs">
                  {coupons.map((coupon) => {
                    const active = selectedCoupons.includes(coupon.name);
                    return (
                      <button
                        key={coupon.name}
                        onClick={() => toggleCoupon(coupon.name)}
                        className={`w-full flex justify-between items-center px-3 py-2 rounded-lg text-xs font-semibold ${
                          active
                            ? "bg-orange-100 text-orange-600"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {active ? (
                            <CheckCircle2
                              size={18}
                              className="text-orange-500"
                            />
                          ) : (
                            <CircleSlash2 size={18} className="text-gray-400" />
                          )}
                          {coupon.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* BUTTON PROSES */}
        {!isPaymentsPage && (
          <div className="pt-5">
            <button
              className="w-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-white transition disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
              onClick={handleContinue}
              disabled={isCartEmpty}
            >
              <ReceiptText size={20} className="mr-1" />
              Proses Order
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
