import OrderTable from "@/components/sections/OrderTable";

export default function OrderHistoryPage() {
  return (
    <div className="p-2 -py-3 space-y-6 min-h-screen bg-white">
      <h1 className="text-2xl font-bold">Order History</h1>
      <OrderTable />
    </div>
  );
}
