import { useEffect, useState } from "react";
import MapStyleOption from "@/app/components/Settings/MapStyle/MapStyleOption";

export default function SelectMapStyle() {
  const [map, setMap] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("map") || "streets-v2";
    }
    return "streets-v2";
  });

  useEffect(() => {
    localStorage.setItem("map", map);
  }, [map]);
  
  return (
    <>
      <MapStyleOption
        name="Streets v2"
        imageSrc="/images/maps/streets-v2.png"
        selectedMap={map}
        onSelect={setMap}
        description="Complete and legible map for navigation and mobility"
      />
      <MapStyleOption
        name="Hybrid"
        imageSrc="/images/maps/satellite.png"
        selectedMap={map}
        onSelect={setMap}
        description="Seamless satellite and aerial imagery of the world"
      />
      <MapStyleOption
        name="Outdoor v2"
        imageSrc="/images/maps/outdoor-v2.png"
        selectedMap={map}
        onSelect={setMap}
        description="Summer topographic map for sport and mountain apps"
      />
      <MapStyleOption
        name="Winter v2"
        imageSrc="/images/maps/winter-v2.png"
        selectedMap={map}
        onSelect={setMap}
        description="Winter topographic map for ski and snow apps"
      />
    </>
  );
}
