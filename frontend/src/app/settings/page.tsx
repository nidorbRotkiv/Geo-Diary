"use client";

import { useState } from "react";
import DrawerMenu from "@/app/components/global/DrawerMenu";
import PageHolder from "@/app/components/global/PageHolder";
import SelectMapStyle from "@/app/components/Settings/MapStyle/SelectMapStyle";
import SelectColorScheme from "@/app/components/Settings/ColorScheme/SelectColorScheme";

export default function Account() {
  const [selectedBadge, setSelectedBadge] = useState("Preferences");
  return (
    <PageHolder>
      <DrawerMenu />
      <div className="flex justify-center space-x-5 py-5 px-5 w-full">
        <div
          className={`badge flex-1 ${
            selectedBadge === "Preferences" ? "badge-primary" : "badge-outline"
          } p-4 text-lg cursor-pointer text-center`}
          onClick={() => setSelectedBadge("Preferences")}
        >
          Preferences
        </div>
      </div>
      {selectedBadge === "Preferences" && (
        <>
          <h1 className="text-4xl my-4">Select Map</h1>
          <SelectMapStyle />
          <h1 className="text-4xl my-4">Color Scheme</h1>
          <SelectColorScheme />
        </>
      )}
    </PageHolder>
  );
}
