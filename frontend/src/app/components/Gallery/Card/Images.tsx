import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css"; 
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import 'swiper/css/navigation'; 
import { Navigation } from 'swiper/modules';


interface ImagesProps {
  marker: {
    imageUrls?: string[];
    title?: string;
  };
}

export default function Images({ marker }: ImagesProps) {
  const [isLoading, setIsLoading] = useState(true);
  const images = marker.imageUrls || [];

  // Handle no images available
  if (images.length === 0) {
    return (
      <div className="relative w-full h-full flex justify-center items-center select-none">
        <p className="text-2xl text-black dark:text-slate-400">No images available</p>
      </div>
    );
  }

  // Render images
  return (
    <div className="relative w-full h-full flex justify-center items-center select-none">
      <Swiper
        modules={[Navigation]}
        navigation={true}
        spaceBetween={0}
        slidesPerView={1}
        onSlideChange={() => setIsLoading(true)}
        style={{ height: "100%", width: "100%" }}
      >
        {images.map((image) => (
          <SwiperSlide key={image}>
            <Image
              src={image}
              alt={marker.title!}
              width={200}
              height={200}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              onLoad={() => setIsLoading(false)}
              priority
            />
          </SwiperSlide>
        ))}
      </Swiper>
      {isLoading && (
        <FontAwesomeIcon
          icon={faCircleNotch}
          spin
          className="absolute text-4xl text-black dark:text-slate-400"
          style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
        />
      )}
    </div>
  );
}
