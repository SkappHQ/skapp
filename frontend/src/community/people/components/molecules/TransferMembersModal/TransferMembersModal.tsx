import {
  Box,
  Divider,
  SelectChangeEvent,
  Stack,
  SxProps,
  Typography
} from "@mui/material";
import { FC, useEffect } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import Avatar from "~community/common/components/molecules/Avatar/Avatar";
import RoundedSelect, {
  SelectOption
} from "~community/common/components/molecules/RoundedSelect/RoundedSelect";
import {
  ButtonStyle,
  ButtonTypes
} from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { usePeopleStore } from "~community/people/store/store";
import {
  JobFamilyEmployeeDataType,
  TransferMemberFormType
} from "~community/people/types/JobFamilyTypes";
import {
  getEmployeeDetails,
  getJobTitlesWithJobFamilyId
} from "~community/people/utils/jobFamilyUtils/commonUtils";
import { handleJobFamilyDropDownItemClick } from "~community/people/utils/jobFamilyUtils/jobFamilyUtils";
import { handleJobTitleDropDownItemClick } from "~community/people/utils/jobFamilyUtils/jobTitleUtils";

import styles from "./styles";

interface Props {
  jobFamilyTransfer: boolean;
  description: string;
  initialValues: TransferMemberFormType[] | undefined;
  jobFamily: SelectOption[] | undefined;
  employees: JobFamilyEmployeeDataType[] | undefined;
  handleSubmit: (values: any) => void;
  handleCancel: () => void;
  primaryBtnText: string;
  jobTitleId?: number;
}

const TransferMembersModal: FC<Props> = ({
  jobFamilyTransfer,
  description,
  initialValues,
  jobFamily,
  employees,
  handleSubmit,
  handleCancel,
  primaryBtnText,
  jobTitleId
}) => {
  const classes = styles();

  const translateText = useTranslator("peopleModule", "jobFamily");

  const {
    currentTransferMembersData: values,
    allJobFamilies,
    setCurrentTransferMembersData: setValues
  } = usePeopleStore((state) => state);

  useEffect(() => {
    const dataToSet = values ?? initialValues;
    if (dataToSet) {
      setValues(dataToSet);
    }
  }, [initialValues, values, setValues]);

  return (
    <Stack sx={classes.wrapper}>
      <Typography>{description}</Typography>
      <Stack sx={classes.contentWrapper}>
        <Stack sx={classes.textWrapper} aria-hidden={true}>
          <Typography
            variant="body1"
            sx={{ ...classes.membersCell } as SxProps}
          >
            {translateText(["member"])}
          </Typography>
          <Typography
            variant="body1"
            sx={
              {
                ...classes.dropDownCell
              } as SxProps
            }
          >
            {translateText(["jobFamily"])}
          </Typography>
          <Typography
            variant="body1"
            sx={
              {
                ...classes.dropDownCell
              } as SxProps
            }
          >
            {translateText(["jobTitle"])}
          </Typography>
        </Stack>
        <Divider sx={classes.divider} aria-hidden={true} />
        <Stack sx={classes.bodyWrapper}>
          <Stack sx={classes.bodyContainer}>
            {values?.map((member: TransferMemberFormType) => {
              const employee = getEmployeeDetails(
                member?.employeeId,
                employees
              );

              const jobTitleOptions = getJobTitlesWithJobFamilyId(
                jobFamilyTransfer,
                allJobFamilies,
                member.jobFamily?.jobFamilyId ?? 0,
                jobTitleId
              );

              return (
                <Stack key={employee?.employeeId} sx={classes.textWrapper}>
                  <Box sx={classes.membersCell}>
                    <Avatar
                      firstName={employee?.firstName ?? ""}
                      lastName={employee?.lastName ?? ""}
                      src={employee?.authPic ?? ""}
                    />
                    <Typography
                      variant="body1"
                      aria-hidden={true}
                      sx={
                        {
                          ...classes.membersName,
                          ...classes.seeMoreStyles
                        } as SxProps
                      }
                    >
                      {`${employee?.firstName} ${employee?.lastName}`}
                    </Typography>
                  </Box>
                  <Box sx={classes.dropDownCell} aria-hidden={true}>
                    <RoundedSelect
                      id="job-family-select"
                      options={jobFamily ?? []}
                      value={
                        member.jobFamily?.name ??
                        translateText(["jobFamilyDropDownPlaceholder"], {
                          memberName: `${employee?.firstName} ${employee?.lastName}`
                        })
                      }
                      variant="body2"
                      disabled={!jobFamilyTransfer}
                      onChange={(event: SelectChangeEvent) => {
                        const selectedOption = jobFamily?.find(
                          (option) =>
                            option.value.toString() ===
                            event.target.value.toString()
                        );

                        if (selectedOption !== undefined) {
                          handleJobFamilyDropDownItemClick(
                            employee?.employeeId,
                            selectedOption,
                            values,
                            setValues
                          );
                        }
                      }}
                      customStyles={{
                        label: {
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        },
                        menuProps: {
                          sx: {
                            width: "100%"
                          }
                        },
                        select: {
                          width: "9.6875rem",
                          "& .MuiSelect-select": {
                            padding: "0.75rem 2rem 0.75rem 1rem"
                          }
                        }
                      }}
                    />
                  </Box>
                  <Box sx={classes.dropDownCell} aria-hidden={true}>
                    <RoundedSelect
                      id="job-title-select"
                      name="jobTitle"
                      options={jobTitleOptions ?? []}
                      value={
                        member.jobTitle?.name ??
                        translateText(["jobTitleDropDownPlaceholder"], {
                          memberName: `${employee?.firstName} ${employee?.lastName}`
                        })
                      }
                      variant="body2"
                      disabled={!member.jobFamily?.jobFamilyId}
                      onChange={(event: SelectChangeEvent) => {
                        const selectedOption = jobTitleOptions?.find(
                          (option) =>
                            option.value.toString() ===
                            event.target.value.toString()
                        );

                        if (selectedOption !== undefined) {
                          handleJobTitleDropDownItemClick(
                            employee?.employeeId,
                            selectedOption,
                            values,
                            setValues
                          );
                        }
                      }}
                      customStyles={{
                        label: {
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        },
                        menuProps: {
                          sx: {
                            width: "100%"
                          }
                        },
                        select: {
                          width: "9.6875rem",
                          "& .MuiSelect-select": {
                            padding: "0.75rem 2rem 0.75rem 1rem"
                          }
                        }
                      }}
                    />
                  </Box>
                </Stack>
              );
            })}
          </Stack>
        </Stack>
      </Stack>
      <Button
        type={ButtonTypes.SUBMIT}
        label={primaryBtnText}
        buttonStyle={ButtonStyle.ERROR}
        endIcon={IconName.RIGHT_ARROW_ICON}
        onClick={() => handleSubmit(values)}
        accessibility={{
          ariaHidden: true
        }}
      />
      <Button
        label={translateText(["backBtnText"])}
        buttonStyle={ButtonStyle.TERTIARY}
        startIcon={IconName.LEFT_ARROW_ICON}
        onClick={handleCancel}
        accessibility={{
          ariaHidden: true
        }}
      />
    </Stack>
  );
};

export default TransferMembersModal;
