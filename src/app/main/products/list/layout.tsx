import SidebarRight from "@/components/SidebarRight";

export default function ProductsListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <main className="pr-80">{children}</main>
      <SidebarRight />
    </div>
  );
}
