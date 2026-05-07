import {
  APIProvider,
  Map,
  AdvancedMarker,
  MapMouseEvent
} from "@vis.gl/react-google-maps";
import { EmptyDataView, LargeModal } from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";
import { useCallback } from "react";
import { Box, Typography } from "@mui/material";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { theme } from "~community/common/theme/theme";
import { WorkLocationFormValues } from "~community/configurations/types/WorkLocationTypes";
import { useWorkLocationStore } from "~community/configurations/stores/workLocationStore";
import {
  MIN_RADIUS,
  MAX_RADIUS,
  formatRadius
} from "~community/configurations/utils/geofenceUtils";
import RadiusCircle from "./RadiusCircle";

interface Props {
  formik: FormikProps<WorkLocationFormValues>;
}

const GeofenceSelectorModal = ({ formik }: Props) => {
  const translateText = useTranslator("configurations", "workLocation");
  const { setToastMessage } = useToast();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

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
      void formik.setFieldValue("geofence", tempGeofence);
    }
    setIsGeofenceModalOpen(false);
    setTempGeofence(null);
  };

  const reverseGeocode = useCallback(
    async (lat: number, lng: number): Promise<string> => {
      const resp = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );
      const json = await resp.json();
      return json?.results?.[0]?.formatted_address ?? "";
    },
    [apiKey]
  );

  const handleMapClick = useCallback(
    async (e: MapMouseEvent) => {
      if (!e.detail.latLng) return;
      const newLat = e.detail.latLng.lat;
      const newLng = e.detail.latLng.lng;
      updateTempGeofence({ latitude: newLat, longitude: newLng });
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
    [reverseGeocode, updateTempGeofence, setToastMessage, translateText]
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {translateText(["form.radiusLabel"])}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.secondary }}
          >
            {formatRadius(tempRadius)}
          </Typography>
        </Box>
        <input
          type="range"
          min={MIN_RADIUS}
          max={MAX_RADIUS}
          step={10}
          value={tempRadius}
          onChange={(e) => handleRadiusChange(Number(e.target.value))}
          style={{
            width: "100%",
            height: "0.5rem",
            borderRadius: "0.5rem",
            appearance: "none",
            cursor: "pointer",
            accentColor: theme.palette.primary.dark
          }}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between"
          }}
        >
          <Typography variant="caption" sx={{ color: theme.palette.grey[700] }}>
            {formatRadius(MIN_RADIUS)}
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.grey[700] }}>
            {formatRadius(MAX_RADIUS)}
          </Typography>
        </Box>
      </Box>

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
          <EmptyDataView
            title={translateText(["form.geofenceWaitingLocation"])}
            description={translateText(["form.geofenceEmptyStateDescription"])}
            className={{
              wrapper: "h-[22rem] rounded-md border-2 border-dashed"
            }}
          />
        )}
      </APIProvider>
    </Box>
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
