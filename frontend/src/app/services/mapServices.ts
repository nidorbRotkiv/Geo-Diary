"use server";

import { BASE_API_URL } from "@/app/constants";
import { SimpleMarker, WeatherInfo } from "@/app/globalInterfaces";
import { Session } from "next-auth";

interface PostResponse {
  id: number;
  weatherInfo: WeatherInfo;
  latitude: number;
  longitude: number;
  title: string;
}

interface LocationData {
  road?: string;
  building?: string;
  suburb?: string;
  neighbourhood?: string;
  isolated_dwelling?: string;
  village?: string;
  hamlet?: string;
  municipality?: string;
  county?: string;
  country?: string;
}

async function constructWeatherInfo(lat: number, lon: number): Promise<WeatherInfo> {
  const weatherResponse = await getWeatherData(lat, lon);
  return {
    temp: weatherResponse.main.temp,
    dt: Math.floor(new Date().getTime() / 1000),
    location: await getLocationTitle(lat, lon),
    icon: weatherResponse.weather[0].icon,
    country: weatherResponse.sys.country,
    description: weatherResponse.weather[0].description,
  };
}

export async function postLocalMarker(session: Session, marker: SimpleMarker): Promise<number> {
  try {
    const response = await fetch(`${BASE_API_URL}/markers/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.idToken}`,
      },
      body: JSON.stringify(marker),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("Error posting marker:", error);
    return 0;
  }
}

async function getLocationData(lat: number, lon: number): Promise<LocationData> {
  return fetch(
    `https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}&api_key=${process.env.GEOCODING_API_KEY}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network error: Could not fetch location data.");
      }
      return response.json();
    })
    .then((data) => {
      return {
        road: data.address?.road,
        building: data.address?.building,
        suburb: data.address?.suburb,
        neighbourhood: data.address?.neighbourhood,
        isolated_dwelling: data.address?.isolated_dwelling,
        village: data.address?.village,
        hamlet: data.address?.hamlet,
        municipality: data.address?.municipality,
        county: data.address?.county,
        country: data.address?.country,
      };
    });
}

async function getLocationTitle(lat: number, lon: number): Promise<string> {
  const locationData: LocationData = await getLocationData(lat, lon);
  const priorityFields: (keyof LocationData)[] = [
    "building",
    "road",
    "neighbourhood",
    "suburb",
    "isolated_dwelling",
    "village",
    "hamlet",
    "municipality",
    "county",
    "country",
  ];
  let titleParts: string[] = [];
  let foundOne = false;
  for (let i = 0; i < priorityFields.length; i++) {
    const field = priorityFields[i];
    if (locationData[field] !== undefined) {
      titleParts.push(locationData[field] ?? "");
      if (!foundOne) {
        foundOne = true;
      } else {
        break;
      }
    }
    if (foundOne && i === priorityFields.length - 1) {
      break;
    }
  }
  return titleParts.length > 0 ? titleParts.join(", ") : "Unknown location";
}

export async function postNewMarker(
  partialMarker: any,
  session: Session
): Promise<Partial<PostResponse> | boolean> {
  partialMarker.weatherInfo = await constructWeatherInfo(partialMarker.latitude, partialMarker.longitude);
  const marker: Partial<PostResponse> = {};
  if (!session) {
    marker.id = 0;
  } else {
    try {
      const response = await fetch(`${BASE_API_URL}/markers/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.idToken}`,
        },
        body: JSON.stringify(partialMarker),
      });
      if (!response.ok) {
        console.error("Network response was not ok (postNewMarker)" + response.status);
        return false;
      }
      marker.id = await response.json();
    } catch (error) {
      console.error("Error posting marker:", error);
      return false;
    }
  }
  marker.latitude = partialMarker.latitude;
  marker.longitude = partialMarker.longitude;
  marker.title = partialMarker.title;
  marker.weatherInfo = partialMarker.weatherInfo;
  return marker;
}

export async function deleteMarker(session: Session, markerId: number): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_API_URL}/markers/user/${markerId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.idToken}`,
      },
    });
    return response.ok;
  } catch (error) {
    console.error("Error deleting marker:", error);
    return false;
  }
}

export async function deleteImage(session: Session, imageUrl: string): Promise<boolean> {
  try {
    const encodedImageUrl = encodeURIComponent(imageUrl);
    const response = await fetch(`${BASE_API_URL}/markers/images?imageUrl=${encodedImageUrl}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.idToken}`,
      },
    });
    return response.ok;
  } catch (error) {
    console.error("Error deleting image:", error);
    return false;
  }
}

export async function patchTitle(
  session: Session,
  title: string,
  markerId: number
): Promise<boolean> {
  try {
    const response = await fetch(
      `${BASE_API_URL}/markers/user/${markerId}/title?title=${encodeURIComponent(title)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.idToken}`,
        },
      }
    );
    return response.ok;
  } catch (error) {
    console.error("Error patching marker title:", error);
    return false;
  }
}

export async function patchPublicMarker(
  session: Session,
  publicMarker: boolean,
  markerId: number
): Promise<boolean> {
  try {
    const response = await fetch(
      `${BASE_API_URL}/markers/user/${markerId}/isPublic?isPublic=${publicMarker}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.idToken}`,
        },
      }
    );
    return response.ok;
  } catch (error) {
    console.error("Error patching marker protection state:", error);
    return false;
  }
}

export async function patchDescription(
  session: Session,
  description: string,
  markerId: number
): Promise<boolean> {
  try {
    const response = await fetch(
      `${BASE_API_URL}/markers/user/${markerId}/description?description=${encodeURIComponent(
        description
      )}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.idToken}`,
        },
      }
    );
    return response.ok;
  } catch (error) {
    console.error("Error patching marker description:", error);
    return false;
  }
}

export async function patchCategory(
  session: Session,
  category: string,
  markerId: number
): Promise<boolean> {
  try {
    const response = await fetch(
      `${BASE_API_URL}/markers/user/${markerId}/category?category=${encodeURIComponent(category)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.idToken}`,
        },
      }
    );
    return response.ok;
  } catch (error) {
    console.error("Error patching marker category:", error);
    return false;
  }
}

async function getWeatherData(lat: number, lon: number): Promise<any> {
  return fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPEN_WEATHER_MAP_API_KEY}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok (getWeatherData)");
      }
      return response.json();
    })
    .then((data) => {
      return data;
    });
}

export async function postFormData(
  session: Session,
  formData: FormData,
  markerId: number
): Promise<string> {
  const response = await fetch(`${BASE_API_URL}/markers/${markerId}/images`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${session.idToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error uploading image: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.imageUrl;
}
