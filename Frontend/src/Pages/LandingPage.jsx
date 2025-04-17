import React from "react";

import { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";
import { FeaturesSection } from "../Components/LandingPage/FeatureSelection";
import { FooterComponent } from "../Components/LandingPage/FooterComponent";
import { HeaderButtons } from "../Components/LandingPage/HeaderButtons";
import { HeroSlider } from "../Components/LandingPage/HeroSlider";
import { ProductCategories } from "../Components/LandingPage/ProductCategories";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Toaster />
      <header className="flex items-center justify-between p-4 px-10 bg-white">
        <Link to="/" className="text-3xl text-neutral-900 ">
          Agrotech
        </Link>
        <HeaderButtons />
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <HeroSlider />
        <FeaturesSection />
        <ProductCategories />
      </main>

      <FooterComponent />
    </div>
  );
}
