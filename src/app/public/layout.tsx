import Navbar from "@/components/Navbar";
import { getSessionUser } from "@/lib/session/authSession";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const sessionUser = await getSessionUser();

  return (
    <div className="items-center justify-center">
      <Navbar userName={sessionUser.name} role={sessionUser.role} />
      <main className="pt-28 px-28">
      {children}
      </main>
    </div>
  );
}
