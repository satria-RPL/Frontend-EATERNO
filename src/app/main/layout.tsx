import Navbar from "@/components/Navbar";
import SideNav from "@/components/Sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />

      <div className="flex min-h-[calc(100vh-60px)]">
        <SideNav />

        <main className="flex-1 overflow-y-auto px-4 py-4">
          <div className="w-full md:max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
