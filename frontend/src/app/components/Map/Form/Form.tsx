import { useState, useEffect, useCallback, useMemo } from "react";
import Button from "@/app/components/Map/Form/Button";
import { ExtendedMarker, MarkerCreationForm } from "@/app/globalInterfaces";
import { useColorScheme } from "@/app/contexts/ColorSchemeContext";
import { useSwal } from "@/app/contexts/SwalContext";
import InfoRow from "@/app/components/Map/Form/InfoRow/InfoRow";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRoute,
  faArrowsToCircle,
  faTrashCan,
  faFloppyDisk,
  faArrowsRotate,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import ImageUploader from "./ImageUploader";
import { LatLngTuple } from "leaflet";
import { GOOGLE_MAPS_URL } from "@/app/constants";
import { useSession } from "next-auth/react";
import ToggleLabel from "@/app/components/Map/Form/ToggleLabel";

interface FormProps {
  formState: MarkerCreationForm;
  selectedMarker: ExtendedMarker;
  removeMarker: () => Promise<void>;
  zoomOnMarker: () => void;
  updateMarker: (formData: MarkerCreationForm) => Promise<void>;
  closeForm: () => void;
  userCoordinates: LatLngTuple | null;
  isUserLoggedIn: boolean;
  onFormChange: (formState: MarkerCreationForm) => void;
  setIsConfirmDialogOpen: (isOpen: boolean) => void;
}

const Form: React.FC<FormProps> = ({
  formState,
  removeMarker,
  updateMarker,
  zoomOnMarker,
  selectedMarker,
  closeForm,
  userCoordinates,
  isUserLoggedIn,
  onFormChange,
  setIsConfirmDialogOpen,
}) => {
  const [form, setForm] = useState<MarkerCreationForm>(formState);
  const { colorScheme } = useColorScheme();
  const { customSwal } = useSwal();
  const [updating, setUpdating] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    setForm(formState);
  }, [formState]);

  useEffect(() => {
    onFormChange(form);
  }, [form, onFormChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [id]: value }));
  };

  const handleImagesChange = (newImages: File[]) => {
    setForm((prevForm) => ({ ...prevForm, images: newImages }));
  };

  const handleImageUrlsChange = (newImageUrls: string[]) => {
    setForm((prevForm) => ({ ...prevForm, imageUrls: newImageUrls }));
  };

  const confirmAndRemoveMarker = useCallback((): void => {
    setIsConfirmDialogOpen(true);
    customSwal
      .fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        icon: "warning",
      })
      .then((result) => {
        if (result.isConfirmed) {
          setIsConfirmDialogOpen(false);
          toast.promise(removeMarker(), {
            pending: "Deleting marker...",
            success: "Marker deleted!",
            error: "Failed to delete marker, please try again.",
          });
        }
      });
  }, [customSwal, removeMarker, setIsConfirmDialogOpen]);

  const darkModeColor = useCallback(
    (darkModeColor: string): string => {
      return colorScheme === "dark" ? darkModeColor : "white";
    },
    [colorScheme]
  );

  const destination = useMemo(
    () => `${selectedMarker.getLatLng().lat},${selectedMarker.getLatLng().lng}`,
    [selectedMarker]
  );

  const googleMapsLink = useMemo(() => {
    const [lat, lng] = userCoordinates || [0, 0];
    return userCoordinates
      ? `${GOOGLE_MAPS_URL}&origin=${lat},${lng}&destination=${destination}`
      : `${GOOGLE_MAPS_URL}&origin=current+location&destination=${destination}`;
  }, [userCoordinates, destination]);

  const editAllowed = useMemo(() => {
    return (
      !session?.user?.email ||
      !selectedMarker.user.email ||
      session.user.email === selectedMarker.user.email
    );
  }, [session, selectedMarker]);

  const fieldClass =
    "p-1.5 border border-gray-300 w-full rounded-lg hover:border-gray-300 bg-white dark:border-dark-divider dark:bg-dark-body hover:dark:border-gray-500 transition-colors duration-500 focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300 dark:focus:border-gray-500 dark:focus:ring-gray-500";

  return (
    <div className="absolute top-1.5 right-1.5 bg-white bg-opacity-90 p-3 rounded-lg shadow-md border border-gray-300 z-1000 flex flex-col items-start space-y-1.5 text-base text-black dark:bg-dark-body dark:bg-opacity-90 dark:text-dark-primary dark:border-dark-border overflow-y-auto max-h-[90vh]">
      {/* close button */}
      <button
        onClick={closeForm}
        className="absolute top-0 left-0 pl-1 text-gray-500 hover:text-gray-700 dark:text-dark-primary hover:dark:text-white"
      >
        <FontAwesomeIcon icon={faXmark} />
      </button>

      {/* weather info */}
      <InfoRow selectedMarker={selectedMarker} />

      {/* title field */}
      <input
        type="text"
        id="title"
        value={form.title}
        onChange={handleInputChange}
        placeholder="Title..."
        className={`${fieldClass} font-medium`}
        disabled={!editAllowed}
      />

      {/* description field */}
      <textarea
        value={form.description}
        id="description"
        onChange={handleInputChange}
        placeholder="Description..."
        className={`${fieldClass} min-h-20`}
        disabled={!editAllowed}
      ></textarea>

      {/* category field */}
      <input
        type="text"
        id="category"
        value={form.category}
        onChange={handleInputChange}
        placeholder="Category..."
        className={fieldClass}
        disabled={!editAllowed}
      />

      {/* images */}
      <div className="w-full">
        <ImageUploader
          initialImages={form.images}
          imageUrls={form.imageUrls}
          onImagesChange={handleImagesChange}
          onImageUrlsChange={handleImageUrlsChange}
          editAllowed={editAllowed}
          session={session!}
          markerOwnerEmail={selectedMarker?.user?.email}
        />
      </div>

      {/* buttons */}
      <div className="buttons-container flex w-full space-x-1">
        {/* update/save marker */}
        {editAllowed && (
          <>
            <Button
              onClick={async () => {
                setUpdating(true);
                await updateMarker(form);
                setUpdating(false);
              }}
              extraClasses="flex-grow bg-green-500 dark:bg-dark-button"
            >
              {updating ? (
                <FontAwesomeIcon icon={faArrowsRotate} spin color={darkModeColor("lightGreen")} />
              ) : (
                <FontAwesomeIcon icon={faFloppyDisk} color={darkModeColor("lightGreen")} />
              )}
            </Button>

            {/* remove marker */}
            <Button
              onClick={confirmAndRemoveMarker}
              extraClasses="flex-grow bg-red-500 dark:bg-dark-button"
            >
              <FontAwesomeIcon icon={faTrashCan} color={darkModeColor("tomato")} />
            </Button>
          </>
        )}

        {/* directions/route to marker */}
        <a href={googleMapsLink} target="_blank" rel="noopener noreferrer" className="flex-grow">
          <Button onClick={() => {}} extraClasses="w-full bg-violet-500 dark:bg-dark-button">
            <FontAwesomeIcon icon={faRoute} color={darkModeColor("violet")} />
          </Button>
        </a>

        {/* zoom on marker */}
        <Button onClick={zoomOnMarker} extraClasses="flex-grow bg-blue-500 dark:bg-dark-button">
          <FontAwesomeIcon icon={faArrowsToCircle} color={darkModeColor("lightBlue")} />
        </Button>
      </div>

      {/* public/private toggle */}
      {isUserLoggedIn && editAllowed && (
        <div className="w-full flex justify-between items-center p-1 cursor-pointer">
          <ToggleLabel
            isActive={form.publicMarker}
            label="Public"
            onClick={() => setForm((prevForm) => ({ ...prevForm, publicMarker: true }))}
          />
          <div
            className={`w-24 h-1 flex items-center ${
              form.publicMarker ? "justify-start" : "justify-end"
            } bg-gray-400 dark:bg-gray-300 rounded-full transition-all duration-300`}
            onClick={() =>
              setForm((prevForm) => ({ ...prevForm, publicMarker: !prevForm.publicMarker }))
            }
          >
            <div className="w-6 h-3 bg-gray-500 dark:bg-white rounded-full shadow-md transform transition-all duration-300"></div>
          </div>
          <ToggleLabel
            isActive={!form.publicMarker}
            label="Private"
            onClick={() => setForm((prevForm) => ({ ...prevForm, publicMarker: false }))}
          />
        </div>
      )}
    </div>
  );
};

export default Form;
