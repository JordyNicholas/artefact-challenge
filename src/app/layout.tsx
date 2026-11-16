import "./globals.css";
import { TRPCReactProvider } from "@/trpc/client";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
        <main className="mx-auto max-w-2xl px-4 py-10">
        <TRPCReactProvider>{children}</TRPCReactProvider>
        </main>
      </body>
    </html>
  );
}