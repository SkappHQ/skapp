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
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  onAddCompany?: () => void;
  addCompanyLabel?: string;
  noResultsText?: string;
}

const CompanySearchField = ({
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

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setSearch(v);
    onChange(v);
    setOpen(true);
  };

  const handleSelect = (option: string) => {
    setSearch(option);
    onChange(option);
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
          <Typography component="label" sx={classes.label}>
            {label}
          </Typography>
        )}

        <Paper elevation={0} sx={classes.inputPaper}>
          <InputBase
            inputRef={inputRef}
            value={search}
            onChange={handleInputChange}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            sx={classes.inputBase}
          />
          <Box sx={classes.searchIconWrapper} onClick={handleSearchIconClick}>
            <SearchIcon fill={theme.palette.text.secondary} />
          </Box>
        </Paper>

        {open && (
          <Paper elevation={3} sx={mergeSx([classes.dropdownPaper])}>
            {filtered.length === 0 ? (
              <Typography sx={classes.noResultsText}>{noResultsText}</Typography>
            ) : (
              filtered.map((option) => (
                <Box
                  key={option}
                  onClick={() => handleSelect(option)}
                  sx={classes.optionItem}
                >
                  {option}
                </Box>
              ))
            )}

            {onAddCompany && (
              <Stack
                direction="row"
                alignItems="center"
                gap={0.75}
                onClick={() => {
                  onAddCompany();
                  setOpen(false);
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
