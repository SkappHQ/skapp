import { SearchIcon } from "@rootcodelabs/skapp-ui";
import { forwardRef, useImperativeHandle } from "react";

import PeopleLayout from "~community/common/components/templates/PeopleLayout/PeopleLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { SKILL_OPTIONS } from "~community/people/constants/skillConstants";
import { SkillTypes } from "~community/people/enums/PeopleEnums";
import { usePeopleStore } from "~community/people/store/store";
import { FormMethods } from "~community/people/types/PeopleEditTypes";
import { SkillType } from "~community/people/types/PeopleTypes";

import ChipAutocomplete from "~community/common/components/molecules/ChipAutocomplete/ChipAutocomplete";

interface Props {
  isInputsDisabled?: boolean;
  isReadOnly?: boolean;
  customSkills?: SkillType[];
}

const SkillsDetailsSection = forwardRef<FormMethods, Props>((props, ref) => {
  const { isInputsDisabled, isReadOnly = false, customSkills = [] } = props;
  const translateText = useTranslator(
    "peopleModule",
    "addResource",
    "skillsDetails"
  );

  const { employee, setPersonalDetails } = usePeopleStore((state) => state);

  const skills: SkillType[] = employee?.personal?.skills ?? [];

  const allOptions = [
    ...SKILL_OPTIONS.map((s) => s.label),
    ...customSkills
      .filter((s) => !SKILL_OPTIONS.some((opt) => opt.label === s.name))
      .map((s) => s.name ?? "")
      .filter(Boolean)
  ];

  useImperativeHandle(ref, () => ({
    validateForm: async () => {
      return {};
    },
    submitForm: async () => {},
    resetForm: () => {}
  }));

  const getSkillDisplayNames = (skills: SkillType[]): string[] => {
    return skills.map((skill) => {
      if (skill.skillType === SkillTypes.DEFAULT) {
        const found = SKILL_OPTIONS.find((opt) => opt.id === skill.skillId);
        return found?.label ?? skill.name ?? "";
      }
      return skill.name ?? "";
    });
  };

  const findExistingSkill = (name: string): SkillType | undefined => {
    return skills.find((s) => {
      if (s.skillType === SkillTypes.DEFAULT) {
        const found = SKILL_OPTIONS.find((opt) => opt.id === s.skillId);
        return found?.label === name;
      }
      return s.name === name;
    });
  };

  const handleSkillsChange = (newSkillNames: string[]) => {
    const updatedSkills: SkillType[] = newSkillNames.map((name) => {
      const existingSkill = findExistingSkill(name);
      if (existingSkill) return existingSkill;

      const defaultOption = SKILL_OPTIONS.find((opt) => opt.label === name);
      if (defaultOption) {
        return { skillId: defaultOption.id, skillType: SkillTypes.DEFAULT };
      }

      const existingCustomSkill = customSkills.find((s) => s.name === name);
      if (existingCustomSkill) return existingCustomSkill;

      return { skillType: SkillTypes.CUSTOM, name };
    });

    setPersonalDetails({
      ...employee?.personal,
      skills: updatedSkills
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
        helperText={translateText(["helperText"])}
        value={getSkillDisplayNames(skills)}
        onChange={handleSkillsChange}
        options={allOptions}
        isDisabled={isInputsDisabled}
        readOnly={isReadOnly}
        endIcon={<SearchIcon className="size-6 text-secondary-text shrink-0" />}
      />
    </PeopleLayout>
  );
});

SkillsDetailsSection.displayName = "SkillsDetailsSection";

export default SkillsDetailsSection;
