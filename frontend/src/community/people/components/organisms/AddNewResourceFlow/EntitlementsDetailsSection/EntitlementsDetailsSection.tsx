import {
  Box,
  Grid2 as Grid,
  type Theme,
  Typography,
  useTheme
} from "@mui/material";
import { useFormik } from "formik";
import { DateTime } from "luxon";
import { ChangeEvent, JSX, useCallback, useEffect, useState } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import DropdownList from "~community/common/components/molecules/DropdownList/DropdownList";
import InputDate from "~community/common/components/molecules/InputDate/InputDate";
import InputField from "~community/common/components/molecules/InputField/InputField";
import { LONG_DATE_TIME_FORMAT } from "~community/common/constants/timeConstants";
import {
  ButtonSizes,
  ButtonStyle,
  ButtonTypes,
  ToastType
} from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { DropdownListType } from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import { getEmoji } from "~community/common/utils/commonUtil";
import {
  convertDateToFormat,
  getDateFromTimeStamp,
  getMinDateOfYear
} from "~community/common/utils/dateTimeUtils";
import { useGetLeaveCycle } from "~community/leave/api/LeaveApi";
import { useGetPreProcessedLeaveTypes } from "~community/leave/api/LeaveTypesApi";
import { LeaveEntitlementDropdownListType } from "~community/leave/types/LeaveTypes";
import PeopleFormTable from "~community/people/components/molecules/PeopleFormTable/PeopleFormTable";
import { usePeopleStore } from "~community/people/store/store";
import { EmployeeEntitlementsDetailType } from "~community/people/types/AddNewResourceTypes";
import { employeeEntitlementsDetailsValidation } from "~community/people/utils/peopleValidations";

import styles from "./styles";

const EntitlementsDetailsSection = (): JSX.Element => {
  const theme: Theme = useTheme();
  const classes = styles();
  const { setToastMessage } = useToast();
  const translateText = useTranslator(
    "peopleModule",
    "addResource",
    "entitlementDetails"
  );
  const translateAria = useTranslator(
    "peopleAria",
    "addResource",
    "entitlementDetails"
  );
  const {
    employeeEntitlementsDetails,
    employeeEmploymentDetails,
    setEmployeeEntitlementsDetails
  } = usePeopleStore((state) => ({
    employeeEntitlementsDetails: state.entitlementDetails,
    setEmployeeEntitlementsDetails: state.setEntitlementDetails,
    employeeEmploymentDetails: state.employeeEmploymentDetails
  }));

  const { data: leaveCycleData } = useGetLeaveCycle();

  const { data: leaveTypesList } = useGetPreProcessedLeaveTypes({
    preprocessed: true,
    withToggle: false,
    withEmojis: true
  });

  const yearList: DropdownListType[] = [
    { label: `${new Date().getFullYear()}`, value: new Date().getFullYear() },
    {
      label: `${new Date().getFullYear() + 1}`,
      value: new Date().getFullYear() + 1
    }
  ];

  const tableHeadings = [
    translateText(["tableHeadings", "year"]),
    translateText(["tableHeadings", "leaveType"]),
    translateText(["tableHeadings", "numberOfDays"]),
    translateText(["tableHeadings", "effectiveFrom"]),
    translateText(["tableHeadings", "expirationDate"])
  ];

  const initialValues: EmployeeEntitlementsDetailType = {
    year: "",
    leaveType: "",
    leaveName: "",
    numDays: "",
    effectiveFrom: "",
    expirationDate: ""
  };

  const [rowEdited, setRowEdited] = useState<number>(-1);
  const [selectedEffectiveDate, setSelectedEffectiveDate] = useState<
    DateTime | undefined
  >(undefined);
  const [selectedExpirationDate, setSelectedExpirationDate] = useState<
    DateTime | undefined
  >(undefined);
  const checkTotalDaysValidity = (values: EmployeeEntitlementsDetailType) => {
    const total = employeeEntitlementsDetails?.reduce((acc, curr) => {
      return acc + parseFloat(curr?.numDays);
    }, 0);
    return (
      total +
        parseFloat(values?.numDays) -
        parseFloat(
          rowEdited > -1 ? employeeEntitlementsDetails[rowEdited]?.numDays : "0"
        ) <=
      365
    );
  };

  const onSubmit = (values: EmployeeEntitlementsDetailType) => {
    if (!checkTotalDaysValidity(values)) {
      setToastMessage({
        title: translateText([
          "validationErrors",
          "totalEntitlementDaysExceeded",
          "title"
        ]),
        description: translateText([
          "validationErrors",
          "totalEntitlementDaysExceeded",
          "description"
        ]),
        open: true,
        isIcon: true,
        toastType: ToastType.SUCCESS
      });
      return;
    }

    const similarEntitlementIndex = employeeEntitlementsDetails?.findIndex(
      (item) =>
        item?.year === values?.year &&
        item?.leaveType === values?.leaveType &&
        getDateFromTimeStamp(item?.effectiveFrom) ===
          getDateFromTimeStamp(values?.effectiveFrom) &&
        getDateFromTimeStamp(item?.expirationDate) ===
          getDateFromTimeStamp(values?.expirationDate)
    );

    if (similarEntitlementIndex > -1 && similarEntitlementIndex !== rowEdited) {
      const updatedEntitlement =
        employeeEntitlementsDetails[similarEntitlementIndex];
      updatedEntitlement.numDays = (
        (parseFloat(updatedEntitlement.numDays) ?? 0) +
        (parseFloat(values.numDays) ?? 0)
      )?.toString();
      employeeEntitlementsDetails.splice(
        similarEntitlementIndex,
        1,
        updatedEntitlement
      );
      rowEdited > -1 && removeEntitlement(rowEdited);
    } else {
      rowEdited > -1
        ? employeeEntitlementsDetails.splice(rowEdited, 1, values)
        : employeeEntitlementsDetails?.length
          ? setEmployeeEntitlementsDetails([
              ...employeeEntitlementsDetails,
              values
            ])
          : setEmployeeEntitlementsDetails([values]);
    }
    resetForm();
    setRowEdited(-1);
    setSelectedEffectiveDate(undefined);
    setSelectedExpirationDate(undefined);
  };

  const formik = useFormik({
    initialValues,
    validationSchema: employeeEntitlementsDetailsValidation(
      leaveTypesList as LeaveEntitlementDropdownListType[],
      translateText
    ),
    onSubmit,
    validateOnChange: false
  });

  const {
    values,
    errors,
    handleSubmit,
    setFieldValue,
    setFieldError,
    handleChange,
    resetForm
  } = formik;

  const handleEffectiveDateChange = useCallback(
    (newValue: Date | string) => {
      setFieldError("effectiveFrom", "");

      const effectiveFrom =
        newValue instanceof DateTime ? newValue.toJSDate() : newValue;

      if (effectiveFrom)
        void setFieldValue(
          "effectiveFrom",
          convertDateToFormat(new Date(newValue), LONG_DATE_TIME_FORMAT)
        );
      else void setFieldValue("effectiveFrom", "");
    },
    // Note: Adding Missing Dependencies will cause a rerendering issue.
    [values?.year]
  );

  const handleExpirationDateChange = useCallback(
    (newValue: Date | string) => {
      setFieldError("expirationDate", "");

      const expirationDate =
        newValue instanceof DateTime
          ? newValue.toJSDate()
          : typeof newValue === "string"
            ? new Date(newValue)
            : newValue;

      if (expirationDate)
        void setFieldValue(
          "expirationDate",
          convertDateToFormat(new Date(expirationDate), LONG_DATE_TIME_FORMAT)
        );
      else void setFieldValue("expirationDate", "");
    },
    // Note: Adding Missing Dependencies will cause a rerendering issue.
    [values?.year]
  );

  const getMinDate = (): Date => {
    const year = parseInt(values?.year, 10);
    if (employeeEmploymentDetails?.joinedDate) {
      return new Date(employeeEmploymentDetails?.joinedDate);
    } else if (year) {
      return getMinDateOfYear(year).toJSDate();
    } else {
      return getMinDateOfYear(new Date().getFullYear()).toJSDate();
    }
  };

  const getMaxDate = (): Date => {
    const year = parseInt(values?.year, 10);
    if (year) {
      return new Date(`${year}-12-31`);
    } else {
      return new Date(`${new Date().getFullYear()}-12-31`);
    }
  };

  const getProperty = <T, K extends keyof T>(obj: T, key: K) => {
    const output = obj[key] as string;

    if (!output) {
      return "-";
    } else if (key === "effectiveFrom" || key === "expirationDate") {
      return (
        <Typography sx={classes.tableTypography}>
          {convertDateToFormat(new Date(output), "dd/MM/yyyy")}
        </Typography>
      );
    } else if (key === "leaveType") {
      const leaveType =
        leaveTypesList &&
        (leaveTypesList as LeaveEntitlementDropdownListType[])?.find(
          (item: LeaveEntitlementDropdownListType) => item.value === output
        );
      return (
        <Box
          style={{
            width: "fit-content",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            backgroundColor: theme.palette.common.white,
            borderRadius: "9.375rem",
            padding: "0.5rem 1rem"
          }}
        >
          <span role="img" aria-hidden="true">
            {getEmoji(leaveType?.emoji || "")}
          </span>
          {leaveType?.label}
        </Box>
      );
    } else {
      return <Typography sx={classes.tableTypography}>{output}</Typography>;
    }
  };

  const editEntitlement = (rowIndex: number) => {
    setRowEdited(rowIndex);
    const entitlement = employeeEntitlementsDetails[rowIndex];
    void setFieldValue("year", entitlement.year);
    void setFieldValue("leaveType", entitlement.leaveType);
    void setFieldValue("numDays", entitlement.numDays);
    void setFieldValue("effectiveFrom", entitlement.effectiveFrom);
    void setFieldValue("expirationDate", entitlement.expirationDate);
  };

  const removeEntitlement = (rowIndex: number) => {
    const updatedEntitlements = employeeEntitlementsDetails.filter(
      (item, index) => index !== rowIndex
    );
    setEmployeeEntitlementsDetails(updatedEntitlements);
    if (rowEdited === rowIndex) {
      setRowEdited(-1);
      resetForm();
    }
  };

  const handleWheel = (event: ChangeEvent<HTMLInputElement>) => {
    event?.target?.addEventListener(
      "wheel",
      (wheelEvent) => {
        wheelEvent?.preventDefault();
      },
      { passive: false }
    );
  };
  useEffect(() => {
    const year: string = values?.year;
    const currentDate = new Date();

    if (year && parseInt(year.toString()) === currentDate.getFullYear() + 1) {
      const defaultStartDate = new Date(`${year}-01-01`);
      handleEffectiveDateChange(defaultStartDate);
      defaultStartDate > new Date(leaveCycleData?.endDate ?? new Date())
        ? handleExpirationDateChange(getMaxDate())
        : handleExpirationDateChange(leaveCycleData?.endDate ?? new Date());
    } else if (year && rowEdited === -1) {
      const cycleStartMonth = leaveCycleData?.startMonth ?? 1;
      const cycleStartDate = leaveCycleData?.startDate ?? 1;
      const expirationYear =
        cycleStartMonth === 1 && cycleStartDate === 1
          ? currentDate.getFullYear()
          : currentDate.getFullYear() + 1;

      const expirationDate = new Date(
        expirationYear,
        (leaveCycleData?.endMonth ?? 1) - 1,
        leaveCycleData?.endDate ?? 1
      );
      handleEffectiveDateChange(currentDate);
      handleExpirationDateChange(expirationDate);
    }
    // Note: Adding Missing Dependencies will cause a rerendering issue.
  }, [values?.year]);

  useEffect(() => {
    const leaveType =
      leaveTypesList &&
      (leaveTypesList as LeaveEntitlementDropdownListType[])?.find(
        (item: LeaveEntitlementDropdownListType) =>
          item.value === values?.leaveType
      );

    if (leaveType) {
      void setFieldValue("leaveName", leaveType?.label as string);
    }
    // Note: Adding Missing Dependencies will cause a rerendering issue.
  }, [values?.leaveType]);

  useEffect(() => {
    if (values.effectiveFrom) {
      const effectiveFrom = DateTime.fromISO(values.effectiveFrom);
      setSelectedEffectiveDate(effectiveFrom);
    } else {
      setSelectedEffectiveDate(undefined);
    }
    if (values.expirationDate) {
      const expirationDate = DateTime.fromISO(values.expirationDate);
      setSelectedExpirationDate(expirationDate);
    } else {
      setSelectedExpirationDate(undefined);
    }
  }, [values.effectiveFrom, values.expirationDate]);

  return (
    <>
      <Grid container spacing={2} sx={classes.outerGrid}>
        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          <DropdownList
            inputName="year"
            label={translateText(["year"])}
            value={values?.year}
            placeholder={translateText(["yearPlaceholder"])}
            onChange={handleChange}
            onInput={() => setFieldError("year", "")}
            error={errors?.year ?? ""}
            componentStyle={classes.dropdownListStyles}
            errorFocusOutlineNeeded={false}
            itemList={yearList}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          <DropdownList
            inputName="leaveType"
            label={translateText(["leaveType"])}
            value={values?.leaveType}
            placeholder={translateText(["leaveTypePlaceholder"])}
            onChange={handleChange}
            onInput={() => {
              setFieldError("leaveType", "");
              setFieldError("numDays", "");
            }}
            error={errors?.leaveType ?? ""}
            componentStyle={classes.dropdownListStyles}
            errorFocusOutlineNeeded={false}
            itemList={leaveTypesList as LeaveEntitlementDropdownListType[]}
            emojiWithText
            checkSelected
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          <InputField
            inputName="numDays"
            label={translateText(["numberOfDays"])}
            inputType="number"
            value={values?.numDays}
            placeHolder={translateText(["numberOfDaysPlaceholder"])}
            onChange={handleChange}
            onInput={() => setFieldError("numDays", "")}
            onFocus={(event) =>
              handleWheel(event as ChangeEvent<HTMLInputElement>)
            }
            error={errors?.numDays ?? ""}
            componentStyle={classes.inputFieldStyles}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          <InputDate
            label={translateText(["effectiveFrom"])}
            onchange={handleEffectiveDateChange}
            placeholder={translateText(["effectiveFromPlaceholder"])}
            value={
              values?.effectiveFrom === ""
                ? DateTime.fromISO("")
                : DateTime.fromISO(values?.effectiveFrom)
            }
            error={errors?.effectiveFrom ?? ""}
            componentStyle={classes.inputDateStyles}
            minDate={DateTime.fromISO(
              convertDateToFormat(getMinDate(), LONG_DATE_TIME_FORMAT)
            )}
            maxDate={DateTime.fromISO(
              convertDateToFormat(getMaxDate(), LONG_DATE_TIME_FORMAT)
            )}
            disableMaskedInput
            inputFormat="dd/MM/yyyy"
            selectedDate={selectedEffectiveDate}
            setSelectedDate={setSelectedEffectiveDate}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          <InputDate
            label={translateText(["expirationDate"])}
            onchange={handleExpirationDateChange}
            placeholder={translateText(["expirationDatePlaceholder"])}
            value={
              values?.expirationDate === ""
                ? DateTime.fromISO("")
                : DateTime.fromISO(values?.expirationDate)
            }
            error={errors?.expirationDate ?? ""}
            componentStyle={classes.inputDateStyles}
            minDate={DateTime.fromISO(
              values?.effectiveFrom
                ? values?.effectiveFrom
                : convertDateToFormat(getMinDate(), LONG_DATE_TIME_FORMAT)
            )}
            maxDate={DateTime.fromISO(
              convertDateToFormat(getMaxDate(), LONG_DATE_TIME_FORMAT)
            )}
            disableMaskedInput
            inputFormat="dd/MM/yyyy"
            selectedDate={selectedExpirationDate}
            setSelectedDate={setSelectedExpirationDate}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          <Button
            label={
              rowEdited > -1
                ? translateText(["saveChanges"])
                : translateText(["add"])
            }
            onClick={() => handleSubmit()}
            endIcon={rowEdited > -1 ? IconName.SAVE_ICON : IconName.ADD_ICON}
            buttonStyle={ButtonStyle.SECONDARY}
            size={ButtonSizes.MEDIUM}
            styles={classes.buttonStyles}
            type={ButtonTypes.SUBMIT}
          />
        </Grid>
      </Grid>

      {employeeEntitlementsDetails?.length > 0 && (
        <PeopleFormTable
          data={employeeEntitlementsDetails}
          renderCustomCellContent={getProperty}
          headings={tableHeadings}
          onEdit={editEntitlement}
          onDelete={removeEntitlement}
          hoverNeeded={false}
          actionsNeeded
          excludedColumns={["leaveName"]}
          tableName={translateAria(["entitlementsTable"])}
        />
      )}
    </>
  );
};

export default EntitlementsDetailsSection;
