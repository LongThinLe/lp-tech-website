import Hero from "../components/Hero";
import FeaturedProducts from "../components/FeaturedProducts";
import HomeNews from "../components/HomeNews";
import OrderProcess from "../components/OrderProcess";
import SiteSeo from "../components/SiteSeo";

export default function HomePage() {
  return (
    <>
      <SiteSeo />
      <Hero />
      <FeaturedProducts />
      <HomeNews />
      <OrderProcess />
    </>
  );
}