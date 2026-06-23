import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { Header } from "@/components/layout/Header";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { APP_TITLE, UNIVERSE_BRAND } from "@/constants/project";
import { authOptions } from "@/services/auth/config";
import "./globals.css";

export const metadata: Metadata = {
  title: APP_TITLE,
  description: `Digital trading card platform for the ${UNIVERSE_BRAND} Universe — collect, open packs, and fill your binder.`,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body>
        <AuthProvider session={session}>
          <Header />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
