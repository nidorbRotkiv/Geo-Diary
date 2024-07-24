"use server";

import { BASE_API_URL } from "@/app/constants";
import { Session } from "next-auth";

export async function getMarkers(session: Session, timeout: number): Promise<any> {
  const tokenValidityMessage = await validateSessionToken(session);
  if (tokenValidityMessage.startsWith("Invalid")) {
    throw new Error("Invalid session token");
  }
  
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

export async function validateSessionToken(session: Session): Promise<string> {
  const fetchPromise = fetch(`${BASE_API_URL}/validateToken`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.idToken}`,
    },
  }).then(async (response) => {
    const responseBody = await response.json();
    return responseBody.message;
  });

  const timeoutPromise = new Promise<string>((resolve) =>
    setTimeout(() => resolve("Timeout: The request took too long"), 6000)
  );

  return Promise.race([fetchPromise, timeoutPromise]).catch(() => "Error: Something went wrong");
}
