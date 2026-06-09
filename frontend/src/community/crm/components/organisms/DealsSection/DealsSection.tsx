import { FC, useMemo, useState } from "react";

import useDebounce from "~community/common/hooks/useDebounce";
import { SortOrderTypes } from "~community/common/types/CommonTypes";
import { useGetDealsInfinite } from "~community/crm/api/crmDealApi";
import DealsTable from "~community/crm/components/organisms/DealsTable/DealsTable";
import {
  DEAL_PAGE_SIZE,
  DEAL_SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/dealConstants";
import { CrmDealSortEnum } from "~community/crm/enums/common";
import { CrmDealListItem } from "~community/crm/types/CommonTypes";

import DealsHeader from "./DealsHeader/DealsHeader";

interface Props {
  onDealClick?: (deal: CrmDealListItem) => void;
}

const DealsSection: FC<Props> = ({ onDealClick }) => {
  const [inputValue, setInputValue] = useState("");
  const debouncedSearch = useDebounce(inputValue, DEAL_SEARCH_DEBOUNCE_DELAY);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage
  } = useGetDealsInfinite({
    size: DEAL_PAGE_SIZE,
    sortKey: CrmDealSortEnum.STAGE_ORDER,
    sortOrder: SortOrderTypes.ASC,
    searchKeyword: debouncedSearch
  });

  const allDeals = useMemo(() => data?.pages.flatMap((p) => p?.items ?? []), [data]);

  // TODO: Remove dummy data once API returns real deals
  const dummyDeals: CrmDealListItem[] = [
    {
      id: 1,
      name: "Enterprise License",
      stageName: "Qualification",
      stageColor: "#3B82F6",
      amount: "25000",
      companyName: "Acme Corp",
      contactName: "John Doe",
      owner: { employeeId: 1, firstName: "Jane", lastName: "Smith", authPic: null }
    },
    {
      id: 2,
      name: "SaaS Annual Plan",
      stageName: "Proposal",
      stageColor: "#F59E0B",
      amount: "12000",
      companyName: "TechStart Inc",
      contactName: "Alice Johnson",
      owner: { employeeId: 2, firstName: "Bob", lastName: "Williams", authPic: null }
    },
    {
      id: 3,
      name: "Consulting Package",
      stageName: "Negotiation",
      stageColor: "#10B981",
      amount: "8500",
      companyName: "Global Solutions",
      contactName: "Mike Chen",
      owner: { employeeId: 1, firstName: "Jane", lastName: "Smith", authPic: null }
    },
    {
      id: 4,
      name: "Support Contract",
      stageName: "Closed Won",
      stageColor: "#8B5CF6",
      amount: "3200",
      companyName: null,
      contactName: "Sara Lee",
      owner: { employeeId: 3, firstName: "Tom", lastName: "Davis", authPic: null }
    }
  ];

  const displayDeals = (allDeals && allDeals.length > 0) ? allDeals : dummyDeals;

  const loadMore = async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <DealsHeader inputValue={inputValue} onSearchChange={setInputValue} />
      <DealsTable
        searchKeyword={debouncedSearch}
        isLoading={isLoading}
        allDeals={displayDeals}
        hasNextPage={hasNextPage}
        onLoadMore={loadMore}
        onDealClick={onDealClick}
      />
    </div>
  );
};

export default DealsSection;
