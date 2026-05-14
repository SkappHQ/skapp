import {
  Box,
  ClickAwayListener,
  IconButton,
  InputBase,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { ChangeEvent, KeyboardEvent, useRef, useState } from "react";

import CloseIcon from "~community/common/assets/Icons/CloseIcon";
import SearchIcon from "~community/common/assets/Icons/SearchIcon";
import Avatar from "~community/common/components/molecules/Avatar/Avatar";
import { ContactOwner } from "~community/crm/types/CommonTypes";

import styles from "./styles";

interface OwnerSearchFieldProps {
  id?: string;
  label?: string;
  placeholder?: string;
  selectedOwner: ContactOwner | null;
  onSelect: (owner: ContactOwner) => void;
  onClear: () => void;
  options: ContactOwner[];
  noResultsText?: string;
}

const getFullName = (owner: ContactOwner) =>
  [owner.firstName, owner.lastName].filter(Boolean).join(" ");

const OwnerSearchField = ({
  id = "owner-search",
  label,
  placeholder,
  selectedOwner,
  onSelect,
  onClear,
  options,
  noResultsText = "No results found"
}: OwnerSearchFieldProps) => {
  const theme: Theme = useTheme();
  const classes = styles(theme);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = `${id}-listbox`;

  const filtered = options.filter((o) =>
    getFullName(o).toLowerCase().includes(search.toLowerCase())
  );

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setOpen(true);
  };

  const handleSelect = (owner: ContactOwner) => {
    onSelect(owner);
    setSearch("");
    setOpen(false);
  };

  /* Reset search text + close dropdown so input is clean after removing owner */
  const handleClear = () => {
    setSearch("");
    setOpen(false);
    onClear();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box sx={classes.wrapper}>
        {label && (
          <Typography component="label" htmlFor={!selectedOwner ? id : undefined} sx={classes.label}>
            {label}
          </Typography>
        )}

        <Paper elevation={0} sx={classes.fieldPaper}>
          {selectedOwner ? (
            /* Selected: custom chip row — full control over avatar, name, X button */
            <Stack
              direction="row"
              alignItems="center"
              gap={0.75}
              role="group"
              aria-label={`Selected owner: ${getFullName(selectedOwner)}`}
              sx={classes.selectedChip}
            >
              <Avatar
                firstName={selectedOwner.firstName}
                lastName={selectedOwner.lastName ?? ""}
                src={selectedOwner.authPic ?? ""}
                avatarStyles={classes.selectedChipAvatar}
              />
              <Typography sx={classes.selectedChipLabel}>
                {getFullName(selectedOwner)}
              </Typography>
              <IconButton
                size="small"
                onClick={handleClear}
                aria-label="Remove owner"
                sx={classes.selectedChipRemove}
              >
                <CloseIcon
                  fill={theme.palette.grey[600]}
                  width="16"
                  height="16"
                />
              </IconButton>
            </Stack>
          ) : (
            /* Empty: search input */
            <>
              <InputBase
                id={id}
                inputRef={inputRef}
                value={search}
                onChange={handleInputChange}
                onFocus={() => setOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                sx={classes.inputBase}
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={open ? listboxId : undefined}
                aria-autocomplete="list"
              />
              <Box
                component="button"
                type="button"
                aria-label="Search owners"
                sx={{ background: "none", border: "none", cursor: "pointer", p: 0, display: "flex", alignItems: "center" }}
                onClick={() => inputRef.current?.focus()}
              >
                <SearchIcon fill={theme.palette.text.secondary} />
              </Box>
            </>
          )}
        </Paper>

        {open && !selectedOwner && (
          <Paper
            elevation={3}
            id={listboxId}
            role="listbox"
            aria-label={label ?? "Owner options"}
            sx={classes.dropdownPaper}
          >
            {filtered.length === 0 ? (
              <Typography role="status" sx={classes.noResultsText}>
                {noResultsText}
              </Typography>
            ) : (
              filtered.map((owner) => (
                <Stack
                  key={owner.employeeId}
                  direction="row"
                  alignItems="center"
                  gap={1.25}
                  role="option"
                  aria-selected={false}
                  tabIndex={0}
                  onClick={() => handleSelect(owner)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelect(owner);
                    }
                  }}
                  sx={classes.ownerRow}
                >
                  <Avatar
                    firstName={owner.firstName}
                    lastName={owner.lastName ?? ""}
                    src={owner.authPic ?? ""}
                    avatarStyles={{ width: "2rem", height: "2rem" }}
                  />
                  <Typography sx={classes.ownerName}>
                    {getFullName(owner)}
                  </Typography>
                </Stack>
              ))
            )}
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default OwnerSearchField;
