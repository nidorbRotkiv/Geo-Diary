"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useColorScheme } from "./contexts/ColorSchemeContext";

export default function Toaster() {
  const { colorScheme } = useColorScheme();

  return (
    <ToastContainer
      position="top-center"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      theme={colorScheme === "dark" ? "dark" : "light"}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
  );
}
