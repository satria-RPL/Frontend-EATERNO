"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { LogOut } from "lucide-react";
import HistoryOrderSearchBar from "@/components/HistoryOrderSearchBar";
import { fetchTransactions } from "@/lib/services/transactionService";
import { fetchCashierShifts } from "@/lib/services/shiftService";

type NavbarProps = {
  userName?: string;
  role?: string;
  avatarUrl?: string;
  onNotificationClick?: () => void;
  showLogout?: boolean;
  showSearch?: boolean;
};

export default function Navbar({
  userName,
  role,
  avatarUrl = "/img/profil.webp",
  onNotificationClick,
  showLogout = false,
  showSearch = true,
}: NavbarProps) {
  const [timeLabel, setTimeLabel] = useState(
    new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);
  const [notifItems, setNotifItems] = useState<NotificationItem[]>([]);
  const [notifShiftKey, setNotifShiftKey] = useState<string | null>(null);
  const prevNotifOpen = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLabel(
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  const loadNotifications = useCallback(async (showLoading: boolean) => {
    if (showLoading) {
      setNotifLoading(true);
    }
    setNotifError(null);

    try {
      const [transactionsRes, shiftsRes] = await Promise.all([
        fetchTransactions({ cache: "no-store" }),
        fetchCashierShifts({ cache: "no-store" }),
      ]);

      const payload = transactionsRes.ok
        ? (transactionsRes.data as TransactionResponse | null)
        : null;
      const shiftsPayload = shiftsRes.ok ? shiftsRes.data : null;

      if (!transactionsRes.ok || !payload) {
        setNotifError(transactionsRes.ok ? "Gagal memuat notifikasi" : transactionsRes.error);
        setNotifItems([]);
        return;
      }

      const transactions = Array.isArray(payload)
        ? payload
        : payload.data ?? [];

      const nextShiftKey = resolveShiftKey(shiftsPayload) ?? "default";
      const readState = loadNotificationReadState(nextShiftKey);
      const readSet = new Set(readState.readEventKeys);
      const mapped = transactions.map(mapTransactionNotification);
      const withRead = mapped.map((item) => ({
        ...item,
        isRead: isEventRead(item.eventKey, readSet, item.code),
      }));
      const newestFive = [...withRead]
        .sort((a, b) => compareTimestampDesc(a.timestamp, b.timestamp))
        .slice(0, 5);
      const sorted = newestFive.sort((a, b) => {
        const readDiff = Number(a.isRead) - Number(b.isRead);
        if (readDiff !== 0) return readDiff;
        return compareTimestampDesc(a.timestamp, b.timestamp);
      });
      setNotifShiftKey(readState.shiftKey);
      setNotifItems(sorted);
    } catch {
      setNotifError("Gagal memuat notifikasi");
      setNotifItems([]);
    } finally {
      if (showLoading) {
        setNotifLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (notifOpen) {
      loadNotifications(true);
    }
  }, [notifOpen, loadNotifications]);

  useEffect(() => {
    loadNotifications(false);
    const interval = setInterval(() => {
      loadNotifications(false);
    }, 30_000);

    return () => clearInterval(interval);
  }, [loadNotifications]);

  useEffect(() => {
    if (prevNotifOpen.current && !notifOpen) {
      if (notifShiftKey && notifItems.length > 0) {
        const readState = loadNotificationReadState(notifShiftKey);
        const nextRead = new Set(readState.readEventKeys);
        notifItems.forEach((item) => nextRead.add(item.eventKey));
        saveNotificationReadState(notifShiftKey, Array.from(nextRead));
        setNotifItems((current) =>
          current.map((item) => ({ ...item, isRead: true }))
        );
      }
    }

    prevNotifOpen.current = notifOpen;
  }, [notifOpen, notifItems, notifShiftKey]);

  const hasUnread = notifItems.some((item) => !item.isRead);
  const firstReadIndex = notifItems.findIndex((item) => item.isRead);

  const handleLogout = async () => {
    try {
      const res = await fetch("/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        console.error("Logout gagal", res.status);
        return;
      }
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Logout gagal", error);
    }
  };

  return (
    <nav className="fixed top-0 z-50 w-full bg-(--background) shadow-sm">
      <div className="mx-auto flex max-w-full items-center justify-between px-4 py-3 sm:px-8">
        <div className="flex h-16 w-full items-center justify-between gap-4 sm:gap-6">
          <div
            className={`flex items-center ${
              showSearch ? "gap-6 sm:gap-20" : "gap-4"
            }`}
          >
            <div className="text-lg font-bold">
              <Image
                src="/img/brand.webp"
                width={150}
                height={150}
                alt="Eaterno brand"
              />
            </div>
            {showSearch ? <HistoryOrderSearchBar /> : null}
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((prev) => !prev);
                  onNotificationClick?.();
                }}
                className="relative rounded-full border-2 border-(--tertiary) p-3 transition cursor-pointer"
                aria-label="Notifikasi"
                aria-expanded={notifOpen}
              >
                <NotificationIcon />
                {hasUnread && (
                  <span className="absolute left-8 -top-0.5 h-3 w-3 rounded-full bg-orange-500 ring-2 ring-white" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute -right-4 top-full z-50 mt-4 w-[480px] rounded-2xl border border-[#e6e1dc] bg-white p-5 shadow-xl">
                  <div className="absolute right-8 -top-2 h-4 w-4 rotate-45 border-l border-t border-[#e6e1dc] bg-white" />
                  <div className="space-y-4 pt-2 text-[15px] text-[#1c1c1c]">
                    {notifLoading && (
                      <p className="text-sm text-[#8c8c8c]">
                        Memuat notifikasi...
                      </p>
                    )}
                    {!notifLoading && notifError && (
                      <p className="text-sm text-red-500">{notifError}</p>
                    )}
                    {!notifLoading &&
                      !notifError &&
                      notifItems.length === 0 && (
                        <p className="text-sm text-[#8c8c8c]">
                          Belum ada notifikasi.
                        </p>
                      )}
                    {!notifLoading &&
                      !notifError &&
                      notifItems.map((item, index) => {
                        const isLast = index === notifItems.length - 1;
                        const isBeforeSeparator =
                          firstReadIndex > 0 && index === firstReadIndex - 1;
                        const showReadSeparator =
                          firstReadIndex > 0 && index === firstReadIndex;
                        return (
                          <div key={`${item.eventKey}-${index}`}>
                            {showReadSeparator && (
                              <div className="my-2 border-t-2 border-orange-400" />
                            )}
                            <div
                              className={
                                isLast || isBeforeSeparator
                                  ? "space-y-1"
                                  : "space-y-1 border-b border-[#efe7e0] pb-2"
                              }
                            >
                              <div className="flex items-center justify-between text-black">
                                <span
                                  className={`${
                                    item.isRead ? "opacity-70" : ""
                                  } text-sm font-medium`}
                                >
                                  {item.title}
                                </span>
                                <span
                                  className={`${
                                    item.isRead ? "opacity-70" : ""
                                  } text-[13px] font-medium`}
                                >
                                  {item.code}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            <Image
              src={avatarUrl}
              width={100}
              height={100}
              alt={`${userName} avatar`}
              className="h-fit w-fit object-cover"
            />

            <div className="text-left">
              <div className="font-bold">
                {userName}
              </div>
              <div className="text-black/50 text-base font-normal">
                {role} {timeLabel}
              </div>
            </div>
            {showLogout && (
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500 text-white transition hover:bg-red-600"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function NotificationIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="25"
      height="25"
      viewBox="0 0 27 29"
      fill="none"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.90724 10.5C2.90724 7.71523 4.01349 5.04451 5.98262 3.07538C7.95175 1.10625 10.6225 0 13.4072 0C16.192 0 18.8627 1.10625 20.8319 3.07538C22.801 5.04451 23.9072 7.71523 23.9072 10.5V16.146L26.6402 21.612C26.7661 21.8636 26.8255 22.1431 26.8128 22.4241C26.8002 22.7051 26.7159 22.9782 26.568 23.2175C26.4201 23.4568 26.2135 23.6543 25.9678 23.7912C25.7222 23.9282 25.4455 24 25.1642 24H19.2182C18.8846 25.2874 18.1329 26.4275 17.0811 27.2414C16.0294 28.0553 14.7371 28.4969 13.4072 28.4969C12.0773 28.4969 10.7851 28.0553 9.73335 27.2414C8.6816 26.4275 7.9299 25.2874 7.59624 24H1.65024C1.36896 24 1.09234 23.9282 0.846645 23.7912C0.600953 23.6543 0.394351 23.4568 0.246462 23.2175C0.0985726 22.9782 0.0143066 22.7051 0.00166693 22.4241C-0.0109727 22.1431 0.0484338 21.8636 0.174244 21.612L2.90724 16.146V10.5ZM10.8092 24C11.0726 24.456 11.4513 24.8347 11.9073 25.098C12.3634 25.3613 12.8807 25.4999 13.4072 25.4999C13.9338 25.4999 14.4511 25.3613 14.9072 25.098C15.3632 24.8347 15.7419 24.456 16.0052 24H10.8092ZM13.4072 3C11.4181 3 9.51047 3.79018 8.10394 5.1967C6.69742 6.60322 5.90724 8.51088 5.90724 10.5V16.146C5.90721 16.6115 5.79885 17.0706 5.59074 17.487L3.83574 21H22.9802L21.2252 17.487C21.0166 17.0707 20.9077 16.6116 20.9072 16.146V10.5C20.9072 8.51088 20.1171 6.60322 18.7105 5.1967C17.304 3.79018 15.3964 3 13.4072 3Z"
        fill="black"
        fillOpacity="0.35"
      />
    </svg>
  );
}

type Transaction = {
  id?: number;
  code?: string | number | null;
  orderNumber?: string | number | null;
  order_no?: string | number | null;
  invoiceNumber?: string | number | null;
  invoice_no?: string | number | null;
  receiptNumber?: string | number | null;
  receipt_no?: string | number | null;
  status?: string | null;
  createdAt?: string | null;
  created_at?: string | null;
};

type TransactionResponse = Transaction[] | { data?: Transaction[] };

type NotificationItem = {
  title: string;
  code: string;
  detail?: string;
  isRead: boolean;
  eventKey: string;
  timestamp: number | null;
};

function mapTransactionNotification(tx: Transaction): NotificationItem {
  const code = resolveTransactionCode(tx);
  const status = normalizeStatus(tx.status);
  const timestamp = resolveTransactionTimestamp(tx);
  if (status === "paid" || status === "done" || status === "selesai") {
    return {
      title: "Order Berhasil",
      code,
      detail: `Order Dengan ID Transaksi ${code} Berhasil`,
      eventKey: `${code}|${status}`,
      isRead: false,
      timestamp,
    };
  }
  if (status === "cancel" || status === "canceled" || status === "cancelled") {
    return {
      title: "Order Dicancel",
      code,
      eventKey: `${code}|${status}`,
      isRead: false,
      timestamp,
    };
  }
  return {
    title: "Order Dibuat",
    code,
    eventKey: `${code}|${status || "created"}`,
    isRead: false,
    timestamp,
  };
}

function resolveTransactionCode(tx: Transaction): string {
  const raw =
    tx.code ??
    tx.orderNumber ??
    tx.order_no ??
    tx.invoiceNumber ??
    tx.invoice_no ??
    tx.receiptNumber ??
    tx.receipt_no ??
    tx.id ??
    "-";
  const value = String(raw);
  return value.startsWith("#") ? value : `#${value}`;
}

function resolveTransactionTimestamp(tx: Transaction): number | null {
  const raw =
    tx.createdAt ??
    tx.created_at ??
    tx.id ??
    tx.code ??
    tx.orderNumber ??
    tx.order_no ??
    tx.invoiceNumber ??
    tx.invoice_no ??
    tx.receiptNumber ??
    tx.receipt_no ??
    null;

  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const numeric = Number(trimmed);
    if (Number.isFinite(numeric)) return numeric;
    const parsed = Date.parse(trimmed);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

type CashierShiftApiItem = {
  id?: number | string;
  shiftId?: number | string;
  openedAt?: string;
  status?: string;
};

type NotificationReadState = {
  shiftKey: string;
  readEventKeys: string[];
};

const NOTIF_STORAGE_KEY = "eaterno-notification-read";

function loadNotificationReadState(shiftKey: string): NotificationReadState {
  const normalizedKey = shiftKey || "default";
  const fallback: NotificationReadState = {
    shiftKey: normalizedKey,
    readEventKeys: [],
  };

  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(NOTIF_STORAGE_KEY);
    if (!raw) {
      saveNotificationReadState(normalizedKey, []);
      return fallback;
    }
    const parsed = JSON.parse(raw) as
      | Partial<NotificationReadState>
      | { readCodes?: string[] }
      | null;
    const parsedShiftKey =
      parsed && typeof parsed === "object" && "shiftKey" in parsed
        ? parsed.shiftKey
        : null;
    if (!parsed || parsedShiftKey !== normalizedKey) {
      saveNotificationReadState(normalizedKey, []);
      return fallback;
    }
    if (
      parsed &&
      typeof parsed === "object" &&
      "readEventKeys" in parsed &&
      Array.isArray(parsed.readEventKeys)
    ) {
      return {
        shiftKey: normalizedKey,
        readEventKeys: parsed.readEventKeys.filter(
          (code: unknown) => typeof code === "string"
        ),
      };
    }
    if (
      parsed &&
      typeof parsed === "object" &&
      "readCodes" in parsed &&
      Array.isArray(parsed.readCodes)
    ) {
      const legacy = parsed.readCodes
        .filter((code: unknown) => typeof code === "string")
        .map((code) => `${code}|*`);
      saveNotificationReadState(normalizedKey, legacy);
      return {
        shiftKey: normalizedKey,
        readEventKeys: legacy,
      };
    }
    return fallback;
  } catch {
    saveNotificationReadState(normalizedKey, []);
    return fallback;
  }
}

function saveNotificationReadState(shiftKey: string, readEventKeys: string[]) {
  if (typeof window === "undefined") return;
  const capped = readEventKeys.slice(-10);
  const payload: NotificationReadState = {
    shiftKey,
    readEventKeys: capped,
  };
  window.localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(payload));
}

function resolveShiftKey(payload: unknown): string | null {
  const items = unwrapArray<CashierShiftApiItem>(payload);
  if (items.length === 0) return null;

  const openItems = items.filter((item) => item.status === "open");
  const candidate =
    pickLatestByOpenedAt(openItems) ?? pickLatestByOpenedAt(items) ?? items[0];
  const raw = candidate?.id ?? candidate?.shiftId ?? candidate?.openedAt;
  if (!raw) return null;
  return String(raw);
}

function unwrapArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return [];

  const record = payload as Record<string, unknown>;
  const candidates = [
    record.data,
    record.items,
    record.results,
    record.result,
    record.rows,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as T[];
    if (candidate && typeof candidate === "object") {
      const nested = candidate as Record<string, unknown>;
      if (Array.isArray(nested.data)) return nested.data as T[];
    }
  }

  return [];
}

function pickLatestByOpenedAt(items: CashierShiftApiItem[]) {
  let selected: CashierShiftApiItem | null = null;
  let bestTimestamp = Number.NEGATIVE_INFINITY;

  items.forEach((item) => {
    const timestamp = toTimestamp(item.openedAt);
    if (timestamp == null) return;
    if (timestamp > bestTimestamp) {
      bestTimestamp = timestamp;
      selected = item;
    }
  });

  return selected;
}

function toTimestamp(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeStatus(value: string | null | undefined): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function isEventRead(eventKey: string, readSet: Set<string>, code: string) {
  return readSet.has(eventKey) || readSet.has(`${code}|*`);
}

function compareTimestampDesc(a: number | null, b: number | null) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return b - a;
}
