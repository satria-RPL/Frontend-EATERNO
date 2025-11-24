export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen px-20 items-center justify-center">
      {children}
    </div>
  );
}
