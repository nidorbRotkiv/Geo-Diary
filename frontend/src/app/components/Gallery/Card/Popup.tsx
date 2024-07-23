import React from "react";
import { SimpleMarker } from "@/app/globalInterfaces";
import Body from "@/app/components/Gallery/Card/Body";
import Images from "@/app/components/Gallery/Card/Images";

interface PopupProps {
  marker: SimpleMarker;
  onClose: () => void;
  popupRef: React.RefObject<HTMLDivElement>;
}

export default function Popup({ marker, onClose, popupRef }: PopupProps) {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div
        className="popup-inner bg-gradient-to-tr from-white via-white to-transparent w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3 h-5/6 overflow-auto rounded-2xl card shadow-2xl dark:bg-gradient-to-b dark:from-gray-600 dark:to-dark-body"
        ref={popupRef}
      >
        <button
          onClick={onClose}
          className="absolute top-0 right-0 m-3 text-2xl font-bold z-10"
        >
          &times;
        </button>
        <Images marker={marker} />
        <Body marker={marker} limitText={false} />
      </div>
    </div>
  );
}
