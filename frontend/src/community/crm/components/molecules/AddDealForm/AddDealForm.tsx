import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import TextArea from "~community/common/components/atoms/TextArea/TextArea";
import InputField from "~community/common/components/molecules/InputField/InputField";
import { IconName } from "~community/common/types/IconTypes";
import { useCrmStore } from "~community/crm/store/store";

interface DealFormData {
  dealName: string;
  description: string;
  status: string;
  value: string;
  priority: string;
  ownedBy: string;
  contactName: string;
  companyName: string;
}

const initialFormData: DealFormData = {
  dealName: "",
  description: "",
  status: "Lead",
  value: "",
  priority: "",
  ownedBy: "",
  contactName: "",
  companyName: ""
};

const statusOptions = [
  { label: "Lead", iconColor: "#3b82f6" },
  { label: "Lead Qualified", iconColor: "#3b82f6" },
  { label: "Proposal Sent", iconColor: "#34d399" },
  { label: "Negotiation", iconColor: "#f59e0b" },
  { label: "Won", iconColor: "#22c55e" },
  { label: "Lost", iconColor: "#ef4444" }
];

const detailFields = [
  { key: "value", label: "Value" },
  { key: "priority", label: "Priority" },
  { key: "ownedBy", label: "Owned by" },
  { key: "contactName", label: "Contact name" },
  { key: "companyName", label: "Company name" }
] as const;

const AddDealForm: React.FC = () => {
  const { setIsAddDealFormOpen } = useCrmStore();
  const [formData, setFormData] = useState<DealFormData>(initialFormData);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setIsAddDealFormOpen(false);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, dealName: e.target.value }));
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, description: e.target.value }));
  };

  const handleDetailChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleStatusSelect = (label: string) => {
    setFormData((prev) => ({ ...prev, status: label }));
    setIsStatusOpen(false);
  };

  const handleAddDeal = () => {
    // TODO: call add deal API
    handleClose();
  };

  const currentStatus = statusOptions.find(
    (opt) => opt.label === formData.status
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setIsStatusOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside as never);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside as never);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-row gap-6 flex-1">
        {/* Left Column */}
        <div className="flex flex-col gap-2.5 w-[637px]">
          <InputField
            inputName="dealName"
            label="Deal name"
            placeHolder="Enter deal name"
            value={formData.dealName}
            onChange={handleInputChange}
            required
          />
          <TextArea
            label="Description"
            name="description"
            placeholder="Add message"
            isRequired={false}
            value={formData.description}
            onChange={handleDescriptionChange}
          />
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-3 w-[296px]">
          {/* Status Dropdown */}
          <div className="relative" ref={statusRef}>
            <button
              type="button"
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className="flex items-center gap-1 px-3 py-3 w-[219px] h-12 bg-zinc-100 rounded-lg cursor-pointer"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: currentStatus?.iconColor ?? "#3b82f6" }}
              />
              <span className="text-sm flex-1 text-left text-zinc-900">
                {formData.status}
              </span>
              <svg
                className={`w-5 h-5 text-zinc-500 transition-transform ${isStatusOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isStatusOpen && (
              <div className="absolute top-full left-0 mt-1 w-[219px] bg-white border border-zinc-200 rounded-lg shadow-md z-[1500]">
                {statusOptions.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => handleStatusSelect(option.label)}
                    className="flex items-center gap-2 w-full px-3 py-2 hover:bg-zinc-50 text-left first:rounded-t-lg last:rounded-b-lg"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: option.iconColor }}
                    />
                    <span className="text-sm text-zinc-900">{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details List */}
          <div className="flex flex-col gap-3 p-3 border border-zinc-200 rounded-lg">
            {detailFields.map((field) => (
              <div
                key={field.key}
                className="flex items-center justify-between w-full h-9"
              >
                <span className="text-sm text-zinc-900">{field.label}</span>
                <input
                  type="text"
                  value={formData[field.key]}
                  placeholder="None"
                  onChange={(e) => handleDetailChange(field.key, e.target.value)}
                  className="w-1/2 text-sm text-right text-zinc-500 border-0 border-b border-transparent hover:border-zinc-200 focus:border-blue-500 focus:outline-none bg-transparent py-1 px-0"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end py-6">
        <ButtonV2
          id="add-deal-btn"
          isFullWidth={false}
          onClick={handleAddDeal}
          style={{ gap: "8px" }}
        >
          Add deal
          <Icon
            name={IconName.ADD_ICON}
            width="1rem"
            height="1rem"
          />
        </ButtonV2>
      </div>
    </div>
  );
};

export default AddDealForm;
