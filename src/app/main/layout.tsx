import Navbar from "@/components/Navbar";
import SideNav from "@/components/Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="min-h-screen">
      <Navbar />
      <SideNav />
        <main className="flex pt-32 pl-20">
          <div className="w-full md:max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </>
  );
}
