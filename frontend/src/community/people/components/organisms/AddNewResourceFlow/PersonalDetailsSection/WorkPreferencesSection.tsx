import { Grid2 as Grid, type SelectChangeEvent } from "@mui/material";
import { useFormik } from "formik";
import { forwardRef, useImperativeHandle } from "react";

import DropdownList from "~community/common/components/molecules/DropdownList/DropdownList";
import InputField from "~community/common/components/molecules/InputField/InputField";
import PeopleLayout from "~community/common/components/templates/PeopleLayout/PeopleLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  DEFAULT_WORK_PREFERENCES,
  WORK_LOCATION_OPTIONS,
  WORK_SCHEDULE_OPTIONS,
  validateWorkPreferences,
  type WorkPreferences
} from "~community/people/utils/directoryUtils/addNewResourceFlowUtils/workPreferenceUtils";

interface FormMethods {
  validateForm: () => Promise<Record<string, string>>;
  submitForm: () => void;
  resetForm: () => void;
}

interface Props {
  isInputsDisabled?: boolean;
  initialValues?: WorkPreferences;
  onSubmit?: (values: WorkPreferences) => void;
}

const WorkPreferencesSection = forwardRef<FormMethods, Props>(
  ({ isInputsDisabled = false, initialValues, onSubmit }, ref) => {
    const translateText = useTranslator(
      "peopleModule",
      "addResource",
      "commonText"
    );

    const formik = useFormik({
      initialValues: initialValues ?? DEFAULT_WORK_PREFERENCES,
      validate: validateWorkPreferences,
      onSubmit: (values) => {
        onSubmit?.(values);
      },
      validateOnChange: false,
      validateOnBlur: true,
      enableReinitialize: true
    });

    const { values, errors, setFieldValue, setFieldError } = formik;

    useImperativeHandle(ref, () => ({
      validateForm: async () => {
        const validationErrors = await formik.validateForm();
        return validationErrors;
      },
      submitForm: async () => {
        await formik.submitForm();
      },
      resetForm: () => {
        formik.resetForm();
      }
    }));

    const handleDropdownChange = async (e: SelectChangeEvent) => {
      const { name, value } = e.target;
      await setFieldValue(name, value);
      setFieldError(name, "");
    };

    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      await setFieldValue(name, value);
      setFieldError(name, "");
    };

    return (
      <PeopleLayout
        title="Work Preferences"
        containerStyles={{
          padding: "0",
          margin: "0 auto",
          height: "auto"
        }}
        dividerStyles={{
          mt: "0.5rem"
        }}
        pageHead={translateText(["head"])}
      >
        <form onSubmit={formik.handleSubmit}>
          <Grid
            container
            spacing={2}
            sx={{
              mb: "2rem"
            }}
          >
            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <DropdownList
                inputName="workSchedule"
                label="Work Schedule"
                value={values.workSchedule}
                placeholder="Select work schedule"
                onChange={handleDropdownChange}
                error={errors.workSchedule ?? ""}
                componentStyle={{ mt: "0rem" }}
                errorFocusOutlineNeeded={false}
                itemList={WORK_SCHEDULE_OPTIONS}
                isDisabled={isInputsDisabled}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <DropdownList
                inputName="workLocation"
                label="Work Location Preference"
                value={values.workLocation}
                placeholder="Select work location"
                onChange={handleDropdownChange}
                error={errors.workLocation ?? ""}
                componentStyle={{ mt: "0rem" }}
                errorFocusOutlineNeeded={false}
                itemList={WORK_LOCATION_OPTIONS}
                isDisabled={isInputsDisabled}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <InputField
                label="Preferred Start Time"
                inputType="text"
                value={values.preferredStartTime}
                placeHolder="e.g., 09:00"
                onChange={handleInputChange}
                inputName="preferredStartTime"
                error={errors.preferredStartTime ?? ""}
                componentStyle={{
                  flex: 1,
                  mt: "0rem"
                }}
                isDisabled={isInputsDisabled}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <InputField
                label="Notes"
                inputType="text"
                value={values.notes}
                placeHolder="Any additional work preferences"
                onChange={handleInputChange}
                inputName="notes"
                error={errors.notes ?? ""}
                componentStyle={{
                  flex: 1,
                  mt: "0rem"
                }}
                maxLength={500}
                isDisabled={isInputsDisabled}
              />
            </Grid>
          </Grid>
        </form>
      </PeopleLayout>
    );
  }
);

export default WorkPreferencesSection;