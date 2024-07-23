import Image from "next/image";

interface MapStyleOptionProps {
  name: string;
  imageSrc: string;
  selectedMap: string;
  onSelect: (mapName: string) => void;
  description: string;
}

const MapStyleOption: React.FC<MapStyleOptionProps> = ({
  name,
  imageSrc,
  selectedMap,
  onSelect,
  description,
}) => {
  const selected = selectedMap === name.toLowerCase().replace(/\s+/g, "-");
  return (
    <div
      onClick={() => onSelect(name.toLowerCase().replace(/\s+/g, "-"))}
      className={`${selected && "bg-white bg-opacity-15 border border-white border-opacity-30"}`}
    >
      <label className="cursor-pointer flex flex-row items-center justify-start">
        <div className="flex-grow px-2">
          <h2 className="text-2xl font-bold">{name}</h2>
          <p className="text-lg">{description}</p>
        </div>
        <div className="flex-none w-1/4 p-2">
          <Image
            src={imageSrc}
            alt={`${name} map`}
            width={100}
            height={100}
            className={`rounded-full`}
          />
        </div>
      </label>
    </div>
  );
};

export default MapStyleOption;
