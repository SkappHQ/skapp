import { IconButton, PlusIcon } from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import GeofenceMapView from "~community/configurations/components/molecules/GeofenceSelectorModal/GeofenceMapView";
import { useWorkLocationStore } from "~community/configurations/stores/workLocationStore";
import { WorkLocationFormValues } from "~community/configurations/types/WorkLocationTypes";
import GeofenceSelectorModal from "~community/configurations/components/molecules/GeofenceSelectorModal/GeofenceSelectorModal";

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
    }
    setIsGeofenceModalOpen(true);
  };

  const handleDeleteGeofence = () => {
    formik.setFieldValue("geofence", null);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="subtitle1">
          {translateText(["form.geofenceTitle"])}
        </p>
        {hasGeofence && (
          <div className="flex items-center gap-2">
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
          </div>
        )}
      </div>

      {hasGeofence ? (
        <div className="flex flex-col border border-secondary-accent rounded-lg overflow-hidden">
          {/* Read-only map preview */}
          <GeofenceMapView
            center={{ lat: geofence.latitude, lng: geofence.longitude }}
            radius={geofence.radiusMeters}
            height="16rem"
            mapId="geofence-preview-map"
            interactive={false}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center bg-tertiary-background rounded-lg border-2 border-dashed border-secondary-accent gap-2 h-[410px]">
          <p className="subtitle1">
            {translateText(["form.geofenceEmptyState"])}
          </p>
          <p className="body2 text-secondary-text">
            {translateText(["form.geofenceEmptyStateDescription"])}
          </p>
          <IconButton
            icon={<PlusIcon />}
            type="button"
            onClick={handleOpenModal}
            aria-label={translateText(["form.geofenceAddButton"])}
            variant="outlined"
          />
        </div>
      )}

      <GeofenceSelectorModal formik={formik} />
    </div>
  );
};

export default GeofenceMap;
