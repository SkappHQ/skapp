import { ButtonV2, EmptyDataView, IconButton } from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { WorkLocationFormValues } from "~community/configurations/types/WorkLocationTypes";
import { useWorkLocationStore } from "~community/configurations/stores/workLocationStore";
import GeofenceSelectorModal from "~community/configurations/components/molecules/GeofenceSelectorModal/GeofenceSelectorModal";
import { formatRadius } from "~community/configurations/utils/geofenceUtils";

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
      <p className="subtitle1">
        {translateText(["form.geofenceTitle"])}
      </p>

      {hasGeofence ? (
        <div className="flex items-center justify-between border border-secondary-accent rounded-lg p-4">
          <div className="flex flex-col gap-1">
            <span className="body2">
              {geofence.address}
            </span>
            <span className="body3 text-secondary-text">
              {translateText(["form.radiusLabel"])}: {formatRadius(geofence.radiusMeters)}
            </span>
          </div>
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
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 bg-tertiary-background rounded-lg border-2 border-dashed border-secondary-accent">
          <EmptyDataView
            title={translateText(["form.geofenceEmptyState"])}
            description={translateText(["form.geofenceEmptyStateDescription"])}
            className={{ wrapper: "p-8 pb-0 bg-transparent border-none" }}
          />
          <div className="pb-8">
            <ButtonV2 variant="primary" type="button" onClick={handleOpenModal}>
              {translateText(["form.geofenceAddButton"])}
            </ButtonV2>
          </div>
        </div>
      )}

      <GeofenceSelectorModal formik={formik} />
    </div>
  );
};

export default GeofenceMap;
