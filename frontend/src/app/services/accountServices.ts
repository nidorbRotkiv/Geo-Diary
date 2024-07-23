"use server";

import { User } from "@/app/globalInterfaces";
import { BASE_API_URL } from "@/app/constants";
import { Session } from "next-auth";

function sanitizeEmail(email: string): string | null {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const trimmedEmail = email.trim().toLowerCase();
  if (emailPattern.test(trimmedEmail)) {
    return trimmedEmail;
  }
  return null;
}

export async function postFollow(session: Session, targetEmail: string): Promise<User | null> {
  try {
    const sanitizedEmail = sanitizeEmail(targetEmail);

    if (!sanitizedEmail) {
      throw new Error("Invalid email address");
    }

    const response = await fetch(`${BASE_API_URL}/user/follow/${sanitizedEmail}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.idToken}`,
      },
    });
    if (!response.ok) {
      throw new Error("Network response was not ok (followUser)");
    } else {
      return response.json();
    }
  } catch (error) {
    throw new Error(`Failed to follow user: ${error}`);
  }
}

export async function deleteFollowRequest(session: Session, requestId: number): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_API_URL}/user/cancel/${requestId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.idToken}`,
      },
    });
    if (!response.ok) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    return false;
  }
}

export async function postAcceptFollowRequest(
  session: Session,
  requestId: number
): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_API_URL}/user/accept/${requestId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.idToken}`,
      },
    });
    return response.ok ? true : false;
  } catch (error) {
    return false;
  }
}

export async function deleteFollow(session: Session, targetEmail: string): Promise<boolean> {
  try {
    const sanitizedEmail = sanitizeEmail(targetEmail);

    if (!sanitizedEmail) {
      return false;
    }

    const response = await fetch(`${BASE_API_URL}/user/unfollow/${sanitizedEmail}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.idToken}`,
      },
    });
    if (!response.ok) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    return false;
  }
}

export async function getUser(session: Session): Promise<User> {
  return fetch(`${BASE_API_URL}/user`, {
    headers: {
      Authorization: `Bearer ${session.idToken}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok (getUser)");
      }
      return response.json();
    })
    .then((data) => {
      return data;
    });
}

export async function deleteUser(session: Session): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_API_URL}/user`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.idToken}`,
      },
    });
    return response.ok ? true : false;
  } catch (error) {
    return false;
  }
}
