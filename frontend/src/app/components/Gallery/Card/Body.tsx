import { SimpleMarker } from "@/app/globalInterfaces";
import Footer from "@/app/components/Gallery/Card/Footer";
import Link from "next/link";

interface BodyProps {
  marker: SimpleMarker;
  limitText: boolean;
}

export default function Body({ marker, limitText }: BodyProps) {
  function formatText(text: string, maxLength: number) {
    return text.length > maxLength && limitText ? text.slice(0, maxLength) + "..." : text;
  }

  function formatDescription() {
    const maxLength = 50;
    return marker.description ? formatText(marker.description, maxLength) : "No description...";
  }

  function formatTitle() {
    const maxLength = 25;
    return marker.title ? formatText(marker.title, maxLength) : "No title...";
  }

  return (
    <div className="card-body flex flex-col justify-between">
      <div>
        <h2 className="card-title">{formatTitle()}</h2>
        <div>
          <p>{formatDescription()}</p>
        </div>
      </div>
      <Footer
        weatherInfo={marker.weatherInfo}
        profileImageUrl={marker.user?.profileImageUrl || ""}
        category={marker.category}
        country={marker.weatherInfo.country}
      />
      <Link
        legacyBehavior
        href={{
          pathname: "/map",
          query: { id: marker.id },
        }}
        passHref
      >
        <a
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-4 rounded-full mt-1 dark:bg-slate-600 dark:hover:bg-slate-500 inline-block text-center"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          Show Marker on Map
        </a>
      </Link>
    </div>
  );
}
