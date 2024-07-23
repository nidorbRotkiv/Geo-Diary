export interface ExtendedMarker extends L.Marker {
  id: number;
  description: string;
  category?: string;
  images: File[];
  imageUrls: string[];
  weatherInfo: WeatherInfo;
  icon?: string;
  user?: any;
  publicMarker: boolean;
}

export interface WeatherInfo {
  temp: number;
  dt: number;
  location: string;
  icon: string;
  country: string;
  description: string;
}

export interface MarkerCreationForm {
  title: string;
  description: string;
  category: string;
  images: File[];
  imageUrls: string[];
  publicMarker: boolean;
}

export interface SimpleMarker {
  title: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
  id?: number;
  weatherInfo: WeatherInfo;
  images?: File[];
  imageUrls?: string[];
  user?: any;
  publicMarker: boolean;
}

export type ColorScheme = "light" | "dark"; // Add other modes as needed

export interface User {
  id: number;
  name: string;
  email: string;
  profileImageUrl: string;
  followRequests: any[];
  followerEmails: string[];
  followingEmails: string[];
  receivedFollowRequests: any[];
}
