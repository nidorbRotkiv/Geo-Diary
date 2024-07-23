import { ExtendedMarker, SimpleMarker } from "@/app/globalInterfaces";
import L from "leaflet";
import {
  postFormData,
  patchPublicMarker,
  patchTitle,
  patchDescription,
  patchCategory,
  deleteImage,
} from "@/app/services/mapServices";
import imageCompression from "browser-image-compression";
import { Session } from "next-auth";
import { toast } from "react-toastify";

export function restrictMapBounds(map: L.Map): void {
  const maxLat = 73; // maximum latitude
  const minLat = -73; // minimum latitude
  let isPanning = false; // Flag to prevent re-triggering move event

  map.on("move", () => {
    if (isPanning) return; // Skip if the map is being programmatically panned

    const center = map.getCenter();
    if (center.lat > maxLat || center.lat < minLat) {
      isPanning = true; // Set flag before programmatic panning
      map.panTo(
        [center.lat > maxLat ? maxLat : center.lat < minLat ? minLat : center.lat, center.lng],
        { animate: false }
      );
      isPanning = false; // Reset flag after panning
    }
  });
}

export function throttleCreateNewMarker(lastMarkerCreationTimeRef: React.MutableRefObject<number | null>) {
  const minimumInterval = 2000; // Minimum interval between creations in milliseconds
  const lastCreationTime = lastMarkerCreationTimeRef.current;
  const currentTime = Date.now();
  if (lastCreationTime && currentTime - lastCreationTime < minimumInterval) {
    return false;
  }
  lastMarkerCreationTimeRef.current = currentTime;
  return true;
}

export const createIcon = (iconUrl: string, size: string = "m", shouldJump: boolean = false) => {
  let sizeValue;
  if (size === "s") {
    sizeValue = 18;
  } else if (size === "l") {
    sizeValue = 38;
  } else {
    sizeValue = 34;
  }

  let iconStyle = `
    background-image: url(${iconUrl});
    width: ${sizeValue}px;
    height: ${sizeValue}px;
    border-radius: 50%;
    background-size: cover;
  `;

  if (shouldJump) {
    const animationDuration = "1s";
    const animationKeyframes = `
      0% { transform: translateY(0); }
      50% { transform: translateY(-10px); } /* Adjust the height of the jump */
      100% { transform: translateY(0); }
    `;

    iconStyle += `
      animation: jump ${animationDuration} infinite; /* Apply the jump animation */
    `;

    const iconCss = `
      @keyframes jump {
        ${animationKeyframes}
      }
    `;

    const styleTag = document.createElement("style");
    styleTag.innerHTML = iconCss;
    document.head.appendChild(styleTag);
  }

  const iconHtml = `<div style="${iconStyle}"></div>`;

  return L.divIcon({
    className: "custom-div-icon", 
    html: iconHtml, 
    iconSize: [sizeValue, sizeValue], 
    iconAnchor: [sizeValue / 2, sizeValue], 
  });
};

const sliceTooltip = (str: string, maxLength: number): string => {
  return str.length > maxLength ? str.slice(0, maxLength) + "..." : str;
};

export const addTooltip = (marker: ExtendedMarker): void => {
  const maxLength = 15;
  let str;
  if (marker.options.title) {
    str = sliceTooltip(marker.options.title, maxLength);
  } else if (marker.weatherInfo.location) {
    const firstWord = marker.weatherInfo.location.split(",")[0];
    str = sliceTooltip(firstWord, maxLength);
  } else {
    str = "Untitled marker";
  }
  marker.unbindTooltip();
  marker
    .bindTooltip(str, {
      permanent: false,
      direction: "top",
      offset: L.point(0, -30),
    })
    .openTooltip();
};

export function createMapLayer(colorScheme: string): L.Layer {
  let userChosenMap = localStorage.getItem("map") || "streets-v2";
  if (colorScheme === "dark" && userChosenMap !== "hybrid") {
    userChosenMap += "-dark";
  }
  return new L.MaptilerLayer({
    apiKey: process.env.NEXT_PUBLIC_MAPTILER_API_KEY!,
    style: userChosenMap,
  });
}

export const imagesHaveChanged = (oldImages: File[], newImages: File[]) => {
  if (!newImages) return false;
  if (!oldImages || newImages.length !== oldImages.length) return true;
  const oldImagesSorted = [...newImages].sort((a, b) => a.name.localeCompare(b.name));
  const newImagesSorted = [...oldImages].sort((a, b) => a.name.localeCompare(b.name));
  return oldImagesSorted.some((oldImage, index) => {
    const newImage = newImagesSorted[index];
    return oldImage.lastModified !== newImage.lastModified;
  });
};

export function extendedMarkerToSimpleMarker(
  extendedMarker: ExtendedMarker,
  withId: boolean
): SimpleMarker {
  const simpleMarker: any = {
    title: extendedMarker.options.title,
    description: extendedMarker.description,
    category: extendedMarker.category,
    latitude: extendedMarker.getLatLng().lat,
    longitude: extendedMarker.getLatLng().lng,
  };
  if (withId) {
    simpleMarker.id = extendedMarker.id;
  }
  if (extendedMarker.weatherInfo) {
    simpleMarker.weatherInfo = extendedMarker.weatherInfo;
  }
  return simpleMarker;
}

export function uniqueMarkers(markers: ExtendedMarker[]): ExtendedMarker[] {
  const uniqueMarkers = new globalThis.Map<string, ExtendedMarker>();
  markers.forEach((marker) => {
    uniqueMarkers.set(marker.getLatLng().toString(), marker);
  });
  return Array.from(uniqueMarkers.values());
}

export async function postImages(
  session: Session,
  images: File[],
  markerId: number
): Promise<string[]> {
  const MAX_SIZE_IN_MB = 1;
  const MAX_SIZE_IN_BYTES = MAX_SIZE_IN_MB * 1024 * 1024;
  const MAX_WIDTH_OR_HEIGHT = 1920;
  const PROGRESS_PERCENTAGE = 100;
  const imageUrls = [];

  let toastId = toast.info(`Uploading images... 0%`, { autoClose: false });
  for (const [index, image] of images.entries()) {
    let fileToUpload = image;
    if (image.size > MAX_SIZE_IN_BYTES) {
      const options = {
        maxSizeMB: MAX_SIZE_IN_MB, 
        maxWidthOrHeight: MAX_WIDTH_OR_HEIGHT, 
        useWebWorker: true, 
        onProgress: (percent: number) => {
          const totalProgress = (index + percent / PROGRESS_PERCENTAGE) / images.length;
          toast.update(toastId, {
            render: `Uploading images... ${Math.round(totalProgress * PROGRESS_PERCENTAGE)}%`,
            autoClose: false,
            progress: totalProgress,
          });
        },
      };

      try {
        fileToUpload = await imageCompression(image, options);
      } catch (error) {
        toast.error(`Failed to compress the image ${image.name}`);
        continue;
      }
    }

    const formData = new FormData();
    formData.append("image", fileToUpload);

    try {
      const imageUrl = await postFormData(session, formData, markerId);
      imageUrls.push(imageUrl);
    } catch (error) {
      throw new Error(`Failed to upload image: ${fileToUpload.name}`);
    }
  }
  toast.done(toastId);
  return imageUrls;
}

export const updatePublicMarker = async (
  publicMarker: boolean,
  session: Session,
  selectedMarker: ExtendedMarker
): Promise<boolean> => {
  if (selectedMarker.publicMarker === publicMarker) {
    return true;
  }
  if (session && !(await patchPublicMarker(session, publicMarker, selectedMarker.id))) {
    return false;
  }
  selectedMarker!.publicMarker = publicMarker;
  return true;
};

export const updateTitle = async (
  title: string,
  session: Session,
  selectedMarker: ExtendedMarker
): Promise<boolean> => {
  if (selectedMarker!.options.title === title) {
    return true;
  }
  if (session && !(await patchTitle(session, title, selectedMarker!.id!))) {
    return false;
  }
  selectedMarker!.options.title = title;
  addTooltip(selectedMarker!);
  return true;
};

export const updateImages = async (
  images: File[],
  session: Session,
  selectedMarker: ExtendedMarker
): Promise<boolean> => {
  if (session && imagesHaveChanged(selectedMarker!.images, images)) {
    let uploadedImageUrls;
    try {
      uploadedImageUrls = await postImages(session, images, selectedMarker!.id!);
    } catch (error) {
      return false;
    }
    selectedMarker!.imageUrls = (selectedMarker?.imageUrls || []).concat(uploadedImageUrls); // Combine old and new URLs
  }
  selectedMarker!.images = session ? [] : images;
  return true;
};

export const updateImageUrls = async (
  imageUrls: string[],
  session: Session,
  selectedMarker: ExtendedMarker
): Promise<boolean> => {
  const urlsToRemove = selectedMarker?.imageUrls.filter((url) => !imageUrls.includes(url));
  if (urlsToRemove && session) {
    for (const url of urlsToRemove) {
      if (!(await deleteImage(session, url))) {
        return false;
      }
    }
  }
  selectedMarker!.imageUrls = imageUrls;
  return true;
};

export const updateDescription = async (
  description: string,
  session: Session,
  selectedMarker: ExtendedMarker
): Promise<boolean> => {
  if (selectedMarker!.description === description) {
    return true;
  }
  if (session && !(await patchDescription(session, description, selectedMarker!.id!))) {
    return false;
  }
  selectedMarker!.description = description;
  return true;
};

export const updateCategory = async (
  category: string,
  session: Session,
  selectedMarker: ExtendedMarker
): Promise<boolean> => {
  if (selectedMarker!.category === category) {
    return true;
  }
  if (session && !(await patchCategory(session, category, selectedMarker!.id!))) {
    return false;
  }
  selectedMarker!.category = category;
  return true;
};
