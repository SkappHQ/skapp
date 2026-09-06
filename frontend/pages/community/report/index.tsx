import { EmptyDataView, InputField, SearchIcon } from "@rootcodelabs/skapp-ui";
import { NextPage } from "next";
import { ChangeEvent, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import ReportCard from "~community/report/components/molecules/ReportCard/ReportCard";
import { REPORT_LIST } from "~community/report/constants/reportConstants";

const Reports: NextPage = () => {
  const translateText = useTranslator("reportModule", "reports");

  const [reportSearchTerm, setReportSearchTerm] = useState<string>("");

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setReportSearchTerm(event.target.value);
  };

  const searchTerm = reportSearchTerm.trim().toLowerCase();

  const filteredReports = REPORT_LIST.map((report) => ({
    ...report,
    label: translateText([report.labelKey])
  })).filter(({ label }) => label.toLowerCase().includes(searchTerm));

  return (
    <ContentLayout
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      isDividerVisible={false}
    >
      <div>
        <InputField
          ariaLabelClearButton={translateText(["clearSearchAriaLabel"])}
          aria-label={translateText(["searchPlaceholder"])}
          className="mt-6 w-97"
          placeholder={translateText(["searchPlaceholder"])}
          rightIcon={<SearchIcon />}
          state="default"
          type="search"
          value={reportSearchTerm}
          onChange={handleSearchChange}
        />

        {filteredReports.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-4">
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                icon={<Icon name={report.iconName} />}
                label={report.label}
              />
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyDataView
              icon={<SearchIcon width="24" height="24" />}
              title={translateText(["noResultsTitle"])}
              description={translateText(["noResultsDescription"])}
            />
          </div>
        )}
      </div>
    </ContentLayout>
  );
};

export default Reports;
