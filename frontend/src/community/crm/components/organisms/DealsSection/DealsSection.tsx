import { FC, useMemo, useState } from "react";

import useDebounce from "~community/common/hooks/useDebounce";
import { SortOrderTypes } from "~community/common/types/CommonTypes";
import { useGetDealsInfinite } from "~community/crm/api/crmDealApi";
import DealsHeader from "~community/crm/components/molecules/DealsHeader/DealsHeader";
import AddDealSidePanel from "~community/crm/components/organisms/AddDealSidePanel/AddDealSidePanel";
import DealsTable from "~community/crm/components/organisms/DealsTable/DealsTable";
import {
  DEAL_PAGE_SIZE,
  DEAL_SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/dealConstants";
import { CrmDealSortEnum } from "~community/crm/enums/common";

const DealsSection: FC = () => {
  const [inputValue, setInputValue] = useState("");
  const debouncedSearch = useDebounce(inputValue, DEAL_SEARCH_DEBOUNCE_DELAY);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    isFetchingNextPage,
    isPlaceholderData
  } = useGetDealsInfinite({
    size: DEAL_PAGE_SIZE,
    sortKey: CrmDealSortEnum.STAGE_ORDER,
    sortOrder: SortOrderTypes.ASC,
    searchKeyword: debouncedSearch || undefined
  });

  const allDeals = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data]
  );

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
        isLoading={isLoading || isPlaceholderData}
        isError={isError}
        allDeals={allDeals}
        hasNextPage={hasNextPage}
        onLoadMore={loadMore}
      />
      <AddDealSidePanel />
    </div>
  );
};

export default DealsSection;
