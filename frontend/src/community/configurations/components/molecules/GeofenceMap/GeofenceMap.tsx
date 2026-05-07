import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  MapMouseEvent
} from "@vis.gl/react-google-maps";
import { ButtonV2, IconButton, LargeModal, SearchIcon } from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";
import { useCallback, useEffect, useRef, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { WorkLocationFormValues } from "~community/configurations/types/WorkLocationTypes";

const DEFAULT_RADIUS = 200;
const MIN_RADIUS = 50;
const MAX_RADIUS = 5000;

interface Props {
  formik: FormikProps<WorkLocationFormValues>;
}

const reverseGeocode = async (
  lat: number,
  lng: number,
  apiKey: string
): Promise<string> => {
  try {
    const resp = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );
    const json = await resp.json();
    return json?.results?.[0]?.formatted_address ?? "";
  } catch {
    return "";
  }
};

const RadiusCircle = ({
  center,
  radius
}: {
  center: google.maps.LatLngLiteral;
  radius: number;
}) => {
  const map = useMap();
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map) return;
    if (!circleRef.current) {
      circleRef.current = new google.maps.Circle({
        map,
        center,
        radius,
        strokeColor: "#2563EB",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#3B82F6",
        fillOpacity: 0.15
      });
    } else {
      circleRef.current.setCenter(center);
      circleRef.current.setRadius(radius);
    }
    return () => {
      circleRef.current?.setMap(null);
      circleRef.current = null;
    };
  }, [map, center, radius]);

  return null;
};

const GeofenceMap = ({ formik }: Props) => {
  const translateText = useTranslator("configurations", "workLocation");
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [tempGeofence, setTempGeofence] = useState<{
    latitude: number;
    longitude: number;
    radiusMeters: number;
    address: string;
  } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  }, []);

  const geofence = formik.values.geofence;
  const hasGeofence = !!geofence && geofence.latitude !== 0;

  const handleOpenModal = () => {
    if (geofence) {
      setTempGeofence({ ...geofence });
    } else if (currentLocation) {
      setTempGeofence({
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
        radiusMeters: DEFAULT_RADIUS,
        address: ""
      });
      void reverseGeocode(currentLocation.lat, currentLocation.lng, apiKey).then((address) => {
        setTempGeofence((prev) => prev ? { ...prev, address } : prev);
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTempGeofence(null);
  };

  const handleConfirm = () => {
    if (tempGeofence) {
      void formik.setFieldValue("geofence", tempGeofence);
    }
    setIsModalOpen(false);
    setTempGeofence(null);
  };

  const handleDeleteGeofence = () => {
    void formik.setFieldValue("geofence", null);
  };

  const handleMapClick = useCallback(
    async (e: MapMouseEvent) => {
      if (!e.detail.latLng) return;
      const newLat = e.detail.latLng.lat;
      const newLng = e.detail.latLng.lng;
      setTempGeofence((prev) => prev ? { ...prev, latitude: newLat, longitude: newLng } : null);
      const address = await reverseGeocode(newLat, newLng, apiKey);
      if (address) {
        setTempGeofence((prev) => prev ? { ...prev, address } : null);
      }
    },
    [apiKey]
  );

  const handleRadiusChange = (value: number) => {
    setTempGeofence((prev) => prev ? { ...prev, radiusMeters: value } : null);
  };

  const tempLat = tempGeofence?.latitude;
  const tempLng = tempGeofence?.longitude;
  const tempRadius = tempGeofence?.radiusMeters ?? DEFAULT_RADIUS;
  const tempMarkerPosition = tempLat !== undefined && tempLng !== undefined ? { lat: tempLat, lng: tempLng } : null;

  const modalContent = (
    <div className="flex flex-col gap-4">
      <APIProvider apiKey={apiKey}>
        {tempMarkerPosition ? (
          <Map
            style={{ width: "100%", height: "22rem" }}
            defaultCenter={tempMarkerPosition}
            defaultZoom={14}
            center={tempMarkerPosition}
            mapId="geofence-map"
            onClick={handleMapClick}
          >
            <AdvancedMarker position={tempMarkerPosition} />
            <RadiusCircle center={tempMarkerPosition} radius={tempRadius} />
          </Map>
        ) : (
          <div className="flex items-center justify-center w-full h-[22rem] bg-gray-100 rounded-md text-sm text-gray-500">
            {translateText(["form.geofenceWaitingLocation"])}
          </div>
        )}
      </APIProvider>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">
            {translateText(["form.radiusLabel"])}
          </p>
          <span className="text-sm text-gray-600">{tempRadius}m</span>
        </div>
        <input
          type="range"
          min={MIN_RADIUS}
          max={MAX_RADIUS}
          step={10}
          value={tempRadius}
          onChange={(e) => handleRadiusChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>{MIN_RADIUS}m</span>
          <span>{MAX_RADIUS}m</span>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold mb-1.5">
          {translateText(["form.addressLabel"])}
        </p>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={tempGeofence?.address ?? ""}
          placeholder={translateText(["form.addressPlaceholder"])}
          readOnly
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold">
        {translateText(["form.geofenceTitle"])}
      </p>
      <p className="text-sm text-gray-500">
        {translateText(["form.geofenceDescription"])}
      </p>

      {hasGeofence ? (
        <div className="flex items-center justify-between border border-gray-200 rounded-lg p-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">{geofence.address || "-"}</p>
            <p className="text-xs text-gray-500">
              {translateText(["form.radiusLabel"])}: {geofence.radiusMeters}m
            </p>
          </div>
          <div className="flex items-center gap-2">
            <IconButton
              icon={<Icon name={IconName.EDIT_ICON} />}
              onClick={handleOpenModal}
              aria-label={translateText(["form.geofenceEditButton"])}
            />
            <IconButton
              icon={<Icon name={IconName.DELETE_BUTTON_ICON} />}
              onClick={handleDeleteGeofence}
              aria-label={translateText(["form.geofenceDeleteButton"])}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-gray-300 rounded-lg py-8">
          <SearchIcon />
          <p className="text-sm text-gray-500">
            {translateText(["form.geofenceEmptyState"])}
          </p>
          <ButtonV2 variant="primary" onClick={handleOpenModal}>
            {translateText(["form.geofenceAddButton"])}
          </ButtonV2>
        </div>
      )}

      <LargeModal
        isOpen={isModalOpen}
        id="geofence-map-modal"
        modalHeader={translateText(["form.geofenceModalTitle"])}
        onClose={handleCloseModal}
        backdropVariant="dark"
        content={modalContent}
        buttons={{
          buttonLeft: {
            children: translateText(["form.cancelButton"]),
            variant: "tertiary",
            onClick: handleCloseModal
          },
          buttonRight: {
            children: translateText(["form.geofenceConfirmButton"]),
            variant: "primary",
            onClick: handleConfirm
          }
        }}
      />
    </div>
  );
};

export default GeofenceMap;
