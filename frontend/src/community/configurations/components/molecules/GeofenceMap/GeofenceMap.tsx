import { ButtonV2, EmptyDataView, IconButton } from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";
import { Box, Typography } from "@mui/material";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { theme } from "~community/common/theme/theme";
import { IconName } from "~community/common/types/IconTypes";
import { WorkLocationFormValues } from "~community/configurations/types/WorkLocationTypes";
import { useWorkLocationStore } from "~community/configurations/stores/workLocationStore";
import GeofenceSelectorModal from "~community/configurations/components/molecules/GeofenceSelectorModal/GeofenceSelectorModal";
import { formatRadius } from "~community/configurations/utils/geofenceUtils";

const DEFAULT_RADIUS = 100;

interface Props {
  formik: FormikProps<WorkLocationFormValues>;
}

const GeofenceMap = ({ formik }: Props) => {
  const translateText = useTranslator("configurations", "workLocation");

  const { setIsGeofenceModalOpen, setTempGeofence } = useWorkLocationStore();

  const geofence = formik.values.geofence;
  const hasGeofence =
    geofence?.latitude != null && geofence?.longitude != null;

  const handleOpenModal = () => {
    if (geofence) {
      setTempGeofence({ ...geofence });
      setIsGeofenceModalOpen(true);
      return;
    }

    setIsGeofenceModalOpen(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setTempGeofence({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          radiusMeters: DEFAULT_RADIUS,
          address: ""
        });
      });
    }
  };

  const handleDeleteGeofence = () => {
    formik.setFieldValue("geofence", null);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Typography variant="body1">
        {translateText(["form.geofenceTitle"])}
      </Typography>

      {hasGeofence ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: `1px solid ${theme.palette.grey[200]}`,
            borderRadius: "0.5rem",
            p: "1rem"
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <Typography variant="body2">
              {geofence.address ||
                `${geofence.latitude.toFixed(5)}, ${geofence.longitude.toFixed(5)}`}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: theme.palette.text.secondary }}
            >
              {translateText(["form.radiusLabel"])}: {formatRadius(geofence.radiusMeters)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <IconButton
              icon={<Icon name={IconName.EDIT_ICON} />}
              type="button"
              onClick={handleOpenModal}
              aria-label={translateText(["form.geofenceEditButton"])}
            />
            <IconButton
              icon={<Icon name={IconName.DELETE_BUTTON_ICON} />}
              type="button"
              onClick={handleDeleteGeofence}
              aria-label={translateText(["form.geofenceDeleteButton"])}
            />
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.75rem",
            backgroundColor: theme.palette.grey[50],
            borderRadius: "0.5rem",
            border: `2px dashed ${theme.palette.grey[300]}`
          }}
        >
          <EmptyDataView
            title={translateText(["form.geofenceEmptyState"])}
            description={translateText(["form.geofenceEmptyStateDescription"])}
            className={{ wrapper: "p-8 pb-0 bg-transparent border-none" }}
          />
          <Box sx={{ pb: "2rem" }}>
            <ButtonV2 variant="primary" type="button" onClick={handleOpenModal}>
              {translateText(["form.geofenceAddButton"])}
            </ButtonV2>
          </Box>
        </Box>
      )}

      <GeofenceSelectorModal formik={formik} />
    </Box>
  );
};

export default GeofenceMap;
