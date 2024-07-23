import { useState, useCallback } from "react";
import { useColorScheme } from "@/app/contexts/ColorSchemeContext";
import ColorSchemeOption from "./ColorSchemeOption";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";

const SelectColorScheme: React.FC = () => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [colorSchemeOption, setColorSchemeOption] = useState(colorScheme);

  const handleSetLightMode = useCallback(() => {
    sessionStorage.setItem("colorScheme", "light");
    setColorSchemeOption("light");
    setColorScheme("light");
  }, [setColorScheme]);

  const handleSetDarkMode = useCallback(() => {
    sessionStorage.setItem("colorScheme", "dark");
    setColorSchemeOption("dark");
    setColorScheme("dark");
  }, [setColorScheme]);

  return (
    <>
      <ColorSchemeOption
        isActive={colorSchemeOption === "light"}
        label="Light mode"
        icon={faSun}
        imageUrl="/images/maps/streets-v2.png"
        onClick={handleSetLightMode}
      />
      <ColorSchemeOption
        isActive={colorSchemeOption === "dark"}
        label="Dark mode"
        icon={faMoon}
        imageUrl="/images/maps/streets-v2-dark.png"
        onClick={handleSetDarkMode}
      />
    </>
  );
};

export default SelectColorScheme;
