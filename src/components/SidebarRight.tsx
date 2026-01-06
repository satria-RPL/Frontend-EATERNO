"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ReceiptText } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { Wallet, QrCode, Landmark } from "lucide-react";
import { type Coupon } from "@/domain/checkout/coupons";
import { createCouponsLoader } from "@/domain/checkout/couponsLoader";
import { calculateTotals } from "@/domain/checkout/pricing";
import { persistCheckoutState, readCheckoutState } from "@/lib/checkout/storage";
import { getCoupons } from "@/lib/services/couponService";
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

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const { loadCoupons } = useMemo(
    () => createCouponsLoader({ getCoupons }),
    []
  );

  useEffect(() => {
    loadCoupons()
      .then((mapped) => setCoupons(mapped))
      .catch((err) => console.error("Failed load coupons", err));
  }, [loadCoupons]);

  useEffect(() => {
    const saved = readCheckoutState();
    if (saved.paymentMethod) setPaymentMethod(saved.paymentMethod);
    if (Array.isArray(saved.selectedCoupons)) {
      setSelectedCoupons(saved.selectedCoupons);
    }
    if (saved.orderType) {
      setOrderType(saved.orderType);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("lastTransactionCode");
    if (stored) setOrderCode(stored);
  }, []);

  const [orderType, setOrderType] = useState<"dinein" | "takeaway" | null>(
    null
  );


  const cart = useCartStore((s) => s.cart);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const getSubtotal = useCartStore((s) => s.getSubtotal);

  const itemsCount = cart.reduce((sum, i) => sum + (i.qty || 0), 0);
  const isCartEmpty = cart.length === 0;
  const subtotal = getSubtotal();
  const taxPercent = 10;
  const totals = calculateTotals({
    subtotal,
    taxPercent,
    coupons,
    selectedCoupons,
  });
  const discount = totals.discount;
  const tax = totals.tax;
  const rounding = totals.rounding;
  const total = totals.total;

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
    const saved = readCheckoutState();
    persistCheckoutState({ tableId: null });

    const params = new URLSearchParams();
    if (saved.customerName) params.set("name", saved.customerName);
    if (saved.orderType) params.set("orderType", saved.orderType);

    router.push(`/main/products/choosetable?${params.toString()}`);
  };

  return (
    <>
      {isRouting && (
        <div className="fixed inset-0 z-40 bg-white flex items-center justify-center">
          <Loading variant="request-payment" />
        </div>
      )}
      <aside className="fixed top-22 right-0 bottom-0 w-[360px] border-l border-gray-200 bg-stone-50 p-4 flex flex-col overflow-y-auto hide-scrollbar">
        {/* HEADER: info meja + kasir */}
        <div className="bg-white rounded-[20px] px-4 py-2 mb-2">
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
                className="inline-flex items-center gap-2 rounded-md text-sm font-medium text-orange-500 transition hover:bg-orange-50"
              >
                <Image
                  src="/icon/change.svg"
                  alt="Change Table"
                  width={20}
                  height={25}
                  className="-mr-1"
                />
                Change Table
              </button>
            )}
          </div>

          <div className="overflow-y-auto overscroll-y-contain px-4 space-y-4 hide-scrollbar flex-1">
            {/* LIST ORDER */}
            <div className="space-y-4 pb-2 border-b border-orange-100">
              {cart.length === 0 && (
                <div className="text-sm text-gray-500">Cart kosong</div>
              )}

              {cart.map((item, idx) => {
                const addonsTotal = (item.addons || []).reduce(
                  (s: number, a: any) => s + (a.price || 0) * (a.qty || 0),
                  0
                );
                const productPrice = item.price ?? 0;
                const itemTotal =
                  (productPrice + addonsTotal) * (item.qty ?? 1);

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
            <div className="bg-white py-2 text-xs mb-2 text-zinc-500">
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
                <span>-Rp {formatRp(discount)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Rounding</span>
                <span>
                  {rounding >= 0
                    ? `Rp ${formatRp(rounding)}`
                    : `-Rp ${formatRp(Math.abs(rounding))}`}
                </span>
              </div>

              <div className="flex justify-between mt-2 pt-2 text-sm font-semibold border-t border-orange-100">
                <span className="text-black">Total</span>
                <span className="text-orange-500">Rp {formatRp(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {!isPaymentsPage && (
          <>
            {/* PEMBAYARAN VIA */}
            <div className="bg-white rounded-[20px] px-4 py-2 mb-2">
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
            <div className="bg-white rounded-[20px] px-4 py-2 mb-2">
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

