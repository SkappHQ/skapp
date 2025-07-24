import * as Yup from "yup";

import { numericPatternWithSpaces } from "~community/common/regex/regexPatterns";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import {
  AllJobFamilyType,
  JobTitleType
} from "~community/people/types/JobFamilyTypes";

export const addEditTeamValidationSchema = (
  translator: TranslatorFunctionType
) =>
  Yup.object({
    teamName: Yup.string().required(translator(["teamNameError"]))
  });

export const addEditJobFamilyValidationSchema = (
  allJobFamilies: AllJobFamilyType[],
  translator: TranslatorFunctionType
) => {
  return Yup.object().shape({
    name: Yup.string()
      .transform((value: string) => (value ? value.trim().toLowerCase() : ""))
      .required(translator(["jobFamilyRequiredError"]))
      .test(
        "is-job-family-name-unique",
        translator(["jobFamilyDuplicatedError"]),
        function (value, { parent }) {
          if (allJobFamilies) {
            const isUnique = allJobFamilies?.every(
              (jobFamily: AllJobFamilyType) => {
                const isUnique =
                  value !== jobFamily?.name?.trim().toLowerCase();

                const isOriginalValue =
                  jobFamily.jobFamilyId === parent?.jobFamilyId;

                return isUnique || isOriginalValue;
              }
            );

            return isUnique;
          }

          return true;
        }
      ),
    jobTitleInput: Yup.string()
      .transform((value: string) => (value ? value.trim().toLowerCase() : ""))
      .test(
        "is-job-titles-unique",
        translator(["jobTitleDuplicatedError"]),
        function (value, { parent }) {
          const isUnique = parent?.jobTitles?.every(
            (jobTitle: JobTitleType) =>
              jobTitle?.name?.trim()?.toLowerCase() === undefined ||
              jobTitle?.name?.trim()?.toLowerCase() !== value
          );

          return isUnique;
        }
      ),
    jobTitles: Yup.array().of(
      Yup.object().shape({
        jobTitleId: Yup.number().nullable(),
        name: Yup.string()
          .transform((value: string) =>
            value ? value.trim().toLowerCase() : ""
          )
          .required(translator(["jobTitleRequiredError"]))
          .test(
            "is-job-title-array-value-unique",
            translator(["jobTitleDuplicatedError"]),
            function (value, { from, parent }) {
              const jobFamilyId = from?.[1].value.jobFamilyId;

              const jobFamilyData = allJobFamilies?.find(
                (jobFamily: AllJobFamilyType) =>
                  jobFamily?.jobFamilyId === jobFamilyId
              );

              const newlyAddedValues = from?.[1].value.jobTitles.filter(
                (jobTitle: JobTitleType) => jobTitle.jobTitleId === null
              );

              let isUnique = true;

              if (newlyAddedValues) {
                isUnique = newlyAddedValues?.every((jobTitle: JobTitleType) => {
                  const isValidatingValueANewValue =
                    parent?.jobTitleId === null;

                  if (isValidatingValueANewValue) {
                    return true;
                  }

                  const isUnique =
                    value !== jobTitle?.name?.trim()?.toLowerCase();

                  return isUnique;
                });
              }

              if (isUnique && jobFamilyData) {
                isUnique = jobFamilyData?.jobTitles?.every(
                  (jobTitle: JobTitleType) => {
                    const isUnique =
                      value !== jobTitle?.name?.trim()?.toLowerCase();

                    const isOriginalValue =
                      jobTitle?.jobTitleId === parent?.jobTitleId;

                    return isUnique || isOriginalValue;
                  }
                );
              }

              return isUnique;
            }
          )
      })
    )
  });
};

export const addHolidayValidation = (translator: TranslatorFunctionType) =>
  Yup.object({
    holidayReason: Yup.string()
      .required(translator(["requireHolidayNameError"]))
      .max(50, translator(["maxCharacterLimitError"]))
      .matches(
        numericPatternWithSpaces(),
        translator(["validHolidayNameError"])
      ),
    holidayDate: Yup.date()
      .required(translator(["requireHolidayDateError"]))
      .test(
        "is-future-date",
        translator(["futureHolidayDateError"]),
        function (value) {
          return value > new Date();
        }
      ),
    duration: Yup.string().required(translator(["requireDurationError"]))
  });
