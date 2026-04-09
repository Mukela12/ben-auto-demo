import { Navbar } from "@/components/car-rental/navbar";
import { Footer } from "@/components/car-rental/footer";
import { MobileDockWrapper } from "@/components/car-rental/mobile-dock";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pb-20 md:pb-0">{children}</main>
      <Footer />
      <MobileDockWrapper />
    </>
  );
}
