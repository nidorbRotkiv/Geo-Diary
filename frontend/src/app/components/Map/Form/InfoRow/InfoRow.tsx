import { ExtendedMarker } from "@/app/globalInterfaces";
import Image from "next/image";
import { useColorScheme } from "@/app/contexts/ColorSchemeContext";
import { useSession } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import VerticalDivider from "@/app/components/Map/Form/InfoRow/VerticalDivider";
import { formatDateTime, kelvinToCelsius } from "@/app/utils/globalUtils";

export default function InfoRow({ selectedMarker }: { selectedMarker: ExtendedMarker }) {
  const { data: session } = useSession();
  const { colorScheme } = useColorScheme();
  const MAX_LOCATION_LENGTH = 28;

  return (
    <div className="italic">
      {selectedMarker?.weatherInfo && (
        <div className="flex items-center">
          <p>{formatDateTime(selectedMarker.weatherInfo.dt)}</p>
          <VerticalDivider className="ml-1" />
          <div
            style={
              colorScheme === "dark"
                ? { filter: "brightness(170%)" }
                : { filter: "brightness(90%)" }
            }
          >
            <Image
              src={`http://openweathermap.org/img/wn/${selectedMarker.weatherInfo.icon}.png`}
              alt="Weather icon"
              width={32}
              height={32}
            />
          </div>

          <p>{kelvinToCelsius(selectedMarker.weatherInfo.temp) + "°C"}</p>
          <VerticalDivider className="mx-1" />
          {selectedMarker?.user?.profileImageUrl ? (
            <Image
              src={selectedMarker.user.profileImageUrl}
              alt="Profile image"
              width={18}
              height={18}
              style={{ borderRadius: "50%", paddingTop: "1px" }}
            />
          ) : (
            <FontAwesomeIcon icon={faUser} />
          )}
        </div>
      )}
      <p style={{ fontFamily: "Arial, sans-serif" }}>
        {selectedMarker.weatherInfo.location.length > MAX_LOCATION_LENGTH
          ? `${selectedMarker.weatherInfo.location.substring(0, MAX_LOCATION_LENGTH)}...`
          : selectedMarker.weatherInfo.location}
      </p>
      {selectedMarker?.user?.name && session?.user?.email !== selectedMarker?.user?.email && (
        <p>{`By: ${selectedMarker.user.name}`}</p>
      )}
    </div>
  );
}
