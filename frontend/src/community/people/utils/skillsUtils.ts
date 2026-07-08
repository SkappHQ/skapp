import { SkillTypes } from "~community/people/enums/PeopleEnums";
import {
  SkillType,
  SkillUpdatesType
} from "~community/people/types/PeopleTypes";

const isNewCustomSkill = (skill: SkillType): boolean =>
  skill.skillType === SkillTypes.CUSTOM && skill.skillId == null;

export const getNewCustomSkills = (
  skillUpdates: SkillUpdatesType
): SkillType[] => skillUpdates.add.filter(isNewCustomSkill);

export const buildResolvedSkillUpdates = (
  skillUpdates: SkillUpdatesType,
  createdCustomSkills: SkillType[]
): SkillUpdatesType => {
  const createdIdByName = new Map(
    createdCustomSkills.map((skill) => [skill.name, skill.skillId])
  );

  const add: SkillType[] = skillUpdates.add.map((skill) => ({
    skillId: isNewCustomSkill(skill)
      ? createdIdByName.get(skill.name)
      : skill.skillId,
    skillType: skill.skillType
  }));

  const remove: SkillType[] = skillUpdates.remove.map((skill) => ({
    skillId: skill.skillId,
    skillType: skill.skillType
  }));

  return { add, remove };
};
