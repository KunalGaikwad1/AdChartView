import type { Metadata } from "next";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import ToastContainer from "@/components/ToastContainer";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "AdChartView",
  description: "Premium stock tips and advisory platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionWrapper>
          <Navbar />
          {children}
          <ToastContainer />
        </SessionWrapper>
      </body>
    </html>
  );
}
