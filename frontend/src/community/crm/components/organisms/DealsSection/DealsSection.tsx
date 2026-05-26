import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { SortOrderTypes } from "~community/common/types/CommonTypes";
import { useGetDealsInfinite } from "~community/crm/api/crmDealApi";
import DealsHeader from "~community/crm/components/molecules/DealsHeader/DealsHeader";
import DealsTable from "~community/crm/components/organisms/DealsTable/DealsTable";
import {
  DEAL_PAGE_SIZE,
  DEAL_SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/dealConstants";
import { CrmDealSortEnum } from "~community/crm/enums/common";

const DealsSection: FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSearchChange = (value: string) => {
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchKeyword(value);
    }, DEAL_SEARCH_DEBOUNCE_DELAY);
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useGetDealsInfinite({
      size: DEAL_PAGE_SIZE,
      sortKey: CrmDealSortEnum.STAGE_ORDER,
      sortOrder: SortOrderTypes.ASC,
      searchKeyword: searchKeyword || undefined
    });

  const allDeals = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data]
  );

  const handleLoadMore = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="flex flex-col gap-6 w-full">
      <DealsHeader
        inputValue={inputValue}
        onSearchChange={handleSearchChange}
      />
      <DealsTable
        searchKeyword={searchKeyword}
        isLoading={isLoading}
        allDeals={allDeals}
        hasNextPage={hasNextPage ?? false}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
};

export default DealsSection;
