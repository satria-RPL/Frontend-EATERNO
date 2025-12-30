"use client";

import { useEffect, useState, useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

import ShiftModal from "@/components/modals/ShiftModal";
import {
  createShiftOptionsLoader,
  type ShiftOption,
  type StationOption,
} from "@/domain/shift/shiftOptions";
import { createOpenShiftAction } from "@/domain/shift/openShift";
import {
  createCashierShift,
  fetchShifts,
  fetchStations,
} from "@/lib/services/shiftService";

const { loadShiftOptions, loadStationOptions } = createShiftOptionsLoader({
  fetchShifts,
  fetchStations,
});

const { openShift } = createOpenShiftAction({ createCashierShift });

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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRouting, startRouting] = useTransition();

  const router = useRouter();
  const amountNumber = Number(amount);
  const isAmountValid = !Number.isNaN(amountNumber) && amountNumber > 0;

  const isFormValid = shift !== "" && station !== "" && isAmountValid;

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
      setShiftLoading(true);
      setShiftError(null);

      try {
        const result = await loadShiftOptions();
        if (!isActive) return;

        setShiftOptions(result.options);
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
        if (isActive) setShiftLoading(false);
      }
    };

    loadShifts();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadStations = async () => {
      setStationLoading(true);
      setStationError(null);

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

  return (
    <div className="w-full mx-auto pt-10 gap-10 flex flex-col px-48">
      {/* Shift */}
      <div className="mb-6">
        <label className="block mb-5 text-xl font-medium">Shift</label>
        <div className="relative">
          <select
            value={shift}
            onChange={(e) => setShift(e.target.value)}
            disabled={shiftLoading || shiftOptions.length === 0}
            className="w-full border rounded-lg px-4 py-3 appearance-none text-gray-700"
          >
            <option value="" disabled hidden>
              {shiftLoading ? "Memuat shift..." : "Pilih Shift"}
            </option>
            {!shiftLoading && shiftOptions.length === 0 && (
              <option value="" disabled>
                Shift tidak tersedia
              </option>
            )}
            {shiftOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>
        {shiftError && (
          <p className="mt-2 text-sm text-red-500">{shiftError}</p>
        )}
      </div>

      {/* Station */}
      <div className="mb-6">
        <label className="block mb-5 text-xl font-medium">Station</label>
        <div className="relative">
          <select
            value={station}
            onChange={(e) => setStation(e.target.value)}
            disabled={stationLoading || stationOptions.length === 0}
            className="w-full border rounded-lg px-4 py-3 appearance-none text-gray-700"
          >
            <option value="" disabled hidden>
              {stationLoading ? "Memuat station..." : "Pilih Station"}
            </option>
            {!stationLoading && stationOptions.length === 0 && (
              <option value="" disabled>
                Station tidak tersedia
              </option>
            )}
            {stationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>
        {stationError && (
          <p className="mt-2 text-sm text-red-500">{stationError}</p>
        )}
      </div>

      {/* Total Uang Pembuka */}
      <div className="mb-6">
        <label className="block mb-5 text-xl font-medium">
          Total Uang Pembuka
        </label>
        <input
          type="number"
          min={0}
          placeholder="Rp"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border rounded-lg px-4 py-3"
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
