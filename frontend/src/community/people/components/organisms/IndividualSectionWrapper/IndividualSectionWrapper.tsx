import { useEffect, useRef } from "react";

import { useGetEmployee } from "~community/people/api/PeopleApi";
import useDefaultTabNavigation from "~community/people/hooks/useDefaultTabNavigation";
import { usePeopleStore } from "~community/people/store/store";

import DirectorySteppers from "../../molecules/DirectorySteppers/DirectorySteppers";
import UserDetailsCentered from "../../molecules/UserDetailsCentered/UserDetailsCentered";
import PeopleIndividualSection from "../PeopleIndividualSection/PeopleIndividualSection";

interface Props {
  employeeId: number;
}

const IndividualSectionWrapper = ({ employeeId }: Props) => {
  const { data: employeeData } = useGetEmployee(employeeId);

  const { currentStep, nextStep, employee, setCurrentStep, setEmployee } =
    usePeopleStore((state) => state);

  const individualSectionsRef = useRef<HTMLDivElement>(null);

  useDefaultTabNavigation();

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
