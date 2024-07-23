import { useRef, useState, useEffect } from "react";
import { SimpleMarker } from "@/app/globalInterfaces";
import Body from "@/app/components/Gallery/Card/Body";
import Images from "@/app/components/Gallery/Card/Images";
import useHideOnClickOutside from "@/app/hooks/useHideOnClickOutside";
import Popup from "@/app/components/Gallery/Card/Popup";

interface CardProps {
  marker: SimpleMarker;
}

export default function Card({ marker }: CardProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const popupRef = useRef(null);
  useHideOnClickOutside(popupRef, () => setIsPopupOpen(false));

  useEffect(() => {
    if (isPopupOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isPopupOpen]);

  return (
    <>
      <div
        className="card w-full h-full relative cursor-pointer shadow-2xl overflow-hidden 
        bg-gradient-to-tr from-white via-white to-transparent
        hover:bg-white transition-all duration-300
        dark:bg-gradient-to-b dark:from-gray-600 dark:to-dark-body 
        dark:hover:from-gray-500 dark:hover:to-dark-body"
        onClick={() => setIsPopupOpen(true)}
      >
        <figure className="h-60 overflow-hidden relative">
          <Images marker={marker} />
        </figure>
        <Body marker={marker} limitText={true} />
      </div>
      {isPopupOpen && (
        <Popup marker={marker} onClose={() => setIsPopupOpen(false)} popupRef={popupRef} />
      )}
    </>
  );
}
