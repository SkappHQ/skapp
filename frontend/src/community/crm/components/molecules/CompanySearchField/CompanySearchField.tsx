import {
  Box,
  ClickAwayListener,
  InputBase,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { ChangeEvent, KeyboardEvent, useRef, useState } from "react";

import PlusIcon from "~community/common/assets/Icons/PlusIcon";
import SearchIcon from "~community/common/assets/Icons/SearchIcon";
import { mergeSx } from "~community/common/utils/commonUtil";

import styles from "./styles";

interface CompanySearchFieldProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (name: string, id: number | null) => void;
  options: { id: number; name: string }[];
  onAddCompany?: () => void;
  addCompanyLabel?: string;
  noResultsText?: string;
}

const CompanySearchField = ({
  id = "company-search",
  label,
  placeholder,
  value,
  onChange,
  options,
  onAddCompany,
  addCompanyLabel = "+ Add company",
  noResultsText = "No results found"
}: CompanySearchFieldProps) => {
  const theme: Theme = useTheme();
  const classes = styles(theme);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = `${id}-listbox`;

  const filtered = options.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setSearch(v);
    onChange(v, null);
    setOpen(true);
  };

  const handleSelect = (option: { id: number; name: string }) => {
    setSearch(option.name);
    onChange(option.name, option.id);
    setOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSearchIconClick = () => {
    inputRef.current?.focus();
  };

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box sx={classes.wrapper}>
        {label && (
          <Typography component="label" htmlFor={id} sx={classes.label}>
            {label}
          </Typography>
        )}

        <Paper elevation={0} sx={classes.inputPaper}>
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
            aria-label="Search companies"
            sx={mergeSx([classes.searchIconWrapper, { background: "none", border: "none", cursor: "pointer", p: 0 }])}
            onClick={handleSearchIconClick}
          >
            <SearchIcon fill={theme.palette.text.secondary} />
          </Box>
        </Paper>

        {open && (
          <Paper
            elevation={3}
            id={listboxId}
            role="listbox"
            aria-label={label ?? "Company options"}
            sx={mergeSx([classes.dropdownPaper])}
          >
            {filtered.length === 0 ? (
              <Typography role="status" sx={classes.noResultsText}>{noResultsText}</Typography>
            ) : (
              filtered.map((option) => (
                <Box
                  key={option.id}
                  role="option"
                  aria-selected={value === option.name}
                  tabIndex={0}
                  onClick={() => handleSelect(option)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelect(option);
                    }
                  }}
                  sx={classes.optionItem}
                >
                  {option.name}
                </Box>
              ))
            )}

            {onAddCompany && (
              <Stack
                direction="row"
                alignItems="center"
                gap={0.75}
                role="button"
                tabIndex={0}
                onClick={() => {
                  onAddCompany();
                  setOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onAddCompany();
                    setOpen(false);
                  }
                }}
                sx={classes.addCompanyRow}
              >
                  <PlusIcon />
                  {addCompanyLabel}
                </Stack>
            )}
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default CompanySearchField;
