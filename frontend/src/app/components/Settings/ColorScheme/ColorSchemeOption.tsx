import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ColorSchemeOptionProps {
  isActive: boolean;
  label: string;
  icon: any;
  imageUrl: string;
  onClick: () => void;
}

const ColorSchemeOption: React.FC<ColorSchemeOptionProps> = ({
  isActive,
  label,
  icon,
  imageUrl,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer flex flex-row items-center justify-start ${
        isActive ? "bg-white bg-opacity-15 border border-white border-opacity-30" : ""
      }`}
    >
      <div className="flex-grow px-2">
        <h2 className="text-2xl font-bold">
          {label} <FontAwesomeIcon icon={icon} />
        </h2>
      </div>
      <div className="flex-none w-1/4 p-2">
        <Image
          src={imageUrl}
          alt={label}
          className="rounded-full"
          width={100}
          height={100}
        />
      </div>
    </div>
  );
};

export default ColorSchemeOption;
