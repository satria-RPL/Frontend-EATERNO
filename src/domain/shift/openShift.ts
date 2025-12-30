type ApiResult<T = unknown> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string; data?: unknown };

export type OpenShiftService = {
  createCashierShift: (payload: {
    shiftId: number;
    stationId: number;
    placeId: number;
    openingBalance: number;
  }) => Promise<ApiResult>;
};

export function createOpenShiftAction({ createCashierShift }: OpenShiftService) {
  async function openShift(params: {
    shiftId: string;
    stationId: string;
    placeId?: string;
    openingBalance: number;
  }) {
    const shiftId = Number(params.shiftId);
    const stationId = Number(params.stationId);
    const placeId = Number(params.placeId);

    if (Number.isNaN(shiftId) || Number.isNaN(stationId)) {
      return { ok: false, error: "Shift atau station tidak valid." };
    }

    if (Number.isNaN(placeId)) {
      return { ok: false, error: "Place tidak valid." };
    }

    return createCashierShift({
      shiftId,
      stationId,
      placeId,
      openingBalance: params.openingBalance,
    });
  }

  return { openShift };
}
