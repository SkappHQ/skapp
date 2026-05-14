import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Box, Button, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React, { ChangeEvent, MouseEvent, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import TextArea from "~community/common/components/atoms/TextArea/TextArea";
import InputField from "~community/common/components/molecules/InputField/InputField";
import { IconName } from "~community/common/types/IconTypes";
import { useCrmStore } from "~community/crm/store/store";

import styles from "./styles";

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
  value: "None",
  priority: "None",
  ownedBy: "None",
  contactName: "None",
  companyName: "None"
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
  const theme = useTheme();
  const classes = styles(theme);
  const { setIsAddDealFormOpen } = useCrmStore();
  const [formData, setFormData] = useState<DealFormData>(initialFormData);
  const [statusAnchorEl, setStatusAnchorEl] = useState<null | HTMLElement>(null);

  const handleClose = () => {
    setIsAddDealFormOpen(false);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, dealName: e.target.value }));
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, description: e.target.value }));
  };

  const handleStatusClick = (e: MouseEvent<HTMLElement>) => {
    setStatusAnchorEl(e.currentTarget);
  };

  const handleStatusSelect = (label: string) => {
    setFormData((prev) => ({ ...prev, status: label }));
    setStatusAnchorEl(null);
  };

  const handleAddDeal = () => {
    // TODO: call add deal API
    handleClose();
  };

  const currentStatus = statusOptions.find(
    (opt) => opt.label === formData.status
  );

  return (
    <Box sx={classes.wrapper}>
      <Box sx={classes.header}>
        <Typography sx={classes.title}>Add deal</Typography>
        <IconButton onClick={handleClose} sx={classes.closeButton}>
          <Icon
            name={IconName.CLOSE_ICON}
            width="1rem"
            height="1rem"
            fill={theme.palette.text.primary}
          />
        </IconButton>
      </Box>

      <Box sx={classes.content}>
        <Box sx={classes.leftColumn}>
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
            textColor={theme.palette.text.primary}
          />
        </Box>

        <Box sx={classes.rightColumn}>
          <Box sx={classes.statusDropdown} onClick={handleStatusClick}>
            <Box sx={classes.statusDot(currentStatus?.iconColor ?? "#3b82f6")} />
            <Typography sx={classes.statusText}>{formData.status}</Typography>
            <KeyboardArrowDownIcon
              sx={{ fontSize: "1.25rem", color: theme.palette.text.secondary }}
            />
          </Box>
          <Menu
            anchorEl={statusAnchorEl}
            open={Boolean(statusAnchorEl)}
            onClose={() => setStatusAnchorEl(null)}
            sx={classes.statusMenu}
          >
            {statusOptions.map((option) => (
              <MenuItem
                key={option.label}
                onClick={() => handleStatusSelect(option.label)}
                sx={classes.statusMenuItem}
              >
                <Box sx={classes.statusDot(option.iconColor)} />
                <Typography sx={classes.statusMenuText}>
                  {option.label}
                </Typography>
              </MenuItem>
            ))}
          </Menu>

          <Box sx={classes.detailsList}>
            {detailFields.map((field) => (
              <Box key={field.key} sx={classes.detailRow}>
                <Typography sx={classes.detailLabel}>
                  {field.label}
                </Typography>
                <Typography sx={classes.detailValue}>
                  {formData[field.key]}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Box sx={classes.footer}>
        <Button variant="contained" sx={classes.submitButton} onClick={handleAddDeal}>
          Add deal
          <Icon
            name={IconName.ADD_ICON}
            width="1rem"
            height="1rem"
            fill="#fff"
          />
        </Button>
      </Box>
    </Box>
  );
};

export default AddDealForm;
