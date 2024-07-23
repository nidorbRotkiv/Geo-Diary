"use client";

import React, { createContext, useContext } from "react";
import Swal from "sweetalert2";
import { useColorScheme } from "@/app/contexts/ColorSchemeContext"; 
import colors from "@/app/colors";
import "animate.css";

type SwalContextType = {
  customSwal: typeof Swal;
};

const SwalContext = createContext<SwalContextType | undefined>(undefined);

export const SwalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colorScheme } = useColorScheme();

  const getCustomSwal = () => {
    return Swal.mixin({
      background: colorScheme === "dark" ? colors["dark-bg"] : "white",
      color: colorScheme === "dark" ? colors["dark-primary"] : "black",
      showClass: {
        popup: `
          animate__animated
          animate__fadeInUp
          animate__faster
        `,
      },
      hideClass: {
        popup: `
          animate__animated
          animate__fadeOutDown
          animate__faster
        `,
      },
    });
  };

  return (
    <SwalContext.Provider value={{ customSwal: getCustomSwal() }}>{children}</SwalContext.Provider>
  );
};

export const useSwal: () => SwalContextType = () => {
  const context = useContext(SwalContext);
  if (context === undefined) {
    throw new Error("useSwal must be used within a SwalProvider");
  }
  return context;
};
