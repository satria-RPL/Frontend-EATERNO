"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ReceiptText, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { Wallet, QrCode, Landmark } from "lucide-react";
import { getCoupons } from "@/lib/services/couponService";
import { calculateRounding } from "@/lib/rounding";
import { Button } from "@/components/ui/Button";
import { getCouponUIState } from "@/lib/utils/coupon-ui";

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
  const selectedTable = tableParam ?? null;
  const nameParam = searchParams?.get("name");
  const orderTypeParam = searchParams?.get("orderType");
  const isPaymentsPage = pathname?.includes("/main/products/payments");

  const toggleCoupon = (coupon: string) => {
    setSelectedCoupons((prev) => {
      const next = prev.includes(coupon)
        ? prev.filter((c) => c !== coupon)
        : [...prev, coupon];
      persistCheckoutState({ selectedCoupons: next });
      return next;
    });
  };

  type PromotionRule = {
    type: "percentage_discount" | "fixed_discount";
    value: number;
  };

  const [coupons, setCoupons] = useState<Coupon[]>([]);

  type Coupon = {
    id: number;
    name: string;
    placeId: number;
    startAt: string;
    endAt: string;
    rules: PromotionRule[];
  };

  useEffect(() => {
    getCoupons()
      .then(({ promotions, rules }) => {
        const mappedCoupons = promotions.map((promo) => ({
          id: promo.id,
          name: promo.name,
          placeId: promo.placeId,
          startAt: promo.startAt,
          endAt: promo.endAt,
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
    const saved = window.localStorage.getItem("eaterno-checkout");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as CheckoutState;
      if (parsed.paymentMethod) setPaymentMethod(parsed.paymentMethod);
      if (Array.isArray(parsed.selectedCoupons)) {
        setSelectedCoupons(parsed.selectedCoupons);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("lastTransactionCode");
    if (stored) setOrderCode(stored);
  }, []);

  const [orderType, setOrderType] = useState<"dinein" | "takeaway" | null>(
    null
  );

  useEffect(() => {
    const saved = localStorage.getItem("eaterno-checkout");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      setOrderType(parsed.orderType ?? null);
    } catch {}
  }, []);

  const cart = useCartStore((s) => s.cart);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const getSubtotal = useCartStore((s) => s.getSubtotal);

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
  const tax = Math.round((subtotal * taxPercent) / 100);
  const baseTotal = subtotal + tax - discount;
  const { rounding, roundedTotal } = calculateRounding(baseTotal);
  const total = roundedTotal;

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
    persistCheckoutState({
      paymentMethod: chosenMethod,
      selectedCoupons,
    });

    const query = params.toString();
    setIsRouting(true);

    router.push(
      query ? `/main/products/payments?${query}` : "/main/products/payments"
    );
  };

  const handleChangeTable = () => {
    const saved = localStorage.getItem("eaterno-checkout");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);

      // ⬅️ HANYA hapus tableId
      delete parsed.tableId;

      localStorage.setItem("eaterno-checkout", JSON.stringify(parsed));

      const params = new URLSearchParams();
      if (parsed.customerName) params.set("name", parsed.customerName);
      if (parsed.orderType) params.set("orderType", parsed.orderType);

      router.push(`/main/products/choosetable?${params.toString()}`);
    } catch {}
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
              {selectedTable ? `Table No. #${selectedTable}` : "Table No. -"}
            </span>

            <span className="text-gray-400 text-xs font-semibold">
              {orderCode ? `#${orderCode}` : "#-"}
            </span>
          </div>
          {/* Change Table */}
          {orderType === "dinein" && (
            <button
              onClick={handleChangeTable}
              className="mt-2 inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-orange-500 transition hover:bg-orange-50"
            >
              <Image
                src="/icon/change.svg"
                alt="Change Table"
                width={25}
                height={25}
              />
              Change Table
            </button>
          )}
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
              <span>
                {rounding >= 0
                  ? `Rp ${formatRp(rounding)}`
                  : `-Rp ${formatRp(Math.abs(rounding))}`}
              </span>
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
                      onClick={() => {
                        setPaymentMethod(m.value);
                        persistCheckoutState({ paymentMethod: m.value });
                      }}
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
                    const uiState = getCouponUIState(coupon, selectedCoupons);

                    const iconSrc =
                      uiState === "selected"
                        ? "/icon/selected.svg"
                        : uiState === "expired"
                        ? "/icon/expired.svg"
                        : "/icon/available.svg";

                    return (
                      <button
                        key={coupon.id}
                        disabled={uiState === "expired"}
                        onClick={() => toggleCoupon(coupon.name)}
                        className={`group w-full flex justify-between items-center px-3 py-2 rounded-lg font-semibold transition
            ${
              uiState === "selected"
                ? "bg-orange-100 text-orange-600"
                : uiState === "expired"
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-orange-50"
            }
          `}
                      >
                        {/* LEFT ICON + TEXT */}
                        <span className="flex items-center gap-2">
                          <Image
                            src={iconSrc}
                            width={23}
                            height={23}
                            alt={uiState}
                          />
                          {coupon.name}
                        </span>

                        {/* RIGHT RADIO */}
                        <span
                          className={`w-4 h-4 rounded-full border transition
              ${
                uiState === "selected"
                  ? "bg-orange-500 border-orange-500"
                  : uiState === "expired"
                  ? "border-gray-300"
                  : "border-gray-400 group-hover:border-orange-400"
              }
            `}
                        />
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
            <Button
              onClick={handleContinue}
              disabled={isCartEmpty}
              size="lg"
              className="w-full rounded-2xl text-sm font-semibold text-white disabled:bg-gray-300 disabled:text-gray-500"
            >
              <ReceiptText size={20} className="mr-1" />
              Proses Order
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}

function persistCheckoutState(next: Partial<CheckoutState>) {
  if (typeof window === "undefined") return;
  const saved = window.localStorage.getItem("eaterno-checkout");
  let current: CheckoutState = {};
  if (saved) {
    try {
      current = JSON.parse(saved) as CheckoutState;
    } catch {
      current = {};
    }
  }
  const merged = { ...current, ...next };
  window.localStorage.setItem("eaterno-checkout", JSON.stringify(merged));
}

type CheckoutState = {
  customerName?: string;
  orderType?: "takeaway" | "dinein";
  tableId?: number | null;
  paymentMethod?: string;
  selectedCoupons?: string[];
  cashInput?: string;
};
