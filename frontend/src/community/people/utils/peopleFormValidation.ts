import * as Yup from "yup";

type TranslatorFunctionType = (
  suffixes: string[],
  interpolationValues?: Record<string, string>
) => string;
export const employeeCareerDetailsValidation = (
  translator: TranslatorFunctionType
) =>
  Yup.object({
    employmentType: Yup.string().required(
      translator(["requireEmploymentTypeError"])
    ),
    jobFamilyId: Yup.string().required(translator(["requireJobFamilyError"])),
    jobTitleId: Yup.string().required(translator(["requireJobTitleError"])),
    startDate: Yup.date().required(translator(["requireStartDateError"])),
    endDate: Yup.date()
      .nullable()
      .test("endDate", translator(["requireEndDateError"]), function (value) {
        const currentPosition = this.parent.isCurrentEmployment;
        return !currentPosition ? !!value : true;
      })
      .test(
        "is-valid",
        translator(["endDateSameAsStartDateError"]),
        function (value) {
          const startDate = new Date(this.parent.startDate);
          return !(
            startDate &&
            value &&
            startDate.getTime() === value.getTime()
          );
        }
      )
      .test(
        "is-greater",
        translator(["endDateBeforeStartDateError"]),
        function (value) {
          const startDate = new Date(this.parent.startDate);
          return !(startDate && value && startDate.getTime() > value.getTime());
        }
      ),
    isCurrentEmployment: Yup.boolean()
  });
