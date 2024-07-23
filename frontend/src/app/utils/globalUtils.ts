import { USER_POSITION_EXPIRATION_TIME } from "@/app/constants";
import { LatLngTuple } from "leaflet";
import { toast } from "react-toastify";

export function formatDateTime(unixTimestamp: number) {
  const MILLISECONDS_IN_SECOND = 1000;
  const BASED_INDEX = 1;
  const DIGITS = 2;
  const PAD_CHARACTER = "0";

  const date = new Date(unixTimestamp * MILLISECONDS_IN_SECOND);
  const year = date.getFullYear();
  const month = (date.getMonth() + BASED_INDEX).toString().padStart(DIGITS, PAD_CHARACTER);
  const day = date.getDate().toString().padStart(DIGITS, PAD_CHARACTER);
  const hours = date.getHours().toString().padStart(DIGITS, PAD_CHARACTER);
  const minutes = date.getMinutes().toString().padStart(DIGITS, PAD_CHARACTER);
  return `${year}-${month}-${day}, ${hours}:${minutes}`;
}

export function kelvinToCelsius(kelvin: number) {
  const KELVIN_TO_CELSIUS_OFFSET = 273.15;
  return Number((kelvin - KELVIN_TO_CELSIUS_OFFSET).toFixed(0));
}

export function capitalizeWords(str: string) {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

export const getDataFromSessionStorage = (key: any) => {
  const itemStr = sessionStorage.getItem(key);
  if (!itemStr) {
    return null;
  }

  const item = JSON.parse(itemStr);
  const age = Date.now() - item.timestamp; // Age in milliseconds

  return {
    data: item.data,
    age,
  };
};

function getCoordinatesForUser(
  options = {
    timeout: 10000,
    maximumAge: USER_POSITION_EXPIRATION_TIME,
  }
): Promise<LatLngTuple> {
  return new Promise((resolve, reject) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve([position.coords.latitude, position.coords.longitude]);
        },
        (err) => {
          reject(err);
        },
        options
      );
    } else {
      reject(new Error("Geolocation is not supported by this browser."));
    }
  });
}

const saveDataToSessionStorage = (key: any, data: any) => {
  const item = {
    data: data,
    timestamp: Date.now(),
  };
  sessionStorage.setItem(key, JSON.stringify(item));
};

export const fetchUserCoordinates = async (): Promise<LatLngTuple | null> => {
  const storedCoordinates = getDataFromSessionStorage("userCoordinates");

  if (!storedCoordinates || storedCoordinates.age >= USER_POSITION_EXPIRATION_TIME) {
    try {
      const newCoordinates = await toast.promise(
        getCoordinatesForUser().then((newCoordinates) => {
          saveDataToSessionStorage("userCoordinates", newCoordinates);
          return newCoordinates;
        }),
        {
          pending: "Fetching your location...",
          success: "Location successfully fetched",
          error: "Could not get your current position",
        }
      );
      return newCoordinates;
    } catch (error) {
      console.error("Could not get your current position", error);
      return null;
    }
  } else {
    return storedCoordinates.data;
  }
};
