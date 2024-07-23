import Fuse from "fuse.js";
import { SimpleMarker } from "@/app/globalInterfaces";

const options = {
  includeScore: true,
  threshold: 0.3,
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'description', weight: 0.3 },
    { name: 'category', weight: 0.2 },
    { name: 'user.name', weight: 0.1 },
    { name: 'weatherInfo.location', weight: 0.1 },
  ]
};

function extractYear(query: string): string | null {
  const yearMatch = query.match(/\b(19|20)\d{2}\b/);
  return yearMatch ? yearMatch[0] : null;
}

export function filterMarkers(markers: SimpleMarker[], searchQuery: string) {
  if (!searchQuery) return markers;

  const year = extractYear(searchQuery);
  let filteredMarkers = markers;

  if (year) {
    filteredMarkers = markers.filter(marker => {
      const markerYear = new Date(marker.weatherInfo.dt * 1000).getFullYear().toString();
      return markerYear === year;
    });

    searchQuery = searchQuery.replace(year, '').trim();
  }

  if (!searchQuery) {
    return filteredMarkers;
  }

  const fuse = new Fuse(filteredMarkers, options);

  const results = fuse.search(searchQuery);

  return results.map((result: { item: SimpleMarker; }) => result.item);
}

export const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthsRadiusInKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthsRadiusInKm * c;
};
