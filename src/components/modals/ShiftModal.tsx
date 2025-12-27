"use client";

type ShiftModalProps = {
  open: boolean;
  amount: number;
  title?: string;
  description?: string;
  continueLabel?: string;
  pending?: boolean;
  onCancel: () => void;
  onContinue: () => void;
};

export default function ShiftModal({
  open,
  amount,
  title = "Start Shift?",
  description = "Dengan Total Pembukaan",
  continueLabel = "Continue",
  pending = false,
  onCancel,
  onContinue,
}: ShiftModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-[30px] w-[420px] p-8 shadow-xl text-center">
        <h2 className="text-2xl font-semibold mb-4">{title}</h2>

        <p className="text-lg font-medium text-gray-700">{description}</p>

        <p className="text-3xl font-bold text-orange-500 mt-2">
          Rp {amount.toLocaleString("id-ID")}
        </p>

        <div className="mt-10 flex flex-col gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-3 rounded-lg border border-orange-400 text-orange-500 font-semibold bg-orange-50"
            disabled={pending}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onContinue}
            className="w-full py-3 rounded-lg bg-orange-500 text-white font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={pending}
          >
            {pending ? "Memproses..." : continueLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
