"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Card from "@/app/components/Gallery/Card/Card";
import { SimpleMarker } from "@/app/globalInterfaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import DrawerMenu from "@/app/components/global/DrawerMenu";
import { getMarkers } from "@/app/services/globalServices";
import { filterMarkers, haversineDistance } from "@/app/utils/galleryUtils";
import { fetchUserCoordinates } from "@/app/utils/globalUtils";
import { LatLngTuple } from "leaflet";
import SearchBar from "@/app/components/Gallery/SearchBar";
import SortSelector from "@/app/components/Gallery/SortSelector";

export default function Gallery() {
  const { data: session, status } = useSession();
  const [markers, setMarkers] = useState<SimpleMarker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userCoordinates, setUserCoordinates] = useState<LatLngTuple | null>(null);
  const [sortMethod, setSortMethod] = useState<string>("date");

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const data = await getMarkers(session!, 9000);
        if (data === "No markers for this user") {
          setMarkers([]);
          return;
        }
        const simplifiedMarkers = data.map((marker: SimpleMarker) => ({
          latitude: marker.latitude,
          longitude: marker.longitude,
          title: marker.title,
          description: marker.description,
          category: marker.category,
          weatherInfo: marker.weatherInfo,
          imageUrls: marker.images?.map((image: any) => image.url),
          user: marker.user,
          id: marker.id,
        }));
        simplifiedMarkers.sort(
          (a: SimpleMarker, b: SimpleMarker) => b.weatherInfo.dt - a.weatherInfo.dt
        );
        setMarkers(simplifiedMarkers);
      } catch (error) {
        console.error("Failed to fetch markers:", error);
      } finally {
        setIsLoading(false);
      }
    };
    status === "authenticated" ? fetchMarkers() : setIsLoading(false);
  }, [session, status]);

  useEffect(() => {
    if (!userCoordinates) {
      (async () => {
        setUserCoordinates(await fetchUserCoordinates());
      })();
    }
  }, [userCoordinates]);

  const sortMarkers = useCallback(
    (markers: SimpleMarker[], method: string) => {
      if (method === "closestDistance" && userCoordinates) {
        const [lat, lng] = userCoordinates;
        return markers
          .map((marker) => ({
            ...marker,
            distance: haversineDistance(lat, lng, marker.latitude, marker.longitude),
          }))
          .sort((a, b) => a.distance - b.distance);
      } else if (method === "title") {
        return [...markers].sort((a, b) => a.title.localeCompare(b.title));
      } else if (method === "coldest") {
        return [...markers].sort((a, b) => a.weatherInfo.temp - b.weatherInfo.temp);
      } else {
        return [...markers].sort((a, b) => b.weatherInfo.dt - a.weatherInfo.dt);
      }
    },
    [userCoordinates]
  );

  const filteredMarkers = filterMarkers(markers, searchQuery);
  const sortedMarkers = sortMarkers(filteredMarkers, sortMethod);

  return (
    <main className="relative min-h-screen">
      <DrawerMenu />
      <div className="fixed inset-0 opacity-80 dark:opacity-50">
        <Image
          src="/images/backgroundImage.jpg"
          alt="Background"
          fill
          quality={100}
          className="object-cover"
        />
      </div>
      <div className="relative pt-5 pl-5">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          <SortSelector sortMethod={sortMethod} setSortMethod={setSortMethod} />
        </div>
      </div>
      <div className="text-black dark:text-slate-300 flex flex-wrap p-2 justify-center bg-opacity-75 z-10 mt-2">
        {isLoading ? (
          <div className="mt-10">
            <FontAwesomeIcon
              icon={faCircleNotch}
              spin
              className="text-8xl text-black dark:text-slate-400"
            />
          </div>
        ) : sortedMarkers.length === 0 && status !== "loading" ? (
          <div className="w-full text-center z-900 px-1">
            <h1 className="text-4xl">
              {session?.user?.email
                ? "No markers found... ⚠️"
                : "Sign in to browse the gallery... ⚠️"}
            </h1>
          </div>
        ) : (
          sortedMarkers.map((marker: SimpleMarker) => (
            <div key={marker.id} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 h-auto p-2">
              <Card marker={marker} />
            </div>
          ))
        )}
      </div>
    </main>
  );
}
