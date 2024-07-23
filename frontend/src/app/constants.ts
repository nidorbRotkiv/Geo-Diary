export const BASE_API_URL: string = process.env.BASE_API_URL!; // For production
//export const BASE_API_URL: string = "http://localhost:8080/api"; // For local development
export const USER_POSITION_EXPIRATION_TIME: number = 600000; // 10 minutes
export const GOOGLE_MAPS_URL = "https://www.google.com/maps/dir/?api=1";
export const REGEX_FOR_SANITIZATION = /[^\p{L}\p{N}\p{P}\p{Z}]/gu;