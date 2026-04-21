import { RefObject } from "react";

import { FilterButtonTypes } from "~community/common/types/filterTypes";
import { PeopleFilterHeadings } from "~community/people/types/CommonTypes";

import DemographicsSection from "../ExpandedFilerSections/DemographicsSection";
import EmploymentSection from "../ExpandedFilerSections/EmploymentSection";
import JobFamiliesSection from "../ExpandedFilerSections/JobFamiliesSection";
import TeamSection from "../ExpandedFilerSections/TeamSection";
import UserRolesSection from "../ExpandedFilerSections/UserRolesSection";

const FilterTypeDetailedSection = ({
  basicChipRef,
  selected,
  teams,
  jobFamilies
}: {
  basicChipRef: RefObject<{ [key: string]: HTMLDivElement | null }>;
  selected: PeopleFilterHeadings;
  teams?: FilterButtonTypes[];
  jobFamilies?: FilterButtonTypes[];
}) => {
  const renderSelectedSection = () => {
    switch (selected) {
      case PeopleFilterHeadings.DEMOGRAPICS:
        return (
          <DemographicsSection
            basicChipRef={basicChipRef}
            selected={selected}
          />
        );
      case PeopleFilterHeadings.EMPLOYMENTS:
        return <EmploymentSection basicChipRef={basicChipRef} />;
      case PeopleFilterHeadings.JOB_FAMILIES:
        return (
          <JobFamiliesSection
            jobFamilies={jobFamilies}
            basicChipRef={basicChipRef}
          />
        );
      case PeopleFilterHeadings.TEAMS:
        return <TeamSection teams={teams} basicChipRef={basicChipRef} />;
      case PeopleFilterHeadings.USER_ROLES:
        return <UserRolesSection basicChipRef={basicChipRef} />;
      default:
        return null;
    }
  };

  return <>{renderSelectedSection()}</>;
};

export default FilterTypeDetailedSection;
