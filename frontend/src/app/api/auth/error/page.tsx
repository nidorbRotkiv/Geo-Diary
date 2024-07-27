"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ErrorPage from "@/app/components/global/ErrorPage";

const AuthErrorPage = () => {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage;
  switch (error) {
    case "AccessDenied":
      errorMessage =
        "You do not have permission to access this page. This application is currently in beta. Please request access by clicking the button below.";
      break;
    case "Configuration":
      errorMessage = "There is a problem with the server configuration.";
      break;
    case "Verification":
      errorMessage = "The verification token is invalid or has expired.";
      break;
    default:
      errorMessage = "An unknown error occurred.";
  }

  return (
    <ErrorPage
      header="Authentication error"
      text={errorMessage}
      link={
        error === "AccessDenied"
          ? `mailto:${process.env.NEXT_PUBLIC_HOST_EMAIL_ADDRESS}?subject=Request%20for%20Access%20-%20Geo%20Diary&body=I%20wish%20to%20access%20Geo%20Diary.`
          : "/map"
      }
      linkText={error === "AccessDenied" ? "Request access" : "Go back to Map"}
    />
  );
};

const SuspenseWrapper = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <AuthErrorPage />
  </Suspense>
);

export default SuspenseWrapper;
