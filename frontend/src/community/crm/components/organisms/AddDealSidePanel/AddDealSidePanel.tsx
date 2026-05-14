import {
  ButtonV2,
  Dropdown,
  InputField,
  SidePanel,
  TextArea
} from "@rootcodelabs/skapp-ui";
import type { DropdownOption } from "@rootcodelabs/skapp-ui/dist/types/components/molecules/Dropdown/Dropdown";
import { useFormik } from "formik";
import { FC, ReactNode } from "react";
import * as Yup from "yup";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmDealStageEnum } from "~community/crm/enums/common";
import { useCrmStore } from "~community/crm/store/store";

interface AddDealFormValues {
  name: string;
  description: string;
  stageId: string;
}

const STAGE_COLOR: Record<string, string> = {
  [CrmDealStageEnum.INITIAL]: "#3B82F6",
  [CrmDealStageEnum.OPEN]: "#F59E0B",
  [CrmDealStageEnum.WON]: "#10B981",
  [CrmDealStageEnum.LOST]: "#EF4444"
};

const makeStageLabel = (text: string, color: string): ReactNode => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: color,
        display: "inline-block",
        flexShrink: 0
      }}
    />
    {text}
  </span>
);

const STAGE_OPTIONS: DropdownOption[] = [
  {
    id: CrmDealStageEnum.INITIAL,
    label: makeStageLabel("Lead", STAGE_COLOR[CrmDealStageEnum.INITIAL]),
    value: CrmDealStageEnum.INITIAL
  },
  {
    id: CrmDealStageEnum.OPEN,
    label: makeStageLabel("Open", STAGE_COLOR[CrmDealStageEnum.OPEN]),
    value: CrmDealStageEnum.OPEN
  },
  {
    id: CrmDealStageEnum.WON,
    label: makeStageLabel("Won", STAGE_COLOR[CrmDealStageEnum.WON]),
    value: CrmDealStageEnum.WON
  },
  {
    id: CrmDealStageEnum.LOST,
    label: makeStageLabel("Lost", STAGE_COLOR[CrmDealStageEnum.LOST]),
    value: CrmDealStageEnum.LOST
  }
];

const AddDealSidePanel: FC = () => {
  const translateText = useTranslator("crmModule", "deals", "addDealSidePanel");

  const { isAddDealSidePanelOpen, setIsAddDealSidePanelOpen } = useCrmStore(
    (state) => ({
      isAddDealSidePanelOpen: state.isAddDealSidePanelOpen,
      setIsAddDealSidePanelOpen: state.setIsAddDealSidePanelOpen
    })
  );

  const validationSchema = Yup.object({
    name: Yup.string().trim().required(translateText(["dealNameRequired"]))
  });

  const formik = useFormik<AddDealFormValues>({
    initialValues: {
      name: "",
      description: "",
      stageId: CrmDealStageEnum.INITIAL
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      // TODO: wire up to API when available
      console.log("Add deal submitted:", values);
      resetForm();
      setIsAddDealSidePanelOpen(false);
    }
  });

  const handleClose = () => {
    formik.resetForm();
    setIsAddDealSidePanelOpen(false);
  };

  const metaRows: Array<{ label: string }> = [
    { label: translateText(["valueLabel"]) },
    { label: translateText(["priorityLabel"]) },
    { label: translateText(["ownedByLabel"]) },
    { label: translateText(["contactNameLabel"]) },
    { label: translateText(["companyNameLabel"]) }
  ];

  return (
    <SidePanel
      isOpen={isAddDealSidePanelOpen}
      onClose={handleClose}
      header={<span>{translateText(["title"])}</span>}
      width="lg"
      animation="slide"
      closeOnBackdropClick
      closeAriaLabel="Close add deal panel"
      footer={
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "12px 24px"
          }}
        >
          <ButtonV2
            variant="primary"
            size="md"
            onClick={() => formik.handleSubmit()}
            disabled={formik.isSubmitting}
          >
            {translateText(["addDealBtn"])}
          </ButtonV2>
        </div>
      }
    >
      {/* Two-column body */}
      <div
        style={{
          display: "flex",
          gap: "24px",
          alignItems: "flex-start",
          padding: "8px 0"
        }}
      >
        {/* Left column: deal name + description */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}
        >
          <InputField
            label={translateText(["dealNameLabel"])}
            placeholder={translateText(["dealNamePlaceholder"])}
            required
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            state={
              formik.touched.name && formik.errors.name ? "error" : "default"
            }
            errorMessage={
              formik.touched.name && formik.errors.name
                ? formik.errors.name
                : undefined
            }
            fullWidth
          />
          <TextArea
            label={translateText(["descriptionLabel"])}
            placeholder={translateText(["descriptionPlaceholder"])}
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            rows={6}
          />
        </div>

        {/* Right column: stage dropdown + meta rows */}
        <div style={{ width: "240px", flexShrink: 0 }}>
          <Dropdown
            options={STAGE_OPTIONS}
            value={formik.values.stageId}
            onChange={(value) => formik.setFieldValue("stageId", value)}
            width="100%"
          />
          <div style={{ marginTop: "8px" }}>
            {metaRows.map(({ label }, index) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom:
                    index < metaRows.length - 1
                      ? "1px solid #E5E7EB"
                      : "none",
                  fontSize: "14px"
                }}
              >
                <span style={{ color: "#374151", fontWeight: 500 }}>
                  {label}
                </span>
                <span style={{ color: "#9CA3AF" }}>
                  {translateText(["noneText"])}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SidePanel>
  );
};

export default AddDealSidePanel;
