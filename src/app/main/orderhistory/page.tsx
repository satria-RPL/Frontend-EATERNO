import OrderTable from "@/components/sections/HistoryOrderTable";

export default function OrderHistoryPage() {
  return (
    <div className="p-2 P-py-3 space-y-6 min-h-screen">
      <h1 className="text-2xl font-bold">Order History</h1>
      <OrderTable />
    </div>
  );
}
