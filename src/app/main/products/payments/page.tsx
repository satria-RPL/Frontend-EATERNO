import PaymentsClient from "./PaymentsClient";
import { getSessionUser } from "@/lib/session/authSession";

export default async function PaymentsPage() {
  const sessionUser = await getSessionUser();

  return <PaymentsClient cashierName={sessionUser.name} />;
}
