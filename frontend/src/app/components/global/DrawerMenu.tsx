"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapLocationDot,
  faCircleQuestion,
  faUser,
  faImage,
  faDoorClosed,
  faDoorOpen,
  faCogs,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useRef } from "react";

interface DrawerMenuProps {
  handleLeavingChild?: () => void;
  handleEnteringChild?: () => void;
}

export default function DrawerMenu({ handleLeavingChild, handleEnteringChild }: DrawerMenuProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const checkboxRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      checkboxRef.current = document.getElementById("my-drawer-3") as HTMLInputElement | null;
    }
  }, []);

  const closeDrawer = () => {
    if (checkboxRef.current && checkboxRef.current.checked) {
      checkboxRef.current.click();
    }
    if (handleLeavingChild) {
      handleLeavingChild();
    }
  };

  const handleNavigation = (path: string) => {
    closeDrawer();
    router.push(path);
  };

  const listElements = (
    <>
      <li>
        <button onClick={() => handleNavigation("/map")}>
          <FontAwesomeIcon icon={faMapLocationDot} />
          Map
        </button>
      </li>
      <li>
        <button onClick={() => handleNavigation("/gallery")}>
          <FontAwesomeIcon icon={faImage} />
          Gallery
        </button>
      </li>
      <li>
        <button onClick={() => handleNavigation("/about")}>
          <FontAwesomeIcon icon={faCircleQuestion} />
          About
        </button>
      </li>
      <li>
        <button onClick={() => handleNavigation("/account")}>
          <FontAwesomeIcon icon={faUser} />
          Account
        </button>
      </li>
      <li>
        <button onClick={() => handleNavigation("/settings")}>
          <FontAwesomeIcon icon={faCogs} />
          Settings
        </button>
      </li>
      <li>
        {session ? (
          <button onClick={() => signOut({ redirect: false }).then(() => router.push("/"))}>
            <FontAwesomeIcon icon={faDoorClosed} />
            Sign out
          </button>
        ) : (
          <button onClick={() => handleNavigation("/")}>
            <FontAwesomeIcon icon={faDoorOpen} />
            Sign in
          </button>
        )}
      </li>
    </>
  );

  return (
    <div className="drawer drawer-end z-1000 text-black dark:text-gray-300">
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <div className="w-full navbar bg-white bg-opacity-50 dark:bg-black dark:bg-opacity-50 flex justify-between items-center">
          <div className="flex-1 mx-3 flex justify-start text-lg">
            <div className="cursor-pointer flex" onClick={() => router.push("/")}>
              Geo Diary
              <Image src="/images/marker/selected.png" alt="Logo" width={27} height={27} />
            </div>
          </div>
          <div className="flex-none md_lg:hidden">
            <label
              htmlFor="my-drawer-3"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost"
              onClick={handleEnteringChild}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-6 h-6 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </label>
          </div>
          <div className="hidden md_lg:flex justify-end">
            <ul className="menu menu-horizontal">{listElements}</ul>
          </div>
        </div>
      </div>
      <div className="drawer-side">
        <label
          htmlFor="my-drawer-3"
          aria-label="close sidebar"
          className="drawer-overlay"
          onClick={closeDrawer}
        ></label>
        <div className="flex justify-end p-1 z-900">
          <button
            onClick={closeDrawer}
            className="btn-square text-2xl text-black dark:text-gray-200 dark:bg-opacity-80"
            aria-label="close sidebar"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <ul className="menu p-2 w-80 min-h-full bg-gray-300 dark:bg-gray-900">{listElements}</ul>
      </div>
    </div>
  );
}
