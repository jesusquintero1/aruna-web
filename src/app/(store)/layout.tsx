import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SocialProofToast from "@/components/SocialProofToast";

/** Layout de la tienda (storefront): cabecera, carrito, prueba social y pie. */
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-grow pt-28 sm:pt-32">{children}</main>
      <CartDrawer />
      <SocialProofToast />
      <Footer />
    </>
  );
}
