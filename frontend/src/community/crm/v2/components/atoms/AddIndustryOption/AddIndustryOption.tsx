import { PlusIcon } from "@rootcodelabs/skapp-ui";
import { FC, MouseEvent } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useCreateIndustry } from "~community/crm/v2/api/CrmIndustryApi";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmIndustryEntity } from "~community/crm/v2/types/CrmCommonTypes";

interface AddIndustryOptionProps {
  name: string;
  onCreated: (industry: CrmIndustryEntity) => void;
}

const AddIndustryOption: FC<AddIndustryOptionProps> = ({ name, onCreated }) => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("crmModule", "companies", "companyModal");

  const { industries, setIndustries } = useCrmStoreV2(
    useShallow((store) => ({
      industries: store.industries,
      setIndustries: store.setIndustries
    }))
  );

  const handleSuccess = (createdIndustry: CrmIndustryEntity) => {
    setIndustries({ ...industries, [createdIndustry.id]: createdIndustry });
    onCreated(createdIndustry);
  };

  const handleError = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toastMessages", "errorTitle"]),
      description: translateText([
        "toastMessages",
        "addIndustry",
        "errorDescription"
      ])
    });
  };

  const { mutate: createIndustry, isPending } = useCreateIndustry(
    handleSuccess,
    handleError
  );

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    createIndustry(name);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="body3 -mx-4 -my-2 flex h-11 items-center gap-2 rounded-xl bg-primary-background px-3 text-primary-text"
    >
      <PlusIcon />
      {translateText(["labels", "addNewIndustry"], { name })}
    </button>
  );
};

export default AddIndustryOption;
