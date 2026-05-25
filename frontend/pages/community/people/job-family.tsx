import { NextPage } from "next";
import { useEffect, useState } from "react";

import SearchBox from "~community/common/components/molecules/SearchBox/SearchBox";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetAllJobFamilies } from "~community/people/api/JobFamilyApi";
import JobFamilyModalController from "~community/people/components/organisms/JobFamilyModalController/JobFamilyModalController";
import JobFamilyTable from "~community/people/components/organisms/JobFamilyTable/JobFamilyTable";
import { JobFamilyActionModalEnums } from "~community/people/enums/JobFamilyEnums";
import { usePeopleStore } from "~community/people/store/store";

const JobFamily: NextPage = () => {
  const translateText = useTranslator("peopleModule");

  const { data: allJobFamiliesData, isPending: isJobFamilyPending } =
    useGetAllJobFamilies();

  const { isPeopleAdmin } = useSessionData();

  const { setAllJobFamilies, setJobFamilyModalType } = usePeopleStore(
    (state) => ({
      setAllJobFamilies: state.setAllJobFamilies,
      setJobFamilyModalType: state.setJobFamilyModalType
    })
  );

  const [jobFamilySearchTerm, setJobFamilySearchTerm] = useState<string>("");

  useEffect(() => {
    setAllJobFamilies(allJobFamiliesData ?? []);
  }, [allJobFamiliesData, setAllJobFamilies]);

  return (
    <ContentLayout
      breadcrumbs={[
        {
          label: translateText(["dashboard.people"])
        },
        {
          label: translateText(["jobFamily.title"])
        }
      ]}
      pageHead={translateText(["jobFamily.tabTitle"])}
      title={translateText(["jobFamily.title"])}
      isDividerVisible
      primaryButtonText={
        Boolean(allJobFamiliesData?.length ?? 0) &&
        isPeopleAdmin &&
        translateText(["jobFamily.addJobFamily"])
      }
      onPrimaryButtonClick={() =>
        setJobFamilyModalType(JobFamilyActionModalEnums.ADD_JOB_FAMILY)
      }
    >
      <>
        {allJobFamiliesData && allJobFamiliesData?.length > 0 && (
          <SearchBox
            value={jobFamilySearchTerm}
            setSearchTerm={setJobFamilySearchTerm}
            placeHolder={translateText([
              "jobFamily.jobFamilySearchPlaceholder"
            ])}
          />
        )}
        <JobFamilyTable
          jobFamilySearchTerm={jobFamilySearchTerm}
          allJobFamilies={allJobFamiliesData}
          isJobFamilyPending={isJobFamilyPending}
        />
        <JobFamilyModalController />
      </>
    </ContentLayout>
  );
};

export default JobFamily;
