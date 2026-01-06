"use client";

import { useMemo, useState } from "react";

type PaginationProps = {
  total: number;
  perPage: number;
  page: number;
  setPage: (n: number) => void;
  setPerPage?: (n: number) => void;
  perPageOptions?: number[];
  showGoTo?: boolean;
  showPerPage?: boolean;
};

export default function Pagination({
  total,
  perPage,
  page,
  setPage,
  setPerPage,
  perPageOptions = [10, 25, 50],
  showGoTo = true,
  showPerPage = true,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const [jumpValue, setJumpValue] = useState("");

  const pages = useMemo(() => {
    const candidates = [1, 2, 3, page - 1, page, page + 1, totalPages];
    const filtered = candidates
      .filter((p) => p >= 1 && p <= totalPages)
      .filter((p, i, arr) => arr.indexOf(p) === i)
      .sort((a, b) => a - b);
    return filtered;
  }, [page, totalPages]);

  const handleGoTo = (value: string) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    const nextPage = Math.min(totalPages, Math.max(1, Math.trunc(parsed)));
    setPage(nextPage);
    setJumpValue("");
  };

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs">
      <div className="flex items-center gap-2">
        <button
          disabled={!canPrev}
          onClick={() => setPage(page - 1)}
          className={`rounded-lg px-3 py-2 font-semibold ${
            canPrev ? "bg-(--primary) text-(--background)" : "bg-(--tertiary)"
          }`}
        >
          Prev
        </button>

        <button
          disabled={!canNext}
          onClick={() => setPage(page + 1)}
          className={`rounded-lg px-3 py-2 font-semibold ${
            canNext ? "bg-(--primary) text-(--background)" : "bg-(--tertiary)"
          }`}
        >
          Next
        </button>

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`h-8 w-8 rounded-lg text-center font-semibold ${
              p === page
                ? "bg-primary-500 text-(--background)"
                : "bg-(--tertiary)"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {showGoTo && (
        <div className="flex items-center gap-2">
          <span>Go To :</span>
          <input
            inputMode="numeric"
            placeholder={`${totalPages}`}
            value={jumpValue}
            onChange={(event) => setJumpValue(event.target.value)}
            onBlur={() => jumpValue && handleGoTo(jumpValue)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleGoTo(jumpValue);
              }
            }}
            className="h-7 w-14 rounded-md border border-(--tertiary) text-center outline-none"
          />
        </div>
      )}

      {showPerPage && setPerPage && (
        <div className="flex items-center gap-2">
          <select
            value={perPage}
            onChange={(event) => setPerPage(Number(event.target.value))}
            className="h-7 min-w-[52px] rounded-md border border-(--tertiary) px-2 outline-none"
          >
            {perPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span>/ Pages</span>
        </div>
      )}
    </div>
  );
}
