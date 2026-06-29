import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SocialProofToast from "@/components/SocialProofToast";
import CookieConsent from "@/components/CookieConsent";
import AnalyticsScripts from "@/components/AnalyticsScripts";
import { getRecentPublicPurchases } from "@/lib/db/orders";

/** Layout de la tienda (storefront): cabecera, carrito, prueba social y pie. */
export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const purchases = await getRecentPublicPurchases();
  return (
    <>
      <Header />
      <main className="flex-grow pt-28 sm:pt-32">{children}</main>
      <CartDrawer />
      <SocialProofToast purchases={purchases} />
      <Footer />
      {/* Analítica solo en la tienda (no en el admin) y solo tras consentimiento. */}
      <CookieConsent />
      <AnalyticsScripts />
    </>
  );
}
