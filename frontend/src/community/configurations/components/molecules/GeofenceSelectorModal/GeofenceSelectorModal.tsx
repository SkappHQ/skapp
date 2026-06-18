import { MapMouseEvent } from "@vis.gl/react-google-maps";
import { LargeModal } from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";
import { useCallback } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { WorkLocationFormValues } from "~community/configurations/types/WorkLocationTypes";
import { useWorkLocationStore } from "~community/configurations/stores/workLocationStore";
import {
  MIN_RADIUS,
  MAX_RADIUS
} from "~community/configurations/constants/workLocationConstants";
import {
  formatRadius,
  reverseGeocode
} from "~community/configurations/utils/geofenceUtils";
import AddressSearch from "./AddressSearch";
import GeofenceMapView from "./GeofenceMapView";

interface Props {
  formik: FormikProps<WorkLocationFormValues>;
}

const GeofenceSelectorModal = ({ formik }: Props) => {
  const translateText = useTranslator("configurations", "workLocation");
  const { setToastMessage } = useToast();

  const {
    isGeofenceModalOpen,
    tempGeofence,
    setIsGeofenceModalOpen,
    setTempGeofence,
    updateTempGeofence
  } = useWorkLocationStore();

  const handleClose = () => {
    setIsGeofenceModalOpen(false);
    setTempGeofence(null);
  };

  const handleConfirm = () => {
    if (tempGeofence) {
      formik.setFieldValue("geofence", tempGeofence);
    }
    setIsGeofenceModalOpen(false);
    setTempGeofence(null);
  };

  const handleMapClick = useCallback(
    async (e: MapMouseEvent) => {
      if (!e.detail.latLng) return;
      const newLat = e.detail.latLng.lat;
      const newLng = e.detail.latLng.lng;
      if (tempGeofence) {
        updateTempGeofence({ latitude: newLat, longitude: newLng });
      } else {
        setTempGeofence({
          latitude: newLat,
          longitude: newLng,
          radiusMeters: MIN_RADIUS,
          address: ""
        });
      }
      try {
        const address = await reverseGeocode(newLat, newLng);
        if (address) {
          updateTempGeofence({ address });
        }
      } catch {
        setToastMessage({
          open: true,
          toastType: ToastType.ERROR,
          title: translateText(["form.geocodeErrorTitle"]),
          description: translateText(["form.geocodeErrorDescription"]),
          isIcon: true
        });
      }
    },
    [tempGeofence, setTempGeofence, updateTempGeofence, setToastMessage, translateText]
  );

  const handleSearchResult = useCallback(
    (lat: number, lng: number, address: string) => {
      if (tempGeofence) {
        updateTempGeofence({ latitude: lat, longitude: lng, address });
      } else {
        setTempGeofence({
          latitude: lat,
          longitude: lng,
          radiusMeters: MIN_RADIUS,
          address
        });
      }
    },
    [tempGeofence, setTempGeofence, updateTempGeofence]
  );

  const handleSearchError = useCallback(
    (reason: string) => {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["form.geocodeErrorTitle"]),
        description:
          reason === "noResults"
            ? translateText(["form.geocodeNoResultsDescription"])
            : translateText(["form.geocodeErrorDescription"]),
        isIcon: true
      });
    },
    [setToastMessage, translateText]
  );

  const handleRadiusChange = (value: number) => {
    updateTempGeofence({ radiusMeters: value });
  };

  const tempLat = tempGeofence?.latitude;
  const tempLng = tempGeofence?.longitude;
  const tempRadius = tempGeofence?.radiusMeters ?? MIN_RADIUS;
  const tempMarkerPosition =
    tempLat !== undefined && tempLng !== undefined
      ? { lat: tempLat, lng: tempLng }
      : null;

  const modalContent = (
    <div className="absolute inset-0 flex flex-col gap-4 mt-[4.5rem] mb-[5rem] px-6 overflow-hidden">
      {/* Radius slider */}
      <div className="flex flex-col gap-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <span className="subtitle2">
            {translateText(["form.radiusLabel"])}
          </span>
          <span className="body2 text-secondary-text">
            {formatRadius(tempRadius)}
          </span>
        </div>
        <input
          type="range"
          min={MIN_RADIUS}
          max={MAX_RADIUS}
          step={10}
          value={tempRadius}
          onChange={(e) => handleRadiusChange(Number(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary-accent bg-secondary-accent"
        />
        <div className="flex justify-between">
          <span className="body3 text-secondary-icon">
            {formatRadius(MIN_RADIUS)}
          </span>
          <span className="body3 text-secondary-icon">
            {formatRadius(MAX_RADIUS)}
          </span>
        </div>
      </div>

      {/* Map with search overlay */}
      <div className="flex-1 min-h-0 relative mb-4">
        <GeofenceMapView
          center={tempMarkerPosition}
          radius={tempRadius}
          height="100%"
          mapId="geofence-map"
          onClick={handleMapClick}
        >
          {/* Search overlay — top-left corner of the map */}
          <div className="absolute top-3 left-3 w-72 p-3">
            <AddressSearch
              onResult={handleSearchResult}
              onError={handleSearchError}
              searchPlaceholder={translateText(["form.addressSearchPlaceholder"])}
            />
            {tempGeofence?.address && (
              <span className="body3 block mt-2 text-secondary-text">
                {tempGeofence.address}
              </span>
            )}
          </div>
        </GeofenceMapView>
      </div>
    </div>
  );

  return (
    <LargeModal
      isOpen={isGeofenceModalOpen}
      id="geofence-map-modal"
      modalHeader={translateText(["form.geofenceModalTitle"])}
      onClose={handleClose}
      backdropVariant="dark"
      content={modalContent}
      buttons={{
        buttonLeft: {
          children: translateText(["form.cancelButton"]),
          variant: "tertiary",
          onClick: handleClose
        },
        buttonRight: {
          children: translateText(["form.geofenceConfirmButton"]),
          variant: "primary",
          onClick: handleConfirm
        }
      }}
    />
  );
};

export default GeofenceSelectorModal;
