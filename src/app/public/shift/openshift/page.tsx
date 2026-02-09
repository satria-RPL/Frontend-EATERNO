"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

import ShiftModal from "@/components/modals/ShiftModal";
import {
  createShiftOptionsLoader,
  type ShiftOption,
  type StationOption,
} from "@/domain/shift/shiftOptions";
import { createOpenShiftAction } from "@/domain/shift/openShift";
import { createCashierShiftStatusLoader } from "@/domain/shift/cashierShiftStatus";
import {
  createCashierShift,
  fetchCashierShifts,
  fetchShifts,
  fetchStations,
} from "@/lib/services/shiftService";
import { usePolling } from "@/lib/hooks/usePolling";

function formatCashInput(value: string) {
  if (!value) return "";
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const { loadShiftOptions, loadStationOptions } = createShiftOptionsLoader({
  fetchShifts,
  fetchStations: () => fetchStationsWithTimeout(5000),
});

const { openShift } = createOpenShiftAction({ createCashierShift });
const { loadOccupiedStationIds } = createCashierShiftStatusLoader({
  fetchCashierShifts,
});

export default function OpenShiftPage() {
  const [shift, setShift] = useState("");
  const [station, setStation] = useState("");
  const [amount, setAmount] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [shiftOptions, setShiftOptions] = useState<ShiftOption[]>([]);
  const [shiftLoading, setShiftLoading] = useState(true);
  const [shiftError, setShiftError] = useState<string | null>(null);
  const [stationOptions, setStationOptions] = useState<StationOption[]>([]);
  const [stationLoading, setStationLoading] = useState(true);
  const [stationError, setStationError] = useState<string | null>(null);
  const [stationNotice, setStationNotice] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRouting, startRouting] = useTransition();
  const [isShiftOpen, setIsShiftOpen] = useState(false);
  const [isStationOpen, setIsStationOpen] = useState(false);
  const [occupiedStationIds, setOccupiedStationIds] = useState<string[]>([]);
  const shiftSelectRef = useRef<HTMLDivElement | null>(null);
  const stationSelectRef = useRef<HTMLDivElement | null>(null);
  const isMountedRef = useRef(true);

  const router = useRouter();
  const amountNumber = Number(amount);
  const isAmountValid = !Number.isNaN(amountNumber) && amountNumber > 0;
  const occupiedStationSet = new Set(occupiedStationIds);
  const isStationOptionOccupied = (option: StationOption) => {
    if (occupiedStationSet.has(option.value)) return true;
    if (option.id && occupiedStationSet.has(option.id)) return true;
    if (option.label && occupiedStationSet.has(option.label)) return true;
    return false;
  };
  const isStationOccupied =
    station !== "" &&
    (occupiedStationSet.has(station) ||
      stationOptions.some(
        (option) => option.value === station && isStationOptionOccupied(option)
      ));

  const isFormValid =
    shift !== "" && station !== "" && isAmountValid && !isStationOccupied;
  const shiftLabel =
    shiftOptions.find((option) => option.value === shift)?.label ?? "";
  const stationLabel =
    stationOptions.find((option) => option.value === station)?.label ?? "";

  const handleContinue = () => {
    if (!isFormValid) return;
    setShowModal(true);
  };

  const handleModalContinue = () => {
    if (!isFormValid) return;

    setSubmitError(null);
    setIsSubmitting(true);

    const selectedShift = shiftOptions.find((option) => option.value === shift);
    const selectedStation = stationOptions.find(
      (option) => option.value === station
    );
    const placeId = selectedShift?.placeId ?? selectedStation?.placeId ?? "";

    openShift({
      shiftId: shift,
      stationId: station,
      placeId,
      openingBalance: amountNumber,
    })
      .then((result) => {
        if (!result.ok) {
          throw new Error(result.error || "Gagal membuka shift.");
        }
        persistPlaceId(placeId);
        startRouting(() => router.push("/main/dashboard"));
      })
      .catch((err) => {
        setSubmitError(
          err instanceof Error ? err.message : "Gagal membuka shift."
        );
        setIsSubmitting(false);
      });
  };

  useEffect(() => {
    let isActive = true;

    const loadShifts = async () => {
      const cachedShifts = readCachedShifts();
      const shouldShowLoading = !cachedShifts || cachedShifts.length === 0;
      if (shouldShowLoading) {
        setShiftLoading(true);
      }
      setShiftError(null);

      try {
        const result = await loadShiftOptions();
        if (!isActive) return;

        setShiftOptions(result.options);
        writeCachedShifts(result.options);
        setShift((current) =>
          result.options.some((option) => option.value === current)
            ? current
            : ""
        );
        setShiftError(result.error);
      } catch {
        if (!isActive) return;
        setShiftOptions([]);
        setShift("");
        setShiftError("Gagal mengambil data shift");
      } finally {
        if (isActive && shouldShowLoading) setShiftLoading(false);
      }
    };

    loadShifts();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const cachedShifts = readCachedShifts();
    if (cachedShifts) {
      setShiftOptions(cachedShifts);
      setShiftLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (shiftSelectRef.current && !shiftSelectRef.current.contains(target)) {
        setIsShiftOpen(false);
      }
      if (
        stationSelectRef.current &&
        !stationSelectRef.current.contains(target)
      ) {
        setIsStationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadStations = async () => {
      setStationLoading(true);
      setStationError(null);
      setStationNotice(null);

      try {
        const result = await loadStationOptions();
        if (!isActive) return;

        setStationOptions(result.options);
        setStation((current) =>
          result.options.some((option) => option.value === current)
            ? current
            : ""
        );
        setStationError(result.error);
      } catch {
        if (!isActive) return;
        setStationOptions([]);
        setStation("");
        setStationError("Gagal mengambil data station");
      } finally {
        if (isActive) setStationLoading(false);
      }
    };

    loadStations();

    return () => {
      isActive = false;
    };
  }, []);

  const loadOccupiedStations = useCallback(async () => {
    if (stationOptions.length === 0) {
      if (isMountedRef.current) {
        setOccupiedStationIds([]);
      }
      return;
    }

    try {
      const statusResult = await withTimeoutSignal(3500, (signal) =>
        loadOccupiedStationIds({ cache: "no-store", signal })
      );

      if (!statusResult.ok) {
        if (isMountedRef.current) {
          setOccupiedStationIds([]);
          setStationNotice("Gagal memuat status station aktif");
        }
        return;
      }

      const occupiedIds = statusResult.occupiedIds;
      const occupiedSet = new Set(occupiedIds);
      const occupiedInListCount = stationOptions.reduce((count, option) => {
        const isOccupied =
          occupiedSet.has(option.value) ||
          (option.id && occupiedSet.has(option.id));
        return count + (isOccupied ? 1 : 0);
      }, 0);
      if (isMountedRef.current) {
        setOccupiedStationIds(occupiedIds);
        setStation((current) =>
          current &&
          (occupiedSet.has(current) ||
            stationOptions.some(
              (option) =>
                option.value === current &&
                option.id &&
                occupiedSet.has(option.id)
            ))
            ? ""
            : current
        );

        if (
          stationOptions.length > 0 &&
          occupiedInListCount >= stationOptions.length
        ) {
          setStationNotice("Semua station sedang dipakai");
        }
      }
    } catch {
      if (isMountedRef.current) {
        setOccupiedStationIds([]);
        setStationNotice("Gagal memuat status station aktif");
      }
    }
  }, [stationOptions]);

  usePolling(loadOccupiedStations, { intervalMs: 2000, immediate: true });

  useEffect(() => {
    if (isStationOpen) {
      loadOccupiedStations();
    }
  }, [isStationOpen, loadOccupiedStations]);

  return (
    <div className="w-full mx-auto pt-8 gap-8 flex flex-col px-4 sm:px-8 lg:px-24 xl:px-48 max-w-5xl">
      {/* Shift */}
      <div className="mb-6">
        <label className="block mb-5 text-xl font-medium">Shift</label>
        <div className="relative" ref={shiftSelectRef}>
          <button
            type="button"
            disabled={shiftLoading || shiftOptions.length === 0}
            onClick={() => {
              if (shiftLoading || shiftOptions.length === 0) return;
              setIsShiftOpen((prev) => !prev);
              setIsStationOpen(false);
            }}
            className={`w-full rounded-2xl border-2 px-6 py-4 text-left text-lg transition ${
              shiftLoading || shiftOptions.length === 0
                ? "border-zinc-500 text-gray-400"
                : "border-zinc-500 text-gray-700 hover:border-zinc-600"
            }`}
          >
            <span className="flex items-center justify-between">
              <span className={shiftLabel ? "text-gray-800" : "text-gray-400"}>
                {shiftLabel ||
                  (shiftLoading ? "Memuat shift..." : "Pilih Shift")}
              </span>
              <ChevronDown
                className={`h-5 w-5 text-gray-500 transition ${
                  isShiftOpen ? "rotate-180" : ""
                }`}
              />
            </span>
          </button>
          {isShiftOpen && (
            <div className="absolute z-20 mt-4 w-full rounded-2xl border border-gray-200 bg-white shadow-sm">
              <span className="absolute -top-2 left-8 h-4 w-4 rotate-45 border-l border-t border-gray-200 bg-white" />
              <div className="max-h-72 overflow-auto">
                {shiftOptions.length === 0 ? (
                  <div className="px-6 py-4 text-gray-500">
                    Shift tidak tersedia
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {shiftOptions.map((option) => {
                      const isSelected = option.value === shift;
                      return (
                        <li key={option.value}>
                          <button
                            type="button"
                            onClick={() => {
                              setShift(option.value);
                              setIsShiftOpen(false);
                            }}
                            className="flex w-full items-center justify-between px-6 py-4 text-left text-gray-700 hover:bg-gray-50"
                          >
                            <span>{option.label}</span>
                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                isSelected
                                  ? "border-orange-500"
                                  : "border-gray-400"
                              }`}
                            >
                              <span
                                className={`h-3 w-3 rounded-full ${
                                  isSelected
                                    ? "bg-orange-500"
                                    : "bg-transparent"
                                }`}
                              />
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
        {shiftError && (
          <p className="mt-2 text-sm text-red-500">{shiftError}</p>
        )}
      </div>

      {/* Station */}
      <div className="mb-6">
        <label className="block mb-5 text-xl font-medium">Station</label>
        <div className="relative" ref={stationSelectRef}>
          <button
            type="button"
            onClick={() => {
              setIsStationOpen((prev) => !prev);
              setIsShiftOpen(false);
            }}
            className={`w-full rounded-2xl border-2 px-6 py-4 text-left text-lg transition ${
              stationLoading
                ? "border-zinc-500 text-gray-400"
                : "border-zinc-500 text-gray-700 hover:border-zinc-600"
            }`}
          >
            <span className="flex items-center justify-between">
              <span
                className={stationLabel ? "text-gray-800" : "text-gray-400"}
              >
                {stationLabel ||
                  (stationLoading ? "Memuat station..." : "Pilih Station")}
              </span>
              <ChevronDown
                className={`h-5 w-5 text-gray-500 transition ${
                  isStationOpen ? "rotate-180" : ""
                }`}
              />
            </span>
          </button>
          {isStationOpen && (
            <div className="absolute z-20 mt-4 w-full rounded-2xl border border-gray-200 bg-white shadow-sm">
              <span className="absolute -top-2 left-8 h-4 w-4 rotate-45 border-l border-t border-gray-200 bg-white" />
              <div className="max-h-72 overflow-auto">
                {stationOptions.length === 0 ? (
                  <div className="px-6 py-4 text-gray-500">
                    {stationLoading ? "Memuat station..." : "Station tidak tersedia"}
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {stationOptions.map((option) => {
                      const isSelected = option.value === station;
                      const isOccupied = isStationOptionOccupied(option);
                      return (
                        <li key={option.value}>
                          <button
                            type="button"
                            disabled={isOccupied}
                            aria-disabled={isOccupied}
                            title={isOccupied ? "Station sedang dipakai" : undefined}
                            onClick={() => {
                              if (isOccupied) return;
                              setStation(option.value);
                              setIsStationOpen(false);
                            }}
                            className={`flex w-full items-center justify-between px-6 py-4 text-left ${
                              isOccupied
                                ? "cursor-not-allowed text-gray-400"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span>{option.label}</span>
                            </span>
                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                isSelected
                                  ? "border-orange-500"
                                  : "border-gray-400"
                              }`}
                            >
                              <span
                                className={`h-3 w-3 rounded-full ${
                                  isSelected
                                    ? "bg-orange-500"
                                    : "bg-transparent"
                                }`}
                              />
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
        {stationError && (
          <div className="mt-2 flex items-center gap-3 text-sm text-red-500">
            <span>{stationError}</span>
          </div>
        )}
        {!stationError && isStationOccupied && (
          <p className="mt-2 text-sm text-red-500">
            Station sedang dipakai kasir lain
          </p>
        )}
        {!stationError && !isStationOccupied && stationNotice && (
          <p className="mt-2 text-sm text-(--primary)">{stationNotice}</p>
        )}
      </div>

      {/* Total Uang Pembuka */}
      <div className="mb-6">
        <label className="block mb-5 text-xl font-medium">
          Total Uang Pembuka
        </label>
        <input
          type="text"
          inputMode="numeric"
          placeholder="Rp"
          value={formatCashInput(amount)}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
          className="w-full border-2 rounded-lg px-4 py-3 border-zinc-500 focus:border-zinc-600 outline-none"
        />
      </div>

      {/* Button Continue */}
      <button
        disabled={!isFormValid}
        onClick={handleContinue}
        className={`w-full py-3 rounded-lg font-medium text-white transition
          ${
            !isFormValid
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-600"
          }
        `}
      >
        Continue
      </button>
      {submitError && (
        <p className="mt-3 text-sm text-red-500">{submitError}</p>
      )}

      <ShiftModal
        open={showModal}
        amount={isAmountValid ? amountNumber : 0}
        onCancel={() => setShowModal(false)}
        onContinue={handleModalContinue}
        pending={isRouting || isSubmitting}
        title="Start Shift?"
        description="Dengan Total Pembukaan"
      />
    </div>
  );
}

function persistPlaceId(placeId: string) {
  if (typeof window === "undefined") return;
  if (!placeId) return;
  window.localStorage.setItem("eaterno-place-id", placeId);
}

const SHIFT_CACHE_KEY = "eaterno-shifts-cache";
const OPTIONS_CACHE_TTL_MS = 5 * 60 * 1000;

function readCachedShifts(): ShiftOption[] | null {
  return readCachedOptions<ShiftOption>(SHIFT_CACHE_KEY);
}

function writeCachedShifts(options: ShiftOption[]) {
  writeCachedOptions(SHIFT_CACHE_KEY, options);
}

function readCachedOptions<T>(key: string): T[] | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { savedAt?: number; options?: T[] };
    if (!parsed || !Array.isArray(parsed.options)) return null;
    if (typeof parsed.savedAt !== "number") return null;
    if (Date.now() - parsed.savedAt > OPTIONS_CACHE_TTL_MS) return null;
    return parsed.options;
  } catch {
    return null;
  }
}

function writeCachedOptions<T>(key: string, options: T[]) {
  if (typeof window === "undefined") return;
  if (options.length === 0) return;
  const payload = {
    savedAt: Date.now(),
    options,
  };
  window.localStorage.setItem(key, JSON.stringify(payload));
}

async function withTimeoutSignal<T>(
  timeoutMs: number,
  task: (signal: AbortSignal) => Promise<T>
) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await task(controller.signal);
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function fetchStationsWithTimeout(timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchStations({
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeoutId);
  }
}