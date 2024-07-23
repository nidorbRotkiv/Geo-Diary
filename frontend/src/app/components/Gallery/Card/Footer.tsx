import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faClock,
  faTemperatureThreeQuarters,
} from "@fortawesome/free-solid-svg-icons";
import {
  formatDateTime,
  kelvinToCelsius,
  capitalizeWords,
} from "@/app/utils/globalUtils";
import { WeatherInfo } from "@/app/globalInterfaces";

interface FooterProps {
  weatherInfo: WeatherInfo;
  profileImageUrl: string;
  category: string;
  country: string;
}

export default function Footer({ weatherInfo, profileImageUrl, category, country }: FooterProps) {
  return (
    <div>
      <div className="card-actions justify-start my-2 flex items-center space-x-2">
        <Image src={profileImageUrl} alt="User" width={20} height={20} className="rounded-full" />
        <Image
          src={`https://flagsapi.com/${country}/shiny/64.png`}
          alt="Flag"
          width={25}
          height={25}
          className="-mt-0.5"
        />
        {category && <div className="badge badge-outline">{category}</div>}
      </div>
      <div className="flex items-center mb-1">
        <FontAwesomeIcon icon={faLocationDot} />
        <p className="ml-2">{weatherInfo.location}</p>
      </div>
      <div className="flex items-center mb-1 -ml-0.5">
        <FontAwesomeIcon icon={faClock} />
        <p className="ml-1.5">{formatDateTime(weatherInfo.dt)}</p>
      </div>
      <div className="flex items-center">
        <FontAwesomeIcon icon={faTemperatureThreeQuarters} />
        <p className="ml-2">
          {capitalizeWords(weatherInfo.description)} ({kelvinToCelsius(weatherInfo.temp)}°C)
        </p>
      </div>
    </div>
  );
}
