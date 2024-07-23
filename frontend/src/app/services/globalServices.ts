"use server";

import { BASE_API_URL } from "@/app/constants";
import { Session } from "next-auth";

export async function getMarkers(session: Session, timeout: number): Promise<any> {
  const headers = new Headers({
    Authorization: `Bearer ${session.idToken}`,
    Accept: "application/json",
  });

  const fetchPromise = fetch(`${BASE_API_URL}/markers/user`, {
    headers,
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error((await response.text()) || response.statusText);
    }
    return response.json();
  });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Request timed out after ${timeout} seconds`)), timeout)
  );

  return Promise.race([fetchPromise, timeoutPromise])
    .then((data) => {
      return data;
    })
    .catch((error) => {
      if (error.message.includes("No markers for this user")) {
        return "No markers for this user";
      }
      return [];
    });
}

export async function isTokenValid(session: Session): Promise<boolean> {
  const fetchPromise = fetch(`${BASE_API_URL}/validateToken`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.idToken}`,
    },
  }).then((response) => response.ok);

  const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(false), 6000));

  return Promise.race([fetchPromise, timeoutPromise])
    .then((result) => result as boolean)
    .catch(() => false);
}
