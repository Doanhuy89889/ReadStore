import MainLayout from "@/components/layout/MainLayout";
import HeroSlider from "@/components/home/HeroSlider";
import CategoryShortcuts from "@/components/home/CategoryShortcuts";
import NewBooks from "@/components/home/NewBooks";
import PromoBanners from "@/components/home/PromoBanners";
import WhyChooseUs from "@/components/home/WhyChooseUs";

export default function HomePage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 pt-4">
        <div className="overflow-hidden rounded-2xl">
          <HeroSlider />
        </div>
      </div>
      <CategoryShortcuts />
      <NewBooks />
      <PromoBanners />
      <WhyChooseUs />
    </MainLayout>
  );
}
