import {
  ButtonV2,
  Dropdown,
  InputField,
  SidePanel,
  TextArea
} from "@rootcodelabs/skapp-ui";
import type { DropdownOption } from "@rootcodelabs/skapp-ui/dist/types/components/molecules/Dropdown/Dropdown";
import { useFormik } from "formik";
import {
  ChangeEvent,
  FC,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import * as Yup from "yup";

import { useAuth } from "~community/auth/providers/AuthProvider";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  AdminTypes,
  ManagerTypes as AuthManagerTypes,
  RepresentativeTypes
} from "~community/common/types/AuthTypes";
import { useGetSearchedEmployees } from "~community/people/api/PeopleApi";
import {
  useCreateDeal,
  useGetCrmCompanies,
  useGetCrmContacts,
  useGetDealStages,
  useGetPriorities
} from "~community/crm/api/crmDealApi";
import { CrmDealStageEnum } from "~community/crm/enums/common";
import { useAppStore } from "../../../../../store/store";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AddDealFormValues {
  name: string;
  description: string;
  stageId: string;
  contactId: string;
  ownerId: string;
  ownerName: string;
  priorityId: string;
  amount: string;
  companyId: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STAGE_FALLBACK_COLOR: Record<string, string> = {
  [CrmDealStageEnum.INITIAL]: "#3B82F6",
  [CrmDealStageEnum.OPEN]: "#F59E0B",
  [CrmDealStageEnum.WON]: "#10B981",
  [CrmDealStageEnum.LOST]: "#EF4444"
};

const NONE_COLOR = "#9CA3AF";
const ROW_DIVIDER = "1px solid #E5E7EB";

// ---------------------------------------------------------------------------
// PropertyRow — shared row shell
// ---------------------------------------------------------------------------

const PropertyRow: FC<{ label: string; children: ReactNode }> = ({
  label,
  children
}) => (
  <div className="self-stretch flex justify-start items-center min-h-[36px]">
    <div className="w-28 flex justify-start items-center shrink-0">
      <span className="subtitle3 text-black">{label}</span>
    </div>
    <div className="flex-1 pl-3 min-h-[36px] flex items-center">
      {children}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// ClickEditField — click-to-edit text / number input (Value, Owned by)
// ---------------------------------------------------------------------------

interface ClickEditFieldProps {
  value: string;
  placeholder: string;
  displayValue?: string;
  inputType?: "text" | "number";
  onChange: (v: string) => void;
  errorMessage?: string;
}

const ClickEditField: FC<ClickEditFieldProps> = ({
  value,
  placeholder,
  displayValue,
  inputType = "text",
  onChange,
  errorMessage
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync external value changes into draft
  useEffect(() => {
    setDraft(value);
  }, [value]);

  // Click-outside saves
  useEffect(() => {
    if (!isEditing) return;
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsEditing(false);
        onChange(draft);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isEditing, draft, onChange]);

  const commit = () => {
    setIsEditing(false);
    onChange(draft);
  };

  const shown = displayValue ?? value;

  return (
    <div ref={wrapperRef} className="flex-1">
      {isEditing ? (
        <InputField
          name="inline-edit"
          value={draft}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setDraft(e.target.value)
          }
          onBlur={commit}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(value);
              setIsEditing(false);
            }
          }}
          placeholder={placeholder}
          variant="sm"
          autoFocus
          fullWidth
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="px-3 py-1 body2 rounded-lg hover:bg-gray-50 cursor-pointer text-left w-full"
          style={{ color: shown ? "#374151" : NONE_COLOR }}
        >
          {shown || "None"}
        </button>
      )}
      {errorMessage && (
        <span
          style={{ color: "#DC2626", fontSize: "12px", display: "block" }}
        >
          {errorMessage}
        </span>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// DropdownField — click-to-reveal Dropdown (Priority, Contact, Company)
// ---------------------------------------------------------------------------

interface DropdownFieldProps {
  value: string;
  options: DropdownOption[];
  placeholder: string;
  onChange: (v: string) => void;
  errorMessage?: string;
}

const DropdownField: FC<DropdownFieldProps> = ({
  value,
  options,
  placeholder,
  onChange,
  errorMessage
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-open the dropdown trigger after rendering
  useEffect(() => {
    if (isEditing && containerRef.current) {
      const btn = containerRef.current.querySelector("button");
      if (btn) setTimeout(() => btn.click(), 0);
    }
  }, [isEditing]);

  const displayLabel = useMemo(() => {
    if (!value) return null;
    const found = options.find((o) => o.value === value);
    if (!found) return null;
    const lbl = found.label;
    return typeof lbl === "string" ? lbl : String(value);
  }, [value, options]);

  return (
    <div className="flex-1">
      {isEditing ? (
        <div ref={containerRef}>
          <Dropdown
            options={options}
            value={value}
            onChange={(v) => {
              onChange(v);
              setIsEditing(false);
            }}
            width="100%"
            placeholder={placeholder}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="px-3 py-1 body2 rounded-lg hover:bg-gray-50 cursor-pointer text-left w-full"
          style={{ color: displayLabel ? "#374151" : NONE_COLOR }}
        >
          {displayLabel || "None"}
        </button>
      )}
      {errorMessage && (
        <span
          style={{ color: "#DC2626", fontSize: "12px", display: "block" }}
        >
          {errorMessage}
        </span>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// OwnerField — searchable people picker filtered to CRM roles
// ---------------------------------------------------------------------------

interface OwnerFieldProps {
  ownerId: string;
  ownerName: string;
  onChange: (id: string, name: string) => void;
  errorMessage?: string;
}

const OwnerField: FC<OwnerFieldProps> = ({
  ownerId: _ownerId,
  ownerName,
  onChange,
  errorMessage
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data: adminResults = [] } = useGetSearchedEmployees(
    search,
    AdminTypes.CRM_ADMIN
  );
  const { data: managerResults = [] } = useGetSearchedEmployees(
    search,
    AuthManagerTypes.CRM_SALES_MANAGER
  );
  const { data: repResults = [] } = useGetSearchedEmployees(
    search,
    RepresentativeTypes.CRM_SALES_REPRESENTATIVE
  );

  const crmUsers = useMemo(() => {
    const combined = [...adminResults, ...managerResults, ...repResults];
    const seen = new Set<number>();
    return combined.filter((emp) => {
      if (seen.has(emp.employeeId)) return false;
      seen.add(emp.employeeId);
      return true;
    });
  }, [adminResults, managerResults, repResults]);

  // Close on outside click
  useEffect(() => {
    if (!isEditing) return;
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsEditing(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isEditing]);

  return (
    <div ref={wrapperRef} className="flex-1 relative">
      {isEditing ? (
        <div>
          <InputField
            name="owner-search"
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
            placeholder="Search members..."
            variant="sm"
            autoFocus
            fullWidth
          />
          {crmUsers.length > 0 && (
            <div
              className="absolute z-50 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg overflow-y-auto mt-1"
              style={{ top: "100%", maxHeight: "160px" }}
            >
              {crmUsers.map((emp) => (
                <button
                  key={emp.employeeId}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 body2"
                  onClick={() => {
                    onChange(
                      String(emp.employeeId),
                      `${emp.firstName} ${emp.lastName}`.trim()
                    );
                    setIsEditing(false);
                    setSearch("");
                  }}
                >
                  {emp.firstName} {emp.lastName}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="px-3 py-1 body2 rounded-lg hover:bg-gray-50 cursor-pointer text-left w-full"
          style={{ color: ownerName ? "#374151" : NONE_COLOR }}
        >
          {ownerName || "None"}
        </button>
      )}
      {errorMessage && (
        <span style={{ color: "#DC2626", fontSize: "12px", display: "block" }}>
          {errorMessage}
        </span>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// AddDealSidePanel
// ---------------------------------------------------------------------------

const AddDealSidePanel: FC = () => {
  const translateText = useTranslator("crmModule", "deals", "addDealSidePanel");
  const { user } = useAuth();

  const { isSidePanelOpen, closeSidePanel } = useAppStore((state) => ({
    isSidePanelOpen: state.isSidePanelOpen,
    closeSidePanel: state.closeSidePanel
  }));

  const { data: stages = [] } = useGetDealStages();
  const { data: priorities = [] } = useGetPriorities();
  const { data: contacts = [] } = useGetCrmContacts();
  const { data: companies = [] } = useGetCrmCompanies();

  const stageOptions = useMemo<DropdownOption[]>(
    () =>
      stages.map((s) => ({
        id: String(s.id),
        value: s.name,
        label: (
          <div className="inline-flex items-center gap-2.5">
            <div
              className="size-2 rounded-full shrink-0"
              style={{
                backgroundColor:
                  s.color || STAGE_FALLBACK_COLOR[s.stageType] || "#6B7280"
              }}
            />
            <span className="body2">{s.name}</span>
          </div>
        )
      })),
    [stages]
  );

  const priorityOptions = useMemo<DropdownOption[]>(
    () =>
      priorities.map((p) => ({
        id: String(p.id),
        label: p.name,
        value: String(p.id)
      })),
    [priorities]
  );

  const contactOptions = useMemo<DropdownOption[]>(
    () =>
      contacts.map((c) => ({
        id: String(c.id),
        label: c.name,
        value: String(c.id)
      })),
    [contacts]
  );

  const companyOptions = useMemo<DropdownOption[]>(
    () =>
      companies.map((co) => ({
        id: String(co.id),
        label: co.name,
        value: String(co.id)
      })),
    [companies]
  );

  const validationSchema = Yup.object({
    name: Yup.string().trim().required(translateText(["dealNameRequired"])),
    stageId: Yup.string().required(translateText(["stageRequired"])),
    contactId: Yup.string().required(translateText(["contactRequired"])),
    ownerId: Yup.string().required(translateText(["ownerRequired"]))
  });

  const { mutate: createDeal } = useCreateDeal(
    () => {
      formik.resetForm();
      closeSidePanel();
    },
    () => {}
  );

  const formik = useFormik<AddDealFormValues>({
    initialValues: {
      name: "",
      description: "",
      stageId: "",
      contactId: "",
      ownerId: "",
      ownerName: "",
      priorityId: "",
      amount: "",
      companyId: ""
    },
    validationSchema,
    onSubmit: (values) => {
      createDeal({
        name: values.name.trim(),
        stageId: Number(
          stages.find((s) => s.name === values.stageId)?.id ??
            values.stageId
        ),
        contactId: Number(values.contactId),
        ownerId: Number(values.ownerId),
        ...(values.priorityId && { priorityId: Number(values.priorityId) }),
        ...(values.amount && { amount: values.amount }),
        ...(values.companyId && { companyId: Number(values.companyId) })
      });
    }
  });

  const handleClose = () => {
    formik.resetForm();
    closeSidePanel();
  };

  // Auto-select current user as owner when panel opens (or when user data arrives)
  useEffect(() => {
    if (
      isSidePanelOpen &&
      !formik.values.ownerId &&
      user?.employee?.employeeId
    ) {
      const name =
        `${user.employee.firstName} ${user.employee.lastName ?? ""}`.trim();
      formik.setFieldValue("ownerId", String(user.employee.employeeId));
      formik.setFieldValue("ownerName", name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSidePanelOpen, user?.employee?.employeeId]);

  return (
    <SidePanel
      isOpen={isSidePanelOpen}
      onClose={handleClose}
      header={<span>{translateText(["title"])}</span>}
      width="lg"
      animation="slide"
      closeOnBackdropClick
      closeAriaLabel="Close add deal panel"
      footer={
        <div className="flex justify-end px-6 py-3">
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
      <div className="flex gap-6 items-start py-2 h-full">
        {/* ── Left column ── */}
        <div className="flex-1 flex flex-col gap-4">
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

        {/* ── Right column ── */}
        <div className="w-[220px] shrink-0 flex flex-col gap-3">
          {/* Stage — always-visible jsx-content Dropdown */}
          <Dropdown
            options={stageOptions}
            value={formik.values.stageId}
            onChange={(v) => formik.setFieldValue("stageId", v)}
            variant="jsx-content"
            padding="px-4 py-3 mt-2"
            className="rounded-lg"
            width="100%"
            placeholder={translateText(["stageLabel"])}
          />
          {formik.touched.stageId && formik.errors.stageId && (
            <span style={{ color: "#DC2626", fontSize: "12px" }}>
              {formik.errors.stageId}
            </span>
          )}

          {/* Property rows */}
          <div
            className="flex flex-col"
            style={{ borderTop: ROW_DIVIDER }}
          >
            {/* Value */}
            <div style={{ borderBottom: ROW_DIVIDER }}>
              <PropertyRow label={translateText(["valueLabel"])}>
                <ClickEditField
                  value={formik.values.amount}
                  placeholder={translateText(["amountPlaceholder"])}
                  onChange={(v) => formik.setFieldValue("amount", v)}
                />
              </PropertyRow>
            </div>

            {/* Priority */}
            <div style={{ borderBottom: ROW_DIVIDER }}>
              <PropertyRow label={translateText(["priorityLabel"])}>
                <DropdownField
                  value={formik.values.priorityId}
                  options={priorityOptions}
                  placeholder={translateText(["noneText"])}
                  onChange={(v) => formik.setFieldValue("priorityId", v)}
                />
              </PropertyRow>
            </div>

            {/* Owned by */}
            <div style={{ borderBottom: ROW_DIVIDER }}>
              <PropertyRow label={translateText(["ownedByLabel"])}>
                <OwnerField
                  ownerId={formik.values.ownerId}
                  ownerName={formik.values.ownerName}
                  onChange={(id, name) => {
                    formik.setFieldValue("ownerId", id);
                    formik.setFieldValue("ownerName", name);
                  }}
                  errorMessage={
                    formik.touched.ownerId && formik.errors.ownerId
                      ? formik.errors.ownerId
                      : undefined
                  }
                />
              </PropertyRow>
            </div>

            {/* Contact name */}
            <div style={{ borderBottom: ROW_DIVIDER }}>
              <PropertyRow label={translateText(["contactNameLabel"])}>
                <DropdownField
                  value={formik.values.contactId}
                  options={contactOptions}
                  placeholder={translateText(["noneText"])}
                  onChange={(v) => formik.setFieldValue("contactId", v)}
                  errorMessage={
                    formik.touched.contactId && formik.errors.contactId
                      ? formik.errors.contactId
                      : undefined
                  }
                />
              </PropertyRow>
            </div>

            {/* Company name */}
            <div>
              <PropertyRow label={translateText(["companyNameLabel"])}>
                <DropdownField
                  value={formik.values.companyId}
                  options={companyOptions}
                  placeholder={translateText(["noneText"])}
                  onChange={(v) => formik.setFieldValue("companyId", v)}
                />
              </PropertyRow>
            </div>
          </div>
        </div>
      </div>
    </SidePanel>
  );
};

export default AddDealSidePanel;