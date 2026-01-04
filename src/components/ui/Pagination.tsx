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
          className={`rounded-lg px-3 py-1.5 font-semibold ${
            canPrev
              ? "bg-(--color-bg-quaternary) text-(--color-text-body)"
              : "bg-(--color-bg-quaternary) text-(--color-text-disabled)"
          }`}
        >
          Prev
        </button>

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`h-8 w-8 rounded-lg text-center font-semibold ${
              p === page
                ? "bg-(--color-primary-500) text-(--color-text-neutral)"
                : "bg-(--color-bg-quaternary) text-(--color-text-body)"
            }`}
          >
            {p}
          </button>
        ))}

        <button
          disabled={!canNext}
          onClick={() => setPage(page + 1)}
          className={`rounded-lg px-3 py-1.5 font-semibold ${
            canNext
              ? "bg-(--color-primary-500) text-(--color-text-neutral)"
              : "bg-(--color-bg-quaternary) text-(--color-text-disabled)"
          }`}
        >
          Next
        </button>
      </div>

      {showGoTo && (
        <div className="flex items-center gap-2 text-(--color-text-body)">
          <span>Go To :</span>
          <input
            inputMode="numeric"
            value={jumpValue}
            onChange={(event) => setJumpValue(event.target.value)}
            onBlur={() => jumpValue && handleGoTo(jumpValue)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleGoTo(jumpValue);
              }
            }}
            className="h-7 w-14 rounded-md border border-(--color-text-body) bg-(--color-bg-primary) text-center text-(--color-text-body) outline-none"
          />
        </div>
      )}

      {showPerPage && setPerPage && (
        <div className="flex items-center gap-2 text-(--color-text-body)">
          <select
            value={perPage}
            onChange={(event) => setPerPage(Number(event.target.value))}
            className="h-7 min-w-[52px] rounded-md border border-(--color-text-body) bg-(--color-bg-primary) px-2 text-(--color-text-body) outline-none"
          >
            {perPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span>/Pages</span>
        </div>
      )}
    </div>
  );
}
