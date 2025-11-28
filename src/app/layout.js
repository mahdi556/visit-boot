import "bootstrap/dist/css/bootstrap.rtl.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "leaflet/dist/leaflet.css";
import BootstrapClient from "@/components/BootstrapClient";
import "./globals.css";
export const metadata = {
  title: "سیستم پخش مویرگی",
  description: "سیستم مدیریت پخش مویرگی محصولات",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        {children}

        {/* ایمپورت JavaScript های Bootstrap */}

        <BootstrapClient />
      </body>
    </html>
  );
}
