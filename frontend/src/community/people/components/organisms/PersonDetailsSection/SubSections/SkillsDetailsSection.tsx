import { forwardRef, useImperativeHandle } from "react";

import PeopleLayout from "~community/common/components/templates/PeopleLayout/PeopleLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { usePeopleStore } from "~community/people/store/store";
import { FormMethods } from "~community/people/types/PeopleEditTypes";

import ChipAutocomplete from "../../../molecules/ChipAutocomplete/ChipAutocomplete";

interface Props {
  isInputsDisabled?: boolean;
  isReadOnly?: boolean;
}

const SkillsDetailsSection = forwardRef<FormMethods, Props>((props, ref) => {
  const { isInputsDisabled, isReadOnly = false } = props;
  const translateText = useTranslator(
    "peopleModule",
    "addResource",
    "skillsDetails"
  );

  const { employee, setPersonalDetails } = usePeopleStore((state) => state);

  const skills = employee?.personal?.skills?.skills ?? [];

  useImperativeHandle(ref, () => ({
    validateForm: async () => {
      return {};
    },
    submitForm: async () => {},
    resetForm: () => {}
  }));

  const handleSkillsChange = (newSkills: string[]) => {
    setPersonalDetails({
      ...employee?.personal,
      skills: { skills: newSkills }
    });
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
      <ChipAutocomplete
        id="skills"
        label={translateText(["skills"])}
        placeholder={translateText(["searchSkills"])}
        value={skills}
        onChange={handleSkillsChange}
        isDisabled={isInputsDisabled}
        readOnly={isReadOnly}
      />
    </PeopleLayout>
  );
});

SkillsDetailsSection.displayName = "SkillsDetailsSection";

export default SkillsDetailsSection;
