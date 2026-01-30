"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { loadCoupons } from "@/application/payments/coupons";
import {
  persistCheckoutState,
  readCheckoutState,
} from "@/application/payments/checkoutState";
import { processPayment } from "@/application/payments/processPayment";
import {
  connectPrinter,
  disconnectPrinter,
  type SerialPortLike,
} from "@/application/payments/printer";
import { useCartStore } from "@/data/cart";
import { type Coupon } from "@/domain/checkout/coupons";
import { calculateTotals } from "@/domain/checkout/pricing";
import { Button } from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
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

type PaymentPageProps = {
  cashierName?: string;
};

export default function PaymentPage({ cashierName }: PaymentPageProps) {
  const searchParams = useSearchParams();
  const [method, setMethod] = useState<PaymentMethod>("Qris");
  const [cashInput, setCashInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [printError, setPrintError] = useState<string | null>(null);
  const [printerPort, setPrinterPort] = useState<SerialPortLike | null>(null);
  const [printerConnecting, setPrinterConnecting] = useState(false);
  const [baudRate, setBaudRate] = useState(9600);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCoupons, setSelectedCoupons] = useState<string[]>([]);
  const [checkoutLoaded, setCheckoutLoaded] = useState(false);
  const cart = useCartStore((s) => s.cart);
  const clearCart = useCartStore((s) => s.clearCart);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const router = useRouter();
  const orderTypePath = "/main/products/ordertype";

  const subtotal = getSubtotal();
  const itemsCount = useMemo(
    () => cart.reduce((sum, item) => sum + (item.qty ?? 0), 0),
    [cart]
  );
  const totals = useMemo(
    () =>
      calculateTotals({
        subtotal,
        taxPercent: 11,
        coupons,
        selectedCoupons,
      }),
    [subtotal, coupons, selectedCoupons]
  );
  const taxAmount = totals.tax;
  const discountAmount = totals.discount;
  const roundingAmount = totals.rounding;
  const totalAmount = totals.total;

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
    const saved = readCheckoutState();
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
    loadCoupons()
      .then((mapped) => {
        if (cancelled) return;
        setCoupons(mapped);
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

  useEffect(() => {
    const stored = window.localStorage.getItem("eaterno-printer-baud");
    if (!stored) return;
    const parsed = Number(stored);
    if (Number.isFinite(parsed)) setBaudRate(parsed);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("eaterno-printer-baud", String(baudRate));
  }, [baudRate]);

  useEffect(() => {
    const port = printerPort;
    return () => {
      if (!port) return;
      port.close().catch(() => {});
    };
  }, [printerPort]);

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

  const handleProcessOrder = async () => {
    if (cart.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    setPrintError(null);

    const result = await processPayment({
      cart,
      itemsCount,
      totals: {
        total: totalAmount,
        tax: taxAmount,
        discount: discountAmount,
      },
      tableId,
      placeId,
      customerName,
      orderTypeParam: orderTypeParam ?? null,
      paymentMethodId,
      cashierName,
      printerPort,
      baudRate,
    });

    if (!result.ok) {
      setSubmitError(result.submitError || "Gagal memproses transaksi");
      setIsSubmitting(false);
      return;
    }

    if (result.didCreateTransaction) {
      clearCart();
    }

    if (result.printError) {
      setPrintError(result.printError);
    }

    setIsSubmitting(false);
    if (result.shouldNavigate) {
      router.push(orderTypePath);
    }
  };

  return (
    <>
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <Loading variant="print-receipt" />
        </div>
      )}
      <main>
        <div className="p-4">
          {/* Header Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <span className="font-medium">Payment via {method}</span>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                  printerPort
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {printerPort ? "Printer terhubung" : "Printer belum terhubung"}
              </span>
              <select
                className="rounded-md border border-orange-200 bg-white px-2 py-1 text-[11px]"
                value={baudRate}
                onChange={(event) =>
                  setBaudRate(Number(event.target.value))
                }
              >
                {[9600, 19200, 38400, 57600, 115200].map((rate) => (
                  <option key={rate} value={rate}>
                    Baud {rate}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                size="sm"
                className="rounded-full"
                disabled={printerConnecting}
                onClick={async () => {
                  setPrintError(null);
                  setPrinterConnecting(true);
                  const result = await connectPrinter(baudRate);
                  if (result.ok) {
                    setPrinterPort(result.port);
                  } else {
                    setPrintError(result.error);
                  }
                  setPrinterConnecting(false);
                }}
              >
                {printerConnecting ? "Menghubungkan..." : "Connect Printer"}
              </Button>
              {printerPort && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={async () => {
                    await disconnectPrinter(printerPort);
                    setPrinterPort(null);
                  }}
                >
                  Disconnect
                </Button>
              )}
            </div>
          </div>
          {printError && (
            <p className="mb-3 text-sm text-red-500">{printError}</p>
          )}

          <div className="flex gap-2 mb-4 text-xs">
            <TabButton
              label="QRIS"
              icon={<QrCode size={16} />}
              active={method === "Qris"}
              onClick={() => setMethod("Qris")}
            />
            <TabButton
              label="Cash"
              icon={<Wallet size={16} />}
              active={method === "Cash"}
              onClick={() => setMethod("Cash")}
            />
            <TabButton
              label="Bank"
              icon={<Landmark size={16} />}
              active={method === "Bank"}
              onClick={() => setMethod("Bank")}
            />
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
    </>
  );
}



function TabButton({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`py-2 px-5 rounded-md border flex items-center gap-2 transition font-semibold
      ${
        active
          ? "bg-orange-500 text-white border-orange-500"
          : "bg-white border-orange-300 text-orange-500"
      }`}
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
        <span className="font-semibold text-[#ff7a1a]">
          {formatRupiah(total)}
        </span>
      </div>

      <div className="bg-neutral-50 py-2 px-8 rounded-2xl flex flex-col gap-y-4 my-5">
        <div className="space-y-1">
          <p className="font-medium">Pembayaran Cash</p>
          <input
            type="text"
            inputMode="numeric"
            value={formatCashInput(cashInput)}
            onChange={(e) => setCashInput(e.target.value.replace(/[^\d]/g, ""))}
            placeholder="Rp"
            className="w-full rounded-md border-2 border-gray-200 px-2 py-1 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex justify-between items-center text-orange-500">
          <span>Return</span>
          <span className="text-orange-500">
            {change > 0 ? formatRupiah(change) : "-"}
          </span>
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
        <span className="font-medium text-orange-500">
          {formatRupiah(total)}
        </span>
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

