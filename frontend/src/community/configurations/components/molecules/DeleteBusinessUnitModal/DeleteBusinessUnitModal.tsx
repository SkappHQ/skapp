import {
  CloseIcon,
  DeleteButtonIcon,
  SmallModal
} from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import {
  useDeleteBusinessUnit,
  useGetBusinessUnitSummary,
  useGetBusinessUnits
} from "~community/common/api/BusinessUnitApi";
import { BUSINESS_UNIT_TRANSFER_UNASSIGN_VALUE } from "~community/common/constants/commonConstants";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { BusinessUnit } from "~community/common/types/BusinessUnitTypes";
import DeleteBusinessUnitTransferContent from "~community/configurations/components/molecules/DeleteBusinessUnitModal/DeleteBusinessUnitTransferContent";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  businessUnit: BusinessUnit;
}

const DeleteBusinessUnitModal: FC<Props> = ({
  isOpen,
  onClose,
  businessUnit
}) => {
  const translateText = useTranslator("configurations", "businessUnit");
  const { setToastMessage } = useToast();

  const [transferTargetValue, setTransferTargetValue] = useState<string>(
    BUSINESS_UNIT_TRANSFER_UNASSIGN_VALUE
  );

  const { data: businessUnitSummary, isLoading: isBusinessUnitSummaryLoading } =
    useGetBusinessUnitSummary(businessUnit.businessUnitId);

  const { data: businessUnits } = useGetBusinessUnits();

  const assignedEmployeeCount = businessUnitSummary?.assignedEmployeeCount;
  const isOtherBusinessUnitsExist =
    businessUnitSummary?.isOtherBusinessUnitsExist;

  const getSelectedTargetId = (): number | undefined =>
    transferTargetValue === BUSINESS_UNIT_TRANSFER_UNASSIGN_VALUE
      ? undefined
      : Number(transferTargetValue);

  const getSuccessDescription = (
    count: number | undefined,
    targetId: number | undefined
  ): string => {
    if (count === 0) {
      return translateText(["toasts", "deleteSuccess", "description"]);
    }

    if (targetId !== undefined) {
      return translateText(
        ["toasts", "deleteAndTransferSuccess", "description"],
        { count }
      );
    }

    return translateText(
      ["toasts", "deleteAndUnassignSuccess", "description"],
      {
        count
      }
    );
  };

  const handleDeleteSuccess = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["toasts", "deleteSuccess", "title"]),
      description: getSuccessDescription(
        assignedEmployeeCount,
        getSelectedTargetId()
      )
    });
    onClose();
  };

  const handleDeleteError = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toasts", "error", "title"]),
      description: translateText(["toasts", "deleteError", "description"])
    });
  };

  const { mutate: deleteBusinessUnit, isPending } = useDeleteBusinessUnit(
    handleDeleteSuccess,
    handleDeleteError
  );

  const handleDelete = () => {
    deleteBusinessUnit({
      id: businessUnit.businessUnitId,
      transferToBusinessUnitId: getSelectedTargetId()
    });
  };

  const renderContent = () => {
    if (
      isBusinessUnitSummaryLoading ||
      assignedEmployeeCount === undefined ||
      !businessUnits
    ) {
      return (
        <div className="flex flex-col gap-3">
          <div className="h-4 w-full animate-pulse rounded bg-tertiary-background" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-tertiary-background" />
        </div>
      );
    }

    if (assignedEmployeeCount === 0) {
      return (
        <p className="body1">
          {translateText(["deleteModal", "confirmDescription"], {
            name: businessUnit.name
          })}
        </p>
      );
    }

    if (isOtherBusinessUnitsExist) {
      return (
        <DeleteBusinessUnitTransferContent
          businessUnits={businessUnits}
          currentBusinessUnitId={businessUnit.businessUnitId}
          businessUnitName={businessUnit.name}
          assignedEmployeeCount={assignedEmployeeCount}
          value={transferTargetValue}
          onChange={setTransferTargetValue}
        />
      );
    }

    return (
      <p className="body1">
        {translateText(["deleteModal", "noOtherUnitsDescription"], {
          count: assignedEmployeeCount,
          name: businessUnit.name
        })}
      </p>
    );
  };

  return (
    <SmallModal
      isOpen={isOpen}
      onClose={onClose}
      modalHeader={translateText(["deleteModal", "title"])}
      content={renderContent()}
      buttons={{
        buttonLeft: {
          variant: "tertiary",
          onClick: onClose,
          icon: <CloseIcon />,
          iconPosition: "end",
          disabled: isPending,
          children: translateText(["deleteModal", "cancelButton"])
        },
        buttonRight: {
          variant: "error",
          onClick: handleDelete,
          icon: (
            <DeleteButtonIcon
              width="16"
              height="16"
              fill="var(--color-semantic-red-text)"
            />
          ),
          iconPosition: "end",
          disabled: isPending || isBusinessUnitSummaryLoading,
          isLoading: isPending,
          children: translateText(["deleteModal", "deleteButton"])
        }
      }}
    />
  );
};

export default DeleteBusinessUnitModal;
