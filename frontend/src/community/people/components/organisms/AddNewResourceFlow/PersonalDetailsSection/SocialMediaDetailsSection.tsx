import { Facebook, Instagram, LinkedIn, X } from "@mui/icons-material";
import { Grid2 as Grid, type Theme, useTheme } from "@mui/material";
import { useFormik } from "formik";
import { ChangeEvent, forwardRef, useImperativeHandle } from "react";

import InputField from "~community/common/components/molecules/InputField/InputField";
import PeopleLayout from "~community/common/components/templates/PeopleLayout/PeopleLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { isValidUrlInputPattern } from "~community/common/regex/regexPatterns";
import { SOCIAL_MEDIA_MAX_CHARACTER_LENGTH } from "~community/people/constants/configs";
import { usePeopleStore } from "~community/people/store/store";
import { employeeSocialMediaDetailsValidation } from "~community/people/utils/peopleValidations";

interface FormMethods {
  validateForm: () => Promise<Record<string, string>>;
  submitForm: () => void;
  resetForm: () => void;
}

interface props {
  isInputsDisabled?: boolean;
}

const SocialMediaDetailsSection = forwardRef<FormMethods, props>(
  (props, ref) => {
    const { isInputsDisabled } = props;
    const theme: Theme = useTheme();
    const translateText = useTranslator(
      "peopleModule",
      "addResource",
      "socialMediaDetails"
    );

    const { employeeSocialMediaDetails, setEmployeeSocialMediaDetails } =
      usePeopleStore((state) => state);

    const initialValues = {
      linkedIn: employeeSocialMediaDetails?.linkedIn || "",
      facebook: employeeSocialMediaDetails?.facebook || "",
      instagram: employeeSocialMediaDetails?.instagram || "",
      x: employeeSocialMediaDetails?.x || ""
    };

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

    const formik = useFormik({
      initialValues,
      validationSchema: employeeSocialMediaDetailsValidation(translateText),
      onSubmit: () => {},
      validateOnChange: false,
      validateOnBlur: true,
      enableReinitialize: true
    });

    const { values, errors, setFieldError, setFieldValue } = formik;

    const handleInput = async (e: ChangeEvent<HTMLInputElement>) => {
      if (isValidUrlInputPattern().test(e.target.value)) {
        await setFieldValue(e.target.name, e.target.value);
        setFieldError(e.target.name, "");
        setEmployeeSocialMediaDetails(e.target.name, e.target.value);
      }
    };

    return (
      <PeopleLayout
        title={translateText(["title"])}
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
              <InputField
                label={translateText(["linkedIn"])}
                inputType="text"
                value={values.linkedIn}
                placeHolder={translateText(["enterAccountUrl"])}
                startAdornment={
                  <LinkedIn
                    sx={{
                      color: theme.palette.grey[700],
                      ml: "0.5rem"
                    }}
                  />
                }
                onChange={handleInput}
                inputName="linkedIn"
                error={errors.linkedIn ?? ""}
                componentStyle={{
                  flex: 1,
                  mt: "0rem"
                }}
                isDisabled={isInputsDisabled}
                maxLength={SOCIAL_MEDIA_MAX_CHARACTER_LENGTH}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <InputField
                label={translateText(["facebook"])}
                inputType="text"
                value={values.facebook}
                placeHolder={translateText(["enterAccountUrl"])}
                startAdornment={
                  <Facebook
                    sx={{
                      color: theme.palette.grey[700],
                      ml: "0.5rem"
                    }}
                  />
                }
                onChange={handleInput}
                inputName="facebook"
                error={errors.facebook ?? ""}
                componentStyle={{
                  flex: 1,
                  mt: "0rem"
                }}
                isDisabled={isInputsDisabled}
                maxLength={SOCIAL_MEDIA_MAX_CHARACTER_LENGTH}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <InputField
                label={translateText(["instagram"])}
                inputType="text"
                value={values.instagram}
                placeHolder={translateText(["enterAccountUrl"])}
                startAdornment={
                  <Instagram
                    sx={{
                      color: theme.palette.grey[700],
                      ml: "0.5rem"
                    }}
                  />
                }
                onChange={handleInput}
                inputName="instagram"
                error={errors.instagram ?? ""}
                componentStyle={{
                  flex: 1,
                  mt: "0rem"
                }}
                isDisabled={isInputsDisabled}
                maxLength={SOCIAL_MEDIA_MAX_CHARACTER_LENGTH}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <InputField
                label={translateText(["x"])}
                inputType="text"
                value={values.x}
                placeHolder={translateText(["enterAccountUrl"])}
                startAdornment={
                  <X
                    sx={{
                      color: theme.palette.grey[700],
                      ml: "0.5rem"
                    }}
                  />
                }
                onChange={handleInput}
                inputName="x"
                error={errors.x ?? ""}
                componentStyle={{
                  flex: 1,
                  mt: "0rem"
                }}
                isDisabled={isInputsDisabled}
                maxLength={SOCIAL_MEDIA_MAX_CHARACTER_LENGTH}
              />
            </Grid>
          </Grid>
        </form>
      </PeopleLayout>
    );
  }
);

SocialMediaDetailsSection.displayName = "SocialMediaDetailsSection";

export default SocialMediaDetailsSection;
