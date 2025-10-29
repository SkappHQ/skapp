import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme
} from "@mui/material";
import { Stack, type SxProps } from "@mui/system";
import { FC, ReactNode } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import IconButton from "~community/common/components/atoms/IconButton/IconButton";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { capitalizeFirstLetter } from "~community/common/utils/commonUtil";

interface Props {
  headings: string[];
  data: any[];
  onEdit?: (index: number) => void;
  onDelete?: (index: number) => void;
  tableStyles?: SxProps;
  tableHeaderStyles?: SxProps;
  tableHeaderCellStyles?: SxProps;
  tableHeaderTextStyles?: SxProps;
  tableRowStyles?: SxProps;
  tableRowCellStyles?: SxProps;
  tableRowTextStyles?: SxProps;
  actionsNeeded?: boolean;
  hoverNeeded?: boolean;
  bottomRowNeeded?: boolean;
  renderCustomCellContent?: <T, K extends keyof T>(obj: T, key: K) => ReactNode;
  excludedColumns?: string[];
  isResponsive?: boolean;
  tableName?: string;
}

const PeopleFormTable: FC<Props> = ({
  headings,
  data,
  onEdit,
  onDelete,
  tableStyles,
  tableHeaderStyles,
  tableHeaderCellStyles,
  tableHeaderTextStyles,
  tableRowStyles,
  tableRowCellStyles,
  tableRowTextStyles,
  actionsNeeded = false,
  hoverNeeded = false,
  bottomRowNeeded = false,
  renderCustomCellContent,
  excludedColumns = [],
  isResponsive = true,
  tableName
}) => {
  const translateText = useTranslator("peopleAria", "peopleFormTable");
  const theme = useTheme();

  const renderCellContent = (content: any) => {
    if (!content) {
      return "-";
    } else {
      return capitalizeFirstLetter(content);
    }
  };

  return (
    <Table
      sx={{
        borderRadius: 2,
        ...(isResponsive && {
          whiteSpace: "nowrap",
          maxWidth: "100%",
          tableLayout: "fixed"
        }),
        ...tableStyles
      }}
    >
      <caption
        style={{
          position: "absolute",
          width: "0.0625rem",
          height: "0.0625rem",
          padding: 0,
          margin: "-0.0625rem",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0
        }}
        tabIndex={0}
      >
        {tableName}
      </caption>
      <TableHead
        sx={{
          height: "3.25rem",
          backgroundColor: theme.palette.grey[100],
          ...tableHeaderStyles
        }}
      >
        <TableRow>
          {headings?.map((heading, index) => (
            <TableCell
              key={index}
              sx={{
                alignItems: "left",
                justifyContent: "center",
                textAlign: "left",
                borderRadius:
                  index === 0
                    ? "0.75rem 0 0 0"
                    : index === headings.length - 1 && !actionsNeeded
                      ? "0 0.75rem 0 0"
                      : "0 0 0 0",
                ...(index === 0 && {
                  width: "5%" // same width as header
                }),
                ...(index === 1 && {
                  width: "15%" //  width for 2nd column
                }),
                ...(index === 2 && {
                  width: "15%" //  width for 3rd column
                }),
                ...(index === 3 && {
                  width: "20%" //  4th column width
                }),
                ...(index === 4 && {
                  width: "14%" //  5th column width
                }),
                ...(index === 5 && {
                  width: "14%" //  6th column width
                }),
                ...(index === 6 && {
                  width: "10%" //  7th column width
                }),
                ...(index === 7 && {
                  width: "8%" //  8th column width
                }),
                ...tableHeaderCellStyles
              }}
            >
              <Typography
                sx={{
                  color: theme.palette.text.secondary,
                  fontWeight: 400,
                  letterSpacing: "0.03em",
                  fontSize: 14,
                  ...(isResponsive && {
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    maxWidth: "100%"
                  }),
                  [theme.breakpoints.down("lg")]: { fontSize: 12 },
                  ...tableHeaderTextStyles
                }}
              >
                {heading?.toUpperCase()}
              </Typography>
            </TableCell>
          ))}
          {actionsNeeded && (
            <TableCell
              sx={{
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "0 0.75rem 0 0",
                ...tableHeaderCellStyles
              }}
            >
              <Typography
                sx={{
                  ...tableHeaderTextStyles
                }}
              ></Typography>
            </TableCell>
          )}
        </TableRow>
      </TableHead>
      <TableBody
        sx={{
          border: "none",
          ...tableRowStyles
        }}
      >
        {data?.map((item, rowIndex) => (
          <TableRow
            key={rowIndex}
            sx={{
              ...(hoverNeeded && {
                "&.MuiTableRow-root:hover": {
                  backgroundColor: theme.palette.grey[100]
                }
              }),
              "&:last-child td, &:last-child th": { border: 0 },
              backgroundColor: theme.palette.grey[50],
              ...tableRowStyles
            }}
          >
            {Object?.keys(item)?.map((key, index) => {
              return (
                !excludedColumns?.includes(key) && (
                  <TableCell
                    key={index}
                    sx={{
                      whiteSpace: "nowrap",
                      borderRadius:
                        index === 0
                          ? "0 0 0 0.75rem"
                          : index === headings.length - 1 && !actionsNeeded
                            ? "0 0 0.75rem 0"
                            : "0 0 0 0",
                      ...tableRowCellStyles
                    }}
                  >
                    {typeof item[key] === "function" ? (
                      item[key]()
                    ) : (
                      <Typography
                        sx={{
                          ...(isResponsive && {
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            maxWidth: "100%"
                          }),
                          ...tableRowTextStyles
                        }}
                      >
                        {renderCustomCellContent
                          ? renderCustomCellContent(item, key)
                          : renderCellContent(item[key])}
                      </Typography>
                    )}
                  </TableCell>
                )
              );
            })}
            {actionsNeeded && (
              <TableCell
                sx={{
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "0 0 0.75rem 0",
                  ...tableHeaderCellStyles
                }}
              >
                <Stack direction="row" justifyContent="center" spacing={1}>
                  <IconButton
                    icon={
                      <Icon
                        name={IconName.PEN_ICON}
                        fill={theme.palette.grey[700]}
                      />
                    }
                    onClick={() => onEdit && onEdit(rowIndex)}
                    ariaLabel={translateText(["actionColumn", "editButton"])}
                  />
                  <IconButton
                    icon={
                      <Icon
                        name={IconName.DELETE_BUTTON_ICON}
                        fill={theme.palette.grey[700]}
                      />
                    }
                    onClick={() => onDelete && onDelete(rowIndex)}
                    ariaLabel={translateText(["actionColumn", "deleteButton"])}
                  />
                </Stack>
              </TableCell>
            )}
          </TableRow>
        ))}
        {bottomRowNeeded && (
          <TableRow>
            <TableCell
              colSpan={headings.length + (actionsNeeded ? 1 : 0)}
              sx={{
                backgroundColor: theme.palette.grey[100],
                borderWidth: 0,
                borderStyle: "solid",
                borderColor: theme.palette.grey[200],
                borderRadius: "0 0 0.75rem 0.75rem",
                padding: "0.5rem"
              }}
            ></TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default PeopleFormTable;
