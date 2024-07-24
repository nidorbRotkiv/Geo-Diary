"use client";

import React, { useEffect, useRef, useState } from "react";
import L, { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import Form from "@/app/components/Map/Form/Form";
import { useSession, signOut } from "next-auth/react";
import * as mapServices from "@/app/services/mapServices";
import { ExtendedMarker, MarkerCreationForm, SimpleMarker } from "@/app/globalInterfaces";
import "@maptiler/leaflet-maptilersdk";
import { useColorScheme } from "@/app/contexts/ColorSchemeContext";
import * as mapOperations from "@/app/utils/mapUtils";
import "@/app/styles/mapStyles.css";
import { toast } from "react-toastify";
import useOutsideClick from "@/app/hooks/useOutsideClick";
import { getMarkers, validateSessionToken } from "@/app/services/globalServices";
import { useSwal } from "@/app/contexts/SwalContext";
import DrawerMenu from "@/app/components/global/DrawerMenu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrosshairs, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { fetchUserCoordinates } from "@/app/utils/globalUtils";
import { REGEX_FOR_SANITIZATION } from "@/app/constants";

interface MapProps {
  markerId?: string;
}

const Map: React.FC<MapProps> = ({ markerId }) => {
  const { data: session, status } = useSession();
  const userRef = useRef<any>(null);
  const userLoggedIn = (): boolean => (userRef.current ? true : false);

  const { colorScheme } = useColorScheme();
  const { customSwal } = useSwal();

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.Layer | null>(null);
  const [userCoordinates, setUserCoordinates] = useState<LatLngTuple | null>(null);
  const userPositionMarkerRef = useRef<L.Marker | null>(null);

  const [mouseOnMap, setMouseOnMap] = useState(true);
  const mouseOnMapRef = useRef(mouseOnMap);

  const isDraggingMapRef = useRef<boolean>(false);
  const isBoxZoomingRef = useRef<boolean>(false);

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const timeoutIdRef = useRef<any>(null);

  const [markers, setMarkers] = useState<ExtendedMarker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<ExtendedMarker | null>(null);
  const lastSelectedMarkerRef = useRef<ExtendedMarker | null>(null);
  const lastMarkerCreationTimeRef = useRef<number | null>(null);

  const [showCrosshair, setShowCrosshair] = useState(false);

  const router = useRouter();

  const handleCreateMarkerDecision = () => {
    setShowCrosshair(false);
    customSwal
      .fire({
        title: "Create Marker",
        text: "Do you want to create a marker on your current position or mark it manually?",
        showCancelButton: true,
        confirmButtonText: "Current Position",
        cancelButtonText: "Manual",
      })
      .then((result) => {
        if (result.isConfirmed) {
          createMarkerFromCurrentPosition();
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          setShowCrosshair(true);
          toast.info("Click on the crosshair to create a marker");
        }
      });
  };

  const createMarkerAtCenter = () => {
    if (showCrosshair && mapInstanceRef.current) {
      const center = mapInstanceRef.current.getCenter();
      createNewMarker(center.lat, center.lng);
      setShowCrosshair(false); // Hide the crosshair after creating the marker
    }
  };

  const defaultFormState: MarkerCreationForm = {
    title: "",
    description: "",
    category: "",
    images: [] as File[],
    imageUrls: [] as string[],
    publicMarker: true,
  };
  const [formState, setFormState] = useState(defaultFormState);
  const [showForm, setShowForm] = useState(false);
  const formDivRef = useRef<HTMLDivElement>(null);
  const [newestFormData, setNewestFormData] = useState<MarkerCreationForm>(defaultFormState);
  useOutsideClick(formDivRef, () => !isConfirmDialogOpen && returnToMap());

  const DEFAULT_MARKER_ICON_URL = "/images/marker/notSelected.png";
  const SELECTED_MARKER_ICON_URL = "/images/marker/selected.png";

  // initialize map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current && status !== "loading") {
      createMap();
      activateListeners();
    }
  }, [session]);

  // validate token on page load
  useEffect(() => {
    const validateToken = async () => {
      const attempts = 4;
      let tokenValidityMessage = await validateSessionToken(session!);
      for (let i = 0; !tokenValidityMessage.startsWith("Valid") && i < attempts; i++) {
        tokenValidityMessage = await validateSessionToken(session!);
      }
      if (!tokenValidityMessage.startsWith("Valid")) {
        if (tokenValidityMessage === "Invalid: Unauthorized email") {
          toast.error("Unauthorized email. Please request access from the administrator.");
        } else {
          toast.error("Your session has expired. Please log in again.");
        }
        await signOut({ redirect: false });
        router.push("/");
      }
    };
    if (session?.idToken && status === "authenticated") {
      validateToken();
    }
  }, [session, router, status]);

  // Fetch user coordinates and save them
  useEffect(() => {
    if (!userCoordinates) {
      (async () => {
        setUserCoordinates(await fetchUserCoordinates());
      })();
    }
  }, [userCoordinates]);

  // Set the map view
  useEffect(() => {
    const zoomLevel = 14;
    if (!mapInstanceRef.current || !userCoordinates) {
      return;
    }
    if (userPositionMarkerRef.current) {
      userPositionMarkerRef.current.setLatLng(userCoordinates);
    } else {
      userPositionMarkerRef.current = L.marker(userCoordinates, {
        icon: mapOperations.createIcon("/images/marker/userPos.png", "s"),
        title: "Current position",
        zIndexOffset: -1, // Place the marker below other markers
      }).addTo(mapInstanceRef.current);
    }
    if (!markerId) {
      mapInstanceRef.current.setView(userCoordinates, zoomLevel);
    }
  }, [userCoordinates, mapInstanceRef.current]);

  // fetch markers from database when user logs in
  useEffect(() => {
    if (!session) {
      return; // Exit if user is not logged in
    }
    const fetchAndSetSavedMarkers = async () => {
      userRef.current = session.user;
      const dbMarkers = await fetchDatabaseMarkers();
      const localMarkers = await fetchAndPostLocalMarkers();
      const combinedMarkers = [...localMarkers, ...dbMarkers];
      setMarkers(mapOperations.uniqueMarkers(combinedMarkers));
      combinedMarkers.forEach((marker) => {
        !mapInstanceRef.current!.hasLayer(marker) && marker.addTo(mapInstanceRef.current!);
      });
      combinedMarkers.forEach((marker) => removeDuplicates(marker));
    };
    fetchAndSetSavedMarkers();
  }, [session]);

  // handle selection of marker
  useEffect(() => {
    if (!selectedMarker) {
      return;
    }
    mapInstanceRef.current!.panTo(selectedMarker.getLatLng());
    setFormState({
      title: selectedMarker.options.title || defaultFormState.title,
      description: selectedMarker.description || defaultFormState.description,
      category: selectedMarker.category || defaultFormState.category,
      images: selectedMarker.images || (defaultFormState.images as File[]),
      imageUrls: selectedMarker.imageUrls || (defaultFormState.imageUrls as string[]),
      publicMarker:
        selectedMarker.publicMarker !== null
          ? selectedMarker.publicMarker
          : defaultFormState.publicMarker,
    });
  }, [selectedMarker]);

  // update mouseOnMapRef when mouseOnMap changes
  useEffect(() => {
    mouseOnMapRef.current = mouseOnMap;
  }, [mouseOnMap]);

  // save markers to local storage when not logged in
  useEffect(() => {
    if (userLoggedIn() || markers.length === 0 || status === "loading") {
      return;
    }
    const simplifiedMarkers = markers.map((marker) => ({
      latitude: marker.getLatLng().lat,
      longitude: marker.getLatLng().lng,
      title: marker.options.title,
      description: marker.description,
      category: marker.category,
      weatherInfo: marker.weatherInfo,
      id: 0,
    }));
    localStorage.setItem("markers", JSON.stringify(simplifiedMarkers));
  }, [markers, session, selectedMarker]);

  // load markers from local storage when not logged in
  useEffect(() => {
    if (status === "loading") {
      return;
    }
    if (status === "unauthenticated" && localStorage.getItem("markers")) {
      const lsMarkers = JSON.parse(localStorage.getItem("markers")!); // Default to an empty array if null
      const localMarkers = lsMarkers.map((markerData: SimpleMarker) => createMarker(markerData));
      setMarkers(mapOperations.uniqueMarkers(localMarkers));
      localStorage.removeItem("markers");
    }
  }, [status]);

  // select a marker if markerId is provided in the url
  useEffect(() => {
    if (markers.length > 0 && markerId && mapInstanceRef.current) {
      const zoomLevel = 16;
      const marker = markers.find((marker) => marker.id === parseInt(markerId));
      marker && updateSelectedMarker(marker);
      marker && mapInstanceRef.current?.setView(marker.getLatLng(), zoomLevel);
    }
  }, [markers]);

  function createMap(): void {
    const minZoomLevel = 3;
    const maxZoomLevel = 22;
    const center = [30, 30] as LatLngTuple;
    const map = L.map(mapRef.current!, { minZoom: minZoomLevel, maxZoom: maxZoomLevel });
    map.setView(center, minZoomLevel);
    map.zoomControl.setPosition("bottomright");
    mapOperations.restrictMapBounds(map);
    layerRef.current = mapOperations.createMapLayer(colorScheme);
    layerRef.current.addTo(map);
    mapInstanceRef.current = map;
  }

  function notSelectedIcon(marker: ExtendedMarker) {
    let icon;
    if (marker?.user?.profileImageUrl && marker?.user?.profileImageUrl !== userRef.current.image) {
      icon = mapOperations.createIcon(marker?.user?.profileImageUrl, "s");
    } else {
      icon = mapOperations.createIcon(DEFAULT_MARKER_ICON_URL, "m");
    }
    return icon;
  }

  function createMarker(data: any): ExtendedMarker {
    const markerOptions = {
      icon: notSelectedIcon(data),
      title: data.title || "",
    };
    const marker = L.marker([data.latitude, data.longitude], markerOptions) as ExtendedMarker;
    marker.description = data.description || "";
    marker.category = data.category || "";
    data.public === null || data.public === undefined
      ? (marker.publicMarker = defaultFormState.publicMarker)
      : (marker.publicMarker = data.public);
    marker.id = data.id;
    marker.imageUrls = data?.images?.map((image: any) => image.url) || data.imageUrls || [];
    marker.images = [];
    marker.weatherInfo = data.weatherInfo;
    if (data?.user) {
      marker.user = data.user;
    } else if (session?.user) {
      marker.user = session.user;
    }
    marker.on("click", () => updateSelectedMarker(marker));
    mapOperations.addTooltip(marker);
    if (mapInstanceRef.current && marker.id !== undefined && !(userLoggedIn() && marker.id === 0)) {
      marker.addTo(mapInstanceRef.current);
    }
    return marker;
  }

  function createMarkerFromLongPress(latitude: number, longitude: number): void {
    const createMarkerTimeout = 300; // Time after which the marker creation will be considered after a long press
    timeoutIdRef.current = setTimeout(() => {
      if (!isDraggingMapRef.current && !isBoxZoomingRef.current && mouseOnMapRef.current) {
        createNewMarker(latitude, longitude);
      }
    }, createMarkerTimeout);
  }

  function createNewMarker(latitude: number, longitude: number) {
    const toastId = toast.loading("Creating new marker...");
    new Promise((resolve, reject) => {
      for (const otherMarker of markers) {
        if (otherMarker.getLatLng().lat === latitude && otherMarker.getLatLng().lng === longitude) {
          updateSelectedMarker(otherMarker);
          return reject(new Error("Marker already exists at this location"));
        }
      }

      if (!mapOperations.throttleCreateNewMarker(lastMarkerCreationTimeRef)) {
        return reject(new Error("Please wait before creating another marker"));
      }
      mapServices
        .postNewMarker({ latitude, longitude }, session!)
        .then((markerInfo) => {
          if (markerInfo) {
            const marker = createMarker(markerInfo);
            setMarkers((prevMarkers) => [...prevMarkers, marker]);
            updateSelectedMarker(marker);
            resolve(marker);
          } else {
            throw new Error("Failed to create new marker");
          }
        })
        .catch(reject);
    })
      .then(() => {
        toast.update(toastId, {
          render: "New marker created successfully",
          type: "success",
          isLoading: false,
          autoClose: 1000,
        });
      })
      .catch((error: Error) => {
        toast.update(toastId, {
          render: error.message || "Unknown error occurred",
          type: error.message === "Marker already exists at this location" ? "info" : "error",
          isLoading: false,
          autoClose: 5000,
        });
      });
  }

  async function fetchAndPostLocalMarkers(): Promise<ExtendedMarker[]> {
    const lsMarkers = JSON.parse(localStorage.getItem("markers") || "[]");
    if (lsMarkers.length === 0) {
      return [];
    }
    return new Promise((resolve) => {
      customSwal
        .fire({
          title: "Do you want to add the markers you created while not logged in to your account?",
          confirmButtonText: "Yes, add them!",
          showCancelButton: true,
          cancelButtonText: "No, thanks",
        })
        .then(async (result) => {
          if (result.isConfirmed) {
            const localMarkers = lsMarkers.map((markerData: SimpleMarker) =>
              createMarker(markerData)
            );
            await Promise.all(
              localMarkers.map(async (marker: ExtendedMarker) => {
                marker.id = await mapServices.postLocalMarker(
                  session!,
                  mapOperations.extendedMarkerToSimpleMarker(marker, false)
                );
              })
            );
            resolve(localMarkers);
          } else {
            resolve([]);
          }
          localStorage.removeItem("markers");
        });
    });
  }

  function activateListeners(): void {
    const map = mapInstanceRef.current!;
    map.on("mousedown", (e) => createMarkerFromLongPress(e.latlng.lat, e.latlng.lng));
    map.on("contextmenu", (e) => createMarkerFromLongPress(e.latlng.lat, e.latlng.lng));
    map.on("dragstart", () => (isDraggingMapRef.current = true));
    map.on("dragend", () => (isDraggingMapRef.current = false));
    map.on("boxzoomstart", () => (isBoxZoomingRef.current = true));
    map.on("boxzoomend", () => (isBoxZoomingRef.current = false));
    map.on("mouseup mouseout", () => clearTimeout(timeoutIdRef.current));
  }

  async function fetchDatabaseMarkers(): Promise<ExtendedMarker[]> {
    async function fetchAndRetryMarkers() {
      let timeout = 2500;
      const maxAttempts = 6;
      let dbMarkersData = await getMarkers(session!, timeout);
      for (let i = 0; dbMarkersData.length === 0 && i < maxAttempts; i++) {
        if (dbMarkersData === "No markers for this user") {
          return [];
        }
        timeout *= 1.4;
        dbMarkersData = await getMarkers(session!, timeout);
      }
      return dbMarkersData;
    }
    try {
      const dbMarkersData = await toast.promise(fetchAndRetryMarkers(), {
        pending: "Retrieving markers from database...",
        success: {
          render: "Markers successfully retrieved!",
          autoClose: 500,
        },
        error: "Failed to retrieve markers. Please try refreshing the page.",
      });
      return dbMarkersData.map((markerData: JSON) => createMarker(markerData));
    } catch (error) {
      return [];
    }
  }

  const updateSelectedMarker = (marker: ExtendedMarker): void => {
    if (lastSelectedMarkerRef.current) {
      lastSelectedMarkerRef.current.setIcon(notSelectedIcon(lastSelectedMarkerRef.current));
    }
    setSelectedMarker(marker);
    lastSelectedMarkerRef.current = marker;
    marker.setIcon(mapOperations.createIcon(SELECTED_MARKER_ICON_URL, "m", true));
    setShowForm(true);
  };

  async function askUserAboutUnsavedChanges(): Promise<void> {
    setIsConfirmDialogOpen(true);
    handleEnteringChild();
    const result = await customSwal.fire({
      title: "Unsaved changes",
      text: "You have unsaved changes. Do you want to save them?",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    });
    result.isConfirmed && onUpdateMarker(newestFormData);
    setIsConfirmDialogOpen(false);
  }

  function changesMadeToForm(): boolean {
    return (
      selectedMarker?.options.title !== newestFormData.title ||
      selectedMarker?.description !== newestFormData.description ||
      selectedMarker?.category !== newestFormData.category ||
      selectedMarker?.publicMarker !== newestFormData.publicMarker ||
      selectedMarker?.imageUrls !== newestFormData.imageUrls ||
      mapOperations.imagesHaveChanged(selectedMarker?.images, newestFormData.images)
    );
  }

  const returnToMap = async (askUser = true) => {
    if (changesMadeToForm() && askUser) {
      await askUserAboutUnsavedChanges();
    }
    selectedMarker!.setIcon(notSelectedIcon(selectedMarker!));
    setSelectedMarker(null);
    handleLeavingChild();
    setShowForm(false);
  };

  const removeDuplicates = (marker: ExtendedMarker) => {
    mapInstanceRef?.current?.eachLayer(function (layer) {
      if (
        layer instanceof L.Marker &&
        layer.options.title === marker.options.title &&
        marker.getLatLng() &&
        layer.getLatLng().equals(marker.getLatLng()) &&
        layer !== marker
      ) {
        mapInstanceRef?.current?.removeLayer(layer);
      }
    });
  };

  const onUpdateMarker = async (values: MarkerCreationForm): Promise<void> => {
    for (const [key, value] of Object.entries(values)) {
      if (typeof value === "string" && REGEX_FOR_SANITIZATION.test(value)) {
        toast.error("Invalid characters in form field: " + key);
        return;
      }
    }
    const res = await updateMarker(values);
    res === "success"
      ? toast.success("Marker updated!")
      : toast.error("Failed to update marker: " + res);
  };

  const removeMarker = async (): Promise<void> => {
    if (userLoggedIn() && !(await mapServices.deleteMarker(session!, selectedMarker!.id!))) {
      throw new Error("Failed to delete marker");
    }
    selectedMarker!.remove();
    markers.length === 1 && localStorage.removeItem("markers");
    setMarkers(markers.filter((marker) => marker !== selectedMarker));
    lastSelectedMarkerRef.current = null;
    returnToMap(false);
  };

  const updateMarker = async (formData: MarkerCreationForm): Promise<string> => {
    if (!(await mapOperations.updateImageUrls(formData.imageUrls, session!, selectedMarker!))) {
      return "Failed to update image URLs";
    }
    if (
      !(await mapOperations.updatePublicMarker(formData.publicMarker, session!, selectedMarker!))
    ) {
      return "Failed to update marker protection state";
    }
    if (!(await mapOperations.updateTitle(formData.title, session!, selectedMarker!))) {
      return "Failed to update title";
    }
    if (!(await mapOperations.updateDescription(formData.description, session!, selectedMarker!))) {
      return "Failed to update description";
    }
    if (!(await mapOperations.updateCategory(formData.category, session!, selectedMarker!))) {
      return "Failed to update category";
    }
    if (!(await mapOperations.updateImages(formData.images, session!, selectedMarker!))) {
      return "Failed to update images";
    }
    returnToMap(false);
    return "success";
  };

  const handleEnteringChild = () => {
    setMouseOnMap(false);
    const map = mapInstanceRef.current!;
    map.dragging.disable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();
    map.scrollWheelZoom.disable();
    map.touchZoom.disable();
  };

  const handleLeavingChild = () => {
    setMouseOnMap(true);
    const map = mapInstanceRef.current!;
    map.dragging.enable();
    map.doubleClickZoom.enable();
    map.boxZoom.enable();
    map.scrollWheelZoom.enable();
    map.touchZoom.enable();
  };

  function createMarkerFromCurrentPosition() {
    if (userCoordinates) {
      const [lat, lng] = userCoordinates;
      createNewMarker(lat, lng);
      mapInstanceRef.current!.panTo([lat, lng]);
    } else {
      toast.warning("Could not get your current position");
    }
  }

  return (
    <div className="select-none" style={{ height: "100dvh" }} ref={mapRef}>
      <div onMouseEnter={handleEnteringChild} onMouseLeave={handleLeavingChild}>
        {!showForm && (
          <DrawerMenu
            handleLeavingChild={handleLeavingChild}
            handleEnteringChild={handleEnteringChild}
          />
        )}
        {selectedMarker && showForm && (
          <div ref={formDivRef}>
            <Form
              setIsConfirmDialogOpen={setIsConfirmDialogOpen}
              formState={formState}
              removeMarker={removeMarker}
              updateMarker={onUpdateMarker}
              zoomOnMarker={() => {
                let zoomLevel = mapInstanceRef.current!.getZoom();
                if (zoomLevel < 12) {
                  zoomLevel = 16;
                } else if (zoomLevel >= 20) {
                  zoomLevel = 22;
                } else {
                  zoomLevel += 2;
                }
                mapInstanceRef.current!.flyTo(selectedMarker!.getLatLng(), zoomLevel);
              }}
              selectedMarker={selectedMarker}
              userCoordinates={userCoordinates}
              closeForm={returnToMap}
              isUserLoggedIn={userLoggedIn()}
              onFormChange={(newData: MarkerCreationForm) => setNewestFormData(newData)}
            />
          </div>
        )}
      </div>
      <div
        style={{ cursor: "pointer" }}
        className={`crosshair-container ${
          showCrosshair ? "crosshair-visible" : "crosshair-hidden"
        } p-2 bg-white bg-opacity-40 text-black 
        dark:bg-black dark:bg-opacity-40 dark:text-gray-300 rounded-full`}
        onClick={createMarkerAtCenter}
      >
        <FontAwesomeIcon icon={faCrosshairs} beatFade size="3x" />
      </div>
      <div
        onClick={showCrosshair ? () => setShowCrosshair(false) : handleCreateMarkerDecision}
        className="z-1000 absolute bottom-5 left-5 bg-white bg-opacity-40 text-black dark:bg-black dark:bg-opacity-40 dark:text-gray-300 p-2 text-3xl rounded-full w-16 h-16 flex items-center justify-center"
        style={{ cursor: "pointer" }}
      >
        <FontAwesomeIcon icon={showCrosshair ? faXmark : faPlus} size="lg" />
      </div>
    </div>
  );
};

export default Map;
