"use client";

import WaiterTableInfoTable from "./WaiterTableInfoTable";

export default function WaiterTableInfoView() {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-6 px-2 py-3 overflow-hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Table Info</h1>
      </div>

      <div className="flex-1 overflow-hidden">
        <WaiterTableInfoTable />
      </div>
    </div>
  );
}
