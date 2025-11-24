import OrderTable from "@/components/sections/HistoryOrderTable";

export default function OrderHistoryPage() {
  return (
    <div className="p-2 mb- space-y-6 min-h-screen bg-white">
      <h1 className="text-2xl font-bold">Order History</h1>
      <OrderTable />
    </div>
  );
}
