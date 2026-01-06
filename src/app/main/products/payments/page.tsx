"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useCartStore } from "@/data/cart";
import { createTransaction } from "@/lib/services/transactionService";
import { calculateRounding } from "@/lib/rounding";
import { getCoupons } from "@/lib/services/couponService";
import { Button } from "@/components/ui/Button";
import { Wallet, QrCode, Landmark } from "lucide-react";

type PaymentMethod = "Qris" | "Cash" | "Bank";

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

function formatCashInput(value: string) {
  if (!value) return "";
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const [method, setMethod] = useState<PaymentMethod>("Qris");
  const [cashInput, setCashInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCoupons, setSelectedCoupons] = useState<string[]>([]);
  const [checkoutLoaded, setCheckoutLoaded] = useState(false);
  const cart = useCartStore((s) => s.cart);
  const clearCart = useCartStore((s) => s.clearCart);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const router = useRouter();

  const subtotal = useMemo(() => getSubtotal(), [cart, getSubtotal]);
  const itemsCount = useMemo(
    () => cart.reduce((sum, item) => sum + (item.qty ?? 0), 0),
    [cart]
  );
  const taxAmount = useMemo(() => Math.round((subtotal * 10) / 100), [subtotal]);
  const discountAmount = useMemo(() => {
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
  }, [coupons, selectedCoupons, subtotal]);
  const baseTotal = useMemo(
    () => subtotal + taxAmount - discountAmount,
    [subtotal, taxAmount, discountAmount]
  );
  const roundingAmount = useMemo(() => {
    const { rounding } = calculateRounding(baseTotal);
    return rounding;
  }, [baseTotal]);
  const totalAmount = useMemo(() => {
    const { roundedTotal } = calculateRounding(baseTotal);
    return roundedTotal;
  }, [baseTotal]);

  useEffect(() => {
    const paramMethod = searchParams?.get("method");
    if (!paramMethod) return;

    const normalized = paramMethod.toLowerCase();
    if (normalized === "cash") setMethod("Cash");
    if (normalized === "qris") setMethod("Qris");
    if (normalized === "bank") setMethod("Bank");
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (checkoutLoaded) return;
    const saved = getCheckoutState();
    if (!searchParams?.get("method") && saved.paymentMethod) {
      const normalized = saved.paymentMethod.toLowerCase();
      if (normalized === "cash") setMethod("Cash");
      if (normalized === "qris") setMethod("Qris");
      if (normalized === "bank") setMethod("Bank");
    }
    if (typeof saved.cashInput === "string") {
      setCashInput(saved.cashInput);
    }
    if (Array.isArray(saved.selectedCoupons)) {
      setSelectedCoupons(saved.selectedCoupons);
    }
    setCheckoutLoaded(true);
  }, [searchParams, checkoutLoaded]);

  useEffect(() => {
    let cancelled = false;
    getCoupons()
      .then(({ promotions, rules }) => {
        if (cancelled) return;
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
      .catch(() => {
        if (!cancelled) setCoupons([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    persistCheckoutState({
      paymentMethod: method,
      cashInput,
    });
  }, [method, cashInput]);

  const cashNumber = Number(cashInput.replace(/\D/g, ""));
  const change = cashNumber > totalAmount ? cashNumber - totalAmount : 0;
  const canProcessCash = cashInput !== "" && cashNumber >= totalAmount;
  const tableParam = searchParams?.get("table");
  const tableId = tableParam ? Number(tableParam) : null;
  const placeParam = searchParams?.get("place");
  const placeId = placeParam ? Number(placeParam) : null;
  const nameParam = searchParams?.get("name");
  const customerName = nameParam?.trim() || null;
  const orderTypeParam = searchParams?.get("orderType");

  const paymentMethodId = method === "Cash" ? 1 : method === "Qris" ? 2 : 3;

  const buildTransactionItems = () =>
    cart.map((item) => ({
      menuId: item.productId,
      qty: item.qty ?? 0,
      price: item.price ?? 0,
      variants: (item.addons ?? []).map((addon) => ({
        menuVariantId: addon.variantId ?? null,
        extraPrice: addon.price ?? 0,
        qty: addon.qty ?? 0,
      })),
    }));

  const handleProcessOrder = async () => {
    if (cart.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const savedState = getCheckoutState();
    const storedPlaceId = resolveStoredPlaceId();
    const resolvedTableId = Number.isFinite(tableId)
      ? tableId
      : Number.isFinite(savedState.tableId)
      ? savedState.tableId ?? null
      : null;
    const resolvedPlaceId = Number.isFinite(placeId)
      ? placeId
      : storedPlaceId;
    const resolvedCustomerName =
      customerName ?? savedState.customerName ?? null;
    const resolvedOrderType = resolveOrderType(
      orderTypeParam ?? savedState.orderType ?? null,
      resolvedTableId
    );

    const result = await createTransaction({
      placeId: resolvedPlaceId,
      tableId: resolvedTableId,
      orderType: resolvedOrderType,
      customerName: resolvedCustomerName,
      totalItems: itemsCount,
      total: totalAmount,
      tax: taxAmount,
      discount: discountAmount,
      paymentMethodId,
      items: buildTransactionItems(),
    });

    if (!result.ok) {
      setSubmitError(result.error || "Gagal memproses transaksi");
      setIsSubmitting(false);
      return;
    }

    persistTransactionCode(result.data);
    clearCart();
    clearCheckoutState();
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.delete("method");
    const query = params.toString();
    router.push(query ? `/main/products/list?${query}` : "/main/products/list");
  };

  return (
    <main>
      <div className="p-4">
        {/* Header Tabs */}
        <div className="flex justify-between items-center mb-3">
          <span className="font-medium">Payment via {method}</span>
        </div>

        <div className="flex gap-2 mb-4 text-xs">
          <TabButton label="QRIS" icon={<QrCode size={16} />} active={method === "Qris"} onClick={() => setMethod("Qris")} />
          <TabButton label="Cash" icon={<Wallet size={16} />} active={method === "Cash"} onClick={() => setMethod("Cash")} />
          <TabButton label="Bank" icon={<Landmark size={16} />} active={method === "Bank"} onClick={() => setMethod("Bank")} />
        </div>

        {/* Card Content */}
        <div className="p-4">
          {method === "Qris" && (
            <QrisView total={totalAmount} rounding={roundingAmount} />
          )}
          {method === "Cash" && (
            <CashView
              total={totalAmount}
              cashInput={cashInput}
              setCashInput={setCashInput}
              change={change}
              onSubmit={handleProcessOrder}
              submitting={isSubmitting}
              errorMessage={submitError}
              canProcess={canProcessCash}
            />
          )}
          {method === "Bank" && (
            <BankWaitingView total={totalAmount} rounding={roundingAmount} />
          )}
        </div>
      </div>
    </main>
  );
}

function resolveOrderType(
  value: string | null,
  tableId: number | null
) {
  if (value) {
    const normalized = value.toLowerCase().replace(/[\s_-]/g, "");
    if (normalized === "dinein") return "dine_in";
    if (normalized === "takeaway" || normalized === "takeout") return "takeaway";
  }
  return tableId ? "dine_in" : "takeaway";
}

function persistTransactionCode(payload: unknown) {
  if (!payload || typeof window === "undefined") return;
  const record =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : null;
  const transaction =
    record && typeof record.data === "object" && record.data != null
      ? (record.data as Record<string, unknown>)
      : record;
  const rawCode =
    transaction?.code ??
    transaction?.orderNumber ??
    transaction?.order_no ??
    transaction?.invoiceNumber ??
    transaction?.invoice_no ??
    transaction?.receiptNumber ??
    transaction?.receipt_no ??
    transaction?.id;
  if (!rawCode) return;
  const code = String(rawCode).replace(/^#/, "");
  if (!code) return;
  window.localStorage.setItem("lastTransactionCode", code);
}

function TabButton({ label, active, onClick, icon }: { label: string; active: boolean; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`py-2 px-5 rounded-md border flex items-center gap-2 transition font-semibold
      ${active ? "bg-orange-500 text-white border-orange-500" : "bg-white border-orange-300 text-orange-500"}`}
    >
      {icon}
      {label}
    </button>
  );
}

// === QRIS VIEW ===

function QrisView({ total, rounding }: { total: number; rounding: number }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-150 h-100 rounded-xl bg-gray-100 flex items-center justify-center">
        <div className="grid grid-cols-3 grid-rows-3 gap-2">
          <div className="w-14 h-14 border-8 border-gray-400 rounded-sm" />
          <div className="w-14 h-14 border-8 border-gray-400 rounded-sm" />
          <div className="w-14 h-14 bg-transparent" />
          <div className="w-14 h-14 border-8 border-gray-400 rounded-sm" />
          <div className="w-14 h-14 bg-gray-400 rounded-sm" />
          <div className="w-14 h-14 bg-gray-400 rounded-sm" />
          <div className="w-14 h-14 bg-gray-400 rounded-sm" />
          <div className="w-14 h-14 bg-gray-400 rounded-sm" />
          <div className="w-14 h-14 bg-gray-400 rounded-sm" />
        </div>
      </div>
      <div className="flex gap-2 justify-start items-start w-145">
        <p className="font-medium">Total:</p>
        <p className="text-orange-500 font-medium">{formatRupiah(total)}</p>
      </div>
      <div className="flex gap-2 justify-start items-start w-145 text-xs text-[#8c8c8c]">
        <p>Rounding:</p>
        <p>
          {rounding >= 0
            ? formatRupiah(rounding)
            : `- ${formatRupiah(Math.abs(rounding))}`}
        </p>
      </div>
    </div>
  );
}

// === CASH VIEW ===

function CashView({
  total,
  cashInput,
  setCashInput,
  change,
  onSubmit,
  submitting,
  errorMessage,
  canProcess,
}: {
  total: number;
  cashInput: string;
  setCashInput: (v: string) => void;
  change: number;
  onSubmit: () => void;
  submitting: boolean;
  errorMessage: string | null;
  canProcess: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3 font-medium">
        <span>Total</span>
        <span className="font-semibold text-[#ff7a1a]">{formatRupiah(total)}</span>
      </div>

      <div className="bg-neutral-50 py-2 px-8 rounded-2xl flex flex-col gap-y-4 my-5">
        <div className="space-y-1">
          <p className="font-medium">Pembayaran Cash</p>
          <input
            type="text"
            inputMode="numeric"
            value={formatCashInput(cashInput)}
            onChange={(e) =>
              setCashInput(e.target.value.replace(/[^\d]/g, ""))
            }
            placeholder="Rp"
            className="w-full rounded-md border-2 border-gray-200 px-2 py-1 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex justify-between items-center text-orange-500">
          <span>Return</span>
          <span className="text-orange-500">{change > 0 ? formatRupiah(change) : "-"}</span>
        </div>
      </div>

      {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

      <Button
        type="button"
        onClick={onSubmit}
        disabled={submitting || !canProcess}
        className="mt-2 w-full rounded-md py-2 font-normal"
      >
        {submitting ? "Memproses..." : "Proses Order"}
      </Button>
    </div>
  );
}

// === BANK / WAITING VIEW ===

function BankWaitingView({
  total,
  rounding,
}: {
  total: number;
  rounding: number;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="flex gap-2 w-full font-medium">
        <span>Total</span>
        <span className="font-medium text-orange-500">{formatRupiah(total)}</span>
      </div>
      <div className="flex gap-2 w-full text-xs text-[#8c8c8c]">
        <span>Rounding</span>
        <span>
          {rounding >= 0
            ? formatRupiah(rounding)
            : `- ${formatRupiah(Math.abs(rounding))}`}
        </span>
      </div>
    </div>
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

function getCheckoutState(): CheckoutState {
  if (typeof window === "undefined") return {};
  const saved = window.localStorage.getItem("eaterno-checkout");
  if (!saved) return {};
  try {
    return JSON.parse(saved) as CheckoutState;
  } catch {
    return {};
  }
}

function clearCheckoutState() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("eaterno-checkout");
}

function resolveStoredPlaceId(): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("eaterno-place-id");
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

type CheckoutState = {
  customerName?: string;
  orderType?: "takeaway" | "dinein";
  tableId?: number | null;
  paymentMethod?: string;
  selectedCoupons?: string[];
  cashInput?: string;
};

type PromotionRule = {
  type: "percentage_discount" | "fixed_discount";
  value: number;
};

type Coupon = {
  id: number;
  name: string;
  placeId: number;
  startAt: string;
  endAt: string;
  rules: PromotionRule[];
};
