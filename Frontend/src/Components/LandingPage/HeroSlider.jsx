import { Button } from "antd";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import Slider from "react-slick";

export function HeroSlider() {
  const slides = [
    "/bg1.webp", // Placeholder image 1
    "/iamge2.jpg", // Placeholder image 2
    "image3.jpg", // Placeholder image 3
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    prevArrow: (
      <Button
        type="default"
        icon={<ChevronLeft />}
        size="large"
        className="w-12 h-12 rounded-full shadow pointer-events-auto bg-white/10 backdrop-blur-sm"
      >
        <span className="sr-only">Previous slide</span>
      </Button>
    ),
    nextArrow: (
      <Button
        type="default"
        icon={<ChevronRight />}
        size="large"
        className="w-12 h-12 rounded-full shadow pointer-events-auto bg-white/10 backdrop-blur-sm"
      >
        <span className="sr-only">Next slide</span>
      </Button>
    ),
  };

  return (
    <div className="relative">
      <Slider {...sliderSettings}>
        {slides.map((src, index) => (
          <div key={index} className="h-[500px]">
            <img
              src={src}
              alt={`Slide ${index + 1}`}
              className="object-cover w-full h-full "
            />
          </div>
        ))}
      </Slider>
    </div>
  );
}
