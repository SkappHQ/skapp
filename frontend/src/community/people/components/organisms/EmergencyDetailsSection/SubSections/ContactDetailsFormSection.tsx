import { Grid2 as Grid, SelectChangeEvent } from "@mui/material";
import { FormikErrors, FormikProps } from "formik";

import DropdownList from "~community/common/components/molecules/DropdownList/DropdownList";
import InputField from "~community/common/components/molecules/InputField/InputField";
import InputPhoneNumber from "~community/common/components/molecules/InputPhoneNumber/InputPhoneNumber";
import { L3EmergencyContactType } from "~community/people/types/PeopleTypes";
import { EmergencyContactRelationshipList } from "~community/people/utils/data/employeeSetupStaticData";

import PeopleFormSectionWrapper from "../../PeopleFormSectionWrapper/PeopleFormSectionWrapper";

interface Props {
  title: string;
  pageHead: string;
  translateText: (keys: string[]) => string;
  translateAria: (keys: string[]) => string;
  values: L3EmergencyContactType;
  errors: FormikErrors<L3EmergencyContactType>;
  handleChange: (e: SelectChangeEvent) => void;
  handleInput: (e: SelectChangeEvent) => void;
  onChangeCountry: (value: string) => Promise<void>;
  handlePhoneNumber: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
  formik: FormikProps<L3EmergencyContactType>;
  isReadOnly?: boolean;
  isInputsDisabled?: boolean;
}

const ContactDetailsFormSection = ({
  title,
  pageHead,
  translateText,
  translateAria,
  values,
  errors,
  handleChange,
  handleInput,
  onChangeCountry,
  handlePhoneNumber,
  formik,
  isReadOnly = false,
  isInputsDisabled = false
}: Props) => {
  return (
    <PeopleFormSectionWrapper
      title={title}
      containerStyles={{
        padding: "0",
        margin: "0 auto",
        display: "block",
        overflowY: "unset",
      }}
      dividerStyles={{
        mt: "0.5rem"
      }}
      pageHead={pageHead}
    >
      <form onSubmit={formik.handleSubmit}>
        <Grid
          container
          spacing={2}
          sx={{
            mb: "2.5rem"
          }}
        >
          <Grid size={{ xs: 12, md: 6, xl: 4 }}>
            <InputField
              label={translateText(["name"])}
              inputType="text"
              value={values?.name ?? ""}
              placeHolder={isReadOnly ? "" : translateText(["enterName"])}
              onInput={handleInput}
              inputName="name"
              error={errors.name ?? ""}
              maxLength={50}
              componentStyle={{
                flex: 1,
                mt: "0rem"
              }}
              readOnly={isReadOnly || isInputsDisabled}
              isDisabled={isInputsDisabled}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6, xl: 4 }}>
            <DropdownList
              inputName="relationship"
              label={translateText(["relationship"])}
              value={values?.relationship ?? ""}
              placeholder={
                isReadOnly ? "" : translateText(["selectRelationship"])
              }
              onChange={(e) => {
                if ("target" in e && "value" in e.target) {
                  handleChange(e as SelectChangeEvent);
                }
              }}
              onInput={(e) => {
                if ("target" in e && "value" in e.target) {
                  handleInput(e as SelectChangeEvent);
                }
              }}
              error={errors.relationship ?? ""}
              componentStyle={{
                mt: "0rem"
              }}
              errorFocusOutlineNeeded={false}
              checkSelected={true}
              itemList={EmergencyContactRelationshipList}
              readOnly={isReadOnly || isInputsDisabled}
              isDisabled={isInputsDisabled}
              ariaLabel={translateAria(["selectRelationship"])}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6, xl: 4 }}>
            <InputPhoneNumber
              label={translateText(["contactNo"])}
              value={values?.contactNo ?? ""}
              countryCodeValue={values.countryCode as string}
              placeHolder={isReadOnly ? "" : translateText(["enterContactNo"])}
              onChangeCountry={async (value) => await onChangeCountry(value)}
              onChange={async (e) => await handlePhoneNumber(e)}
              error={errors.contactNo ?? ""}
              inputName="phone"
              fullComponentStyle={{
                mt: "0rem"
              }}
              readOnly={isReadOnly || isInputsDisabled}
              isDisabled={isReadOnly || isInputsDisabled}
            />
          </Grid>
        </Grid>
      </form>
    </PeopleFormSectionWrapper>
  );
};

export default ContactDetailsFormSection;
