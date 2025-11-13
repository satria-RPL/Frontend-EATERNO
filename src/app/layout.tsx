import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eaterno",
  description: "Eaterno",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
