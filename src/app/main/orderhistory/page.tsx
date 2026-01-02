import OrderHistoryView from "@/components/sections/OrderHistoryView";
import { getSessionUser } from "@/lib/session/authSession";

export default async function OrderHistoryPage() {
  const sessionUser = await getSessionUser();

  return (
    <OrderHistoryView authName={sessionUser.name} authRole={sessionUser.role} />
  );
}
