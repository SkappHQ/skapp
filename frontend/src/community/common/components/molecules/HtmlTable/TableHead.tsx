import { Theme, useTheme } from "@mui/material";
import { FC } from "react";

import { HolidayDurationType } from "~community/people/types/HolidayTypes";

import HtmlChip from "../../atoms/Chips/HtmlChip/HtmlChip";
import { CommonTableProps } from "./Table";
import TableHeadCell from "./TableHeadCell";

const TableHead: FC<CommonTableProps> = ({ headers, rows }) => {
  const theme: Theme = useTheme();

  const getBorderClassName = (duration?: HolidayDurationType): string => {
    if (!duration) return "";

    switch (duration) {
      case HolidayDurationType.HALFDAY_MORNING:
        return "half-day-morning-border";
      case HolidayDurationType.HALFDAY_EVENING:
        return "half-day-evening-border";
      case HolidayDurationType.FULLDAY:
        return "full-day-border";
      default:
        return "";
    }
  };

  return (
    <thead
      style={{
        backgroundColor: theme.palette.grey[100]
      }}
    >
      <tr>
        {headers.map((header) => {
          return (
            <TableHeadCell
              key={header.id}
              scope="col"
              className={header.sticky ? "sticky-col" : ""}
              aria-label={header.ariaLabel}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  alignItems: "center"
                }}
              >
                {header.label}
                {header?.subtitle?.text ? (
                  <HtmlChip
                    className={getBorderClassName(header?.subtitle?.duration)}
                    emoji={header?.subtitle?.emoji || ""}
                    text={header?.subtitle?.text}
                  />
                ) : null}
              </div>
            </TableHeadCell>
          );
        })}
      </tr>
    </thead>
  );
};

export default TableHead;
