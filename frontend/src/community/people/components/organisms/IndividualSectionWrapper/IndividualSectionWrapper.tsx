import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

import { useGetEmployee } from "~community/people/api/PeopleApi";
import { usePeopleStore } from "~community/people/store/store";
import { EditPeopleFormTypes } from "~community/people/types/PeopleEditTypes";

import DirectorySteppers from "../../molecules/DirectorySteppers/DirectorySteppers";
import UserDetailsCentered from "../../molecules/UserDetailsCentered/UserDetailsCentered";
import PeopleIndividualSection from "../PeopleIndividualSection/PeopleIndividualSection";

interface Props {
  employeeId: number;
}

const IndividualSectionWrapper = ({ employeeId }: Props) => {
  const router = useRouter();
  const { tab } = router.query;

  const { data: employeeData } = useGetEmployee(employeeId);

  const {
    currentStep,
    nextStep,
    employee,
    setCurrentStep,
    setNextStep,
    setEmployee
  } = usePeopleStore((state) => state);

  const individualSectionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      tab === EditPeopleFormTypes.leave.toLowerCase() &&
      nextStep !== EditPeopleFormTypes.leave
    ) {
      setNextStep(EditPeopleFormTypes.leave);
    } else if (
      tab === EditPeopleFormTypes.timesheet.toLowerCase() &&
      nextStep !== EditPeopleFormTypes.timesheet
    ) {
      setNextStep(EditPeopleFormTypes.timesheet);
    }
  }, []);

  useEffect(() => {
    if (employeeData) {
      setEmployee(employeeData?.data?.results[0]);
    }
  }, [employeeData, setEmployee]);

  useEffect(() => {
    if (currentStep !== nextStep) {
      setCurrentStep(nextStep);
    }
  }, [currentStep, nextStep, setCurrentStep]);

  return (
    <>
      {employee && (
        <UserDetailsCentered
          selectedUser={employee}
          styles={{
            marginBottom: "1rem",
            marginTop: "1.5rem"
          }}
          enableEdit={false}
        />
      )}
      <DirectorySteppers
        employeeId={Number(employeeId)}
        formRef={individualSectionsRef}
        isIndividualView
      />
      <PeopleIndividualSection
        employeeId={Number(employeeId)}
        formRef={individualSectionsRef}
      />
    </>
  );
};

export default IndividualSectionWrapper;
