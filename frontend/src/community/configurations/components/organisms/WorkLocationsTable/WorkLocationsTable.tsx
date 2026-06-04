import {
  ButtonV2,
  EmptyStateType,
  IconButton,
  InputField,
  SearchIcon,
  Table,
  TableColumn
} from "@rootcodelabs/skapp-ui";
import { useRouter } from "next/router";
import { ChangeEvent, useMemo, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import ROUTES from "~community/common/constants/routes";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { useGetWorkLocationsInfinite } from "~community/configurations/api/WorkLocationApi";
import DeleteWorkLocationModal from "~community/configurations/components/molecules/DeleteWorkLocationModal/DeleteWorkLocationModal";
import {
  WORK_LOCATION_PAGE_SIZE,
  WORK_LOCATION_SEARCH_DEBOUNCE_MS
} from "~community/configurations/constants/workLocationConstants";
import { useWorkLocationStore } from "~community/configurations/stores/workLocationStore";
import {
  WorkLocation,
  WorkLocationsPage
} from "~community/configurations/types/WorkLocationTypes";

const WorkLocationsTable = () => {
  const router = useRouter();
  const translateText = useTranslator("configurations", "workLocation");
  const [search, setSearch] = useState("");
  const [emptyStateType, setEmptyStateType] = useState<EmptyStateType>(
    "noData" as EmptyStateType
  );

  const { setIsDeleteModalOpen, setSelectedLocationId } =
    useWorkLocationStore();
  const debouncedSearch = useDebounce(search, WORK_LOCATION_SEARCH_DEBOUNCE_MS);

  const {
    data: locationPages,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useGetWorkLocationsInfinite(debouncedSearch, WORK_LOCATION_PAGE_SIZE);

  const locations: WorkLocation[] = useMemo(
    () =>
      locationPages?.pages?.flatMap(
        (page: WorkLocationsPage) => page?.items ?? []
      ) ?? [],
    [locationPages]
  );

  const handleEditClick = (id: number) => {
    router.push(ROUTES.CONFIGURATIONS.WORK_LOCATION_EDIT(id));
  };

  const handleDeleteClick = (id: number) => {
    setSelectedLocationId(id);
    setIsDeleteModalOpen(true);
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    if (event.target.value.trim() === "") {
      setEmptyStateType("noData" as EmptyStateType);
    } else {
      setEmptyStateType("noSearchResults" as EmptyStateType);
    }
  };

  const columns = [
    {
      columnAriaLabel: translateText(["table.nameHeaderUpper"]),
      header: translateText(["table.nameHeaderUpper"]),
      key: "name",
      render: (name: string) => <span className="body2">{name}</span>,
      width: "20%"
    },
    {
      columnAriaLabel: translateText(["table.addressHeaderUpper"]),
      header: translateText(["table.addressHeaderUpper"]),
      key: "address",
      render: (address: string) => <span className="body2">{address}</span>,
      width: "35%"
    },
    {
      columnAriaLabel: translateText(["table.employeesHeaderUpper"]),
      header: translateText(["table.employeesHeaderUpper"]),
      key: "employeeCount",
      render: (count: number) => <span className="body2">{count}</span>,
      width: "20%"
    },
    {
      columnAriaLabel: translateText(["table.actionsHeaderUpper"]),
      header: translateText(["table.actionsHeaderUpper"]),
      key: "actions",
      render: (row: { id: number }) => (
        <div className="flex items-center gap-2">
          <IconButton
            icon={<Icon name={IconName.EDIT_ICON} />}
            onClick={(e) => {
              e?.stopPropagation();
              handleEditClick(row.id);
            }}
            aria-label={translateText(["table.editAction"])}
          />
          <IconButton
            icon={<Icon name={IconName.DELETE_BUTTON_ICON} />}
            onClick={(e) => {
              e?.stopPropagation();
              handleDeleteClick(row.id);
            }}
            aria-label={translateText(["table.deleteAction"])}
          />
        </div>
      ),
      width: "25%"
    }
  ];

  const tableData = locations.map((location) => ({
    id: location.workLocationId.toString(),
    name: location.name,
    address: location.address ?? "-",
    employeeCount: location.employeeCount,
    actions: {
      id: location.workLocationId
    }
  }));

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex gap-2 items-center justify-between">
        <InputField
          className="w-[412px]"
          placeholder={translateText(["table.searchPlaceholder"])}
          rightIcon={<SearchIcon />}
          state="default"
          type="search"
          value={search}
          onChange={handleSearchChange}
        />
        {locations.length > 0 && (
          <ButtonV2
            variant="primary"
            onClick={() =>
              router.push(ROUTES.CONFIGURATIONS.WORK_LOCATION_CREATE)
            }
            icon={<Icon name={IconName.ADD_ICON} width="1rem" height="1rem" />}
            iconPosition="start"
          >
            {translateText(["table.addButton"])}
          </ButtonV2>
        )}
      </div>
      <Table
        columns={columns as TableColumn<any>[]}
        data={tableData}
        emptyStateType={emptyStateType}
        isLoading={isLoading}
        onLoadMore={
          hasNextPage
            ? async () => {
                if (hasNextPage && !isFetchingNextPage) await fetchNextPage();
              }
            : undefined
        }
        hasMore={hasNextPage ?? false}
        noDataState={{
          buttonText: translateText(["table.addButton"]),
          description: translateText(["table.emptyStateDescription"]),
          icon: <SearchIcon />,
          onButtonClick: () =>
            router.push(ROUTES.CONFIGURATIONS.WORK_LOCATION_CREATE),
          title: translateText(["table.emptyStateTitle"])
        }}
        noSearchResultsState={{
          description: translateText(["table.emptyStateDescription"]),
          icon: <SearchIcon />,
          title: translateText(["table.emptyStateTitle"])
        }}
      />
      <DeleteWorkLocationModal />
    </div>
  );
};

export default WorkLocationsTable;
