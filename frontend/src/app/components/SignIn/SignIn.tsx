"use client";

import { useEffect, CSSProperties } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PageHolder from "@/app/components/global/PageHolder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useColorScheme } from "@/app/contexts/ColorSchemeContext";

export default function Login() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    console.log(colorScheme);
    session && router.push("/map");
  }, [session]);

  const buttonStyle: CSSProperties = {
    width: "100%",
    maxWidth: "250px",
    backgroundColor: colorScheme === "dark" ? "" : "white",
    color: colorScheme === "dark" ? "white" : "black",
    borderColor: colorScheme === "dark" ? "gray-400" : "gray-400",
    textAlign: "center" as CSSProperties["textAlign"],
  };

  return (
    <PageHolder>
      {status === "loading" || session ? (
        <FontAwesomeIcon icon={faCircleNotch} spin size="5x" className="mt-10" />
      ) : (
        <div className="mt-24">
          <h1 className="text-6xl mb-5">Geo Diary</h1>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <button
              onClick={() => signIn("google")}
              className="mb-3"
              style={{ width: "90%", maxWidth: "250px" }}
            >
              <img
                src={
                  colorScheme === "dark"
                    ? "/images/google/web_dark_sq_ctn@4x.png"
                    : "/images/google/web_neutral_sq_ctn@4x.png"
                }
                alt="Sign in with Google"
              />
            </button>

            <Link
              href="/map"
              className="btn border-1 border-gray-400 text-lg font-normal text-slate-200 rounded-md bg-dark-google"
              style={buttonStyle}
            >
              Continue as Guest
            </Link>
          </div>
        </div>
      )}
    </PageHolder>
  );
}
