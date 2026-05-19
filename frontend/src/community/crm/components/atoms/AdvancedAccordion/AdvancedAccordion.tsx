/**
 * AdvancedAccordion — local copy of the skapp-ui AdvancedAccordion (card variant
 * not yet merged to the skapp-ui develop branch).
 *
 * TODO: Once the card variant lands in @rootcodelabs/skapp-ui, replace this file
 *       with the package import and delete this atom.
 */
import {
  Card,
  ChevronDownIcon,
  DropdownArrowIcon,
  InputField,
  SearchIcon,
  StatusComponent
} from "@rootcodelabs/skapp-ui";
import type { StatusComponentProps } from "@rootcodelabs/skapp-ui";
import React, { useEffect, useId, useState } from "react";

import { getTextContent } from "~community/crm/utils/accordionUtils";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AdvancedAccordionContentItem {
  id: string;
  filterId: string;
  label: React.ReactNode;
  value: string;
  isSelected?: boolean;
  disabled?: boolean;
  onClick?: (item: AdvancedAccordionContentItem) => void;
}

export interface AdvancedAccordionItem {
  id: string;
  header: React.ReactNode;
  content?: React.ReactNode;
  contentItems?: AdvancedAccordionContentItem[];
  disabled?: boolean;
  badge?: React.ReactNode;
  contentSearchPlaceholder?: string;
  /** Text to show when no content items are found after search */
  noContentItemsFoundText?: string;
  /** Text to show when no content items are available */
  noContentItemsAvailableText?: string;
  /** Whether to show the content search input */
  contentSearchable?: boolean;
  /** Number of content items to show by default when not searching */
  defaultVisibleCount?: number;
  /** Subtitle displayed below the header */
  subtitle?: React.ReactNode;
  /** Status badge displayed next to the expand icon */
  statusBadge?: StatusComponentProps;
  /** Custom expand icon for this item (overrides the accordion-level expandIcon) */
  expandIcon?: React.ReactNode;
}

export interface AdvancedAccordionProps {
  /** Array of accordion items */
  items: AdvancedAccordionItem[];
  /** Whether multiple panels can be open at once */
  allowMultiple?: boolean;
  /** Initially expanded panel IDs */
  defaultExpandedIds?: string[];
  /** Controlled expanded panel IDs */
  expandedIds?: string[];
  /** Callback when expansion state changes */
  onExpandedChange?: (expandedIds: string[]) => void;
  /** Custom class name for the accordion container */
  className?: string;
  /** Custom class name for individual accordion items */
  itemClassName?: string;
  /** Custom expand icon */
  expandIcon?: React.ReactNode;
  /** Accessibility label for the accordion */
  ariaLabel?: string;
  /** Enable search / filter on item headers */
  searchable?: boolean;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Search value for controlled search */
  searchValue?: string;
  /** Search change callback */
  onSearchChange?: (value: string) => void;
  /** Text to show when no items are found after search */
  noItemsFoundText?: string;
  /** Text to show when no items are available */
  noItemsAvailableText?: string;
  searchAriaLabelFound?: string;
  searchAriaLabelAvailable?: string;
  /** "default" = bordered list style, "card" = Card-based style */
  variant?: "default" | "card";
}

// ─── Component ───────────────────────────────────────────────────────────────

const AdvancedAccordion: React.FC<AdvancedAccordionProps> = ({
  items,
  allowMultiple = false,
  defaultExpandedIds = [],
  expandedIds,
  onExpandedChange,
  className = "",
  itemClassName = "",
  expandIcon,
  ariaLabel,
  searchable = false,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  noItemsFoundText,
  noItemsAvailableText,
  searchAriaLabelFound,
  searchAriaLabelAvailable,
  variant = "default"
}) => {
  const [internalExpandedIds, setInternalExpandedIds] =
    useState<string[]>(defaultExpandedIds);
  const [internalSearchValue, setInternalSearchValue] = useState("");
  const [contentSearchValues, setContentSearchValues] = useState<
    Record<string, string>
  >({});
  const accordionId = useId();

  const currentExpandedIds =
    expandedIds !== undefined ? expandedIds : internalExpandedIds;
  const currentSearchValue =
    searchValue !== undefined ? searchValue : internalSearchValue;

  // ── filtering ────────────────────────────────────────────────────────────

  const filteredItems = (() => {
    if (!searchable || !currentSearchValue.trim()) return items;
    const searchTerm = currentSearchValue.toLowerCase().trim();
    return items.filter((item) => {
      if (getTextContent(item.header).toLowerCase().includes(searchTerm))
        return true;
      if (getTextContent(item.content).toLowerCase().includes(searchTerm))
        return true;
      return item.contentItems?.some((ci) =>
        getTextContent(ci.label).toLowerCase().includes(searchTerm)
      );
    });
  })();

  // ── handlers ─────────────────────────────────────────────────────────────

  const handleToggle = (itemId: string) => {
    const isExpanded = currentExpandedIds.includes(itemId);
    const newIds = allowMultiple
      ? isExpanded
        ? currentExpandedIds.filter((id) => id !== itemId)
        : [...currentExpandedIds, itemId]
      : isExpanded
        ? []
        : [itemId];
    if (expandedIds === undefined) setInternalExpandedIds(newIds);
    onExpandedChange?.(newIds);
  };

  const handleKeyDown = (e: React.KeyboardEvent, itemId: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle(itemId);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const idx = filteredItems.findIndex((i) => i.id === itemId);
      const next =
        e.key === "ArrowDown"
          ? Math.min(idx + 1, filteredItems.length - 1)
          : Math.max(idx - 1, 0);
      document
        .getElementById(`${accordionId}-button-${filteredItems[next]?.id}`)
        ?.focus();
    }
  };

  const handleSearchChange = (value: string) => {
    if (searchValue === undefined) setInternalSearchValue(value);
    onSearchChange?.(value);
  };

  const handleContentSearchChange = (itemId: string, value: string) => {
    setContentSearchValues((prev) => ({ ...prev, [itemId]: value }));
  };

  const getFilteredContentItems = (item: AdvancedAccordionItem) => {
    if (!item.contentItems) return [];
    const sv = contentSearchValues[item.id]?.toLowerCase().trim() ?? "";
    if (!sv) {
      return item.defaultVisibleCount && item.defaultVisibleCount > 0
        ? item.contentItems.slice(0, item.defaultVisibleCount)
        : item.contentItems;
    }
    return item.contentItems.filter((ci) =>
      getTextContent(ci.label).toLowerCase().includes(sv)
    );
  };

  useEffect(() => {
    // Placeholder for future live-region announcements
  }, [currentExpandedIds, filteredItems.length]);

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <div
      className={`accordion-container ${className}`}
      role="region"
      aria-label={ariaLabel}
    >
      {searchable && (
        <div className="accordion-search-container mb-2">
          <InputField
            value={currentSearchValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleSearchChange(e.target.value)
            }
            placeholder={searchPlaceholder}
            rightIcon={<SearchIcon />}
            aria-label={
              filteredItems.length > 0 && currentSearchValue
                ? searchAriaLabelFound
                : searchAriaLabelAvailable
            }
          />
        </div>
      )}

      <div className="accordion-items flex flex-col gap-4">
        {filteredItems.length === 0 ? (
          <div
            className="py-8 text-center text-secondary-text"
            role="status"
            aria-live="polite"
          >
            {searchable && currentSearchValue
              ? noItemsFoundText
              : noItemsAvailableText}
          </div>
        ) : (
          filteredItems.map((item) => {
            const isExpanded = currentExpandedIds.includes(item.id);
            const buttonId = `${accordionId}-button-${item.id}`;
            const contentId = `${accordionId}-content-${item.id}`;
            const isCard = variant === "card";

            const resolvedExpandIcon =
              item.expandIcon !== undefined
                ? item.expandIcon
                : (expandIcon ?? null);

            const expandIconNode =
              resolvedExpandIcon ??
              (isCard ? (
                <ChevronDownIcon
                  aria-hidden="true"
                  className={`h-4 w-4 transform text-gray-500 transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`}
                />
              ) : (
                <DropdownArrowIcon
                  className={`size-3 shrink-0 transform transition-transform duration-200 ease-in-out ${isExpanded ? "rotate-180" : "rotate-0"}`}
                />
              ));

            const expandedContentBlock = (
              <div
                id={contentId}
                role="region"
                aria-labelledby={buttonId}
                aria-hidden={!isExpanded}
                className={`overflow-hidden ${
                  isCard
                    ? isExpanded
                      ? "px-3 pt-1 pb-2"
                      : "hidden"
                    : `accordion-content border-secondary-accent border-r border-l transition-all duration-300 ease-in-out ${isExpanded ? "max-h-500 opacity-100" : "max-h-0 opacity-0"} rounded-b-lg border-b`
                }`}
              >
                <div
                  className={`${isCard ? "" : "bg-white"} ${isExpanded ? "block" : "hidden"}`}
                >
                  {item.contentItems ? (
                    <div className="flex flex-col">
                      {item.contentSearchable !== false && (
                        <div className="border-secondary-accent p-2">
                          <InputField
                            value={contentSearchValues[item.id] ?? ""}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) =>
                              handleContentSearchChange(item.id, e.target.value)
                            }
                            placeholder={item.contentSearchPlaceholder}
                            rightIcon={<SearchIcon />}
                            aria-label={`Search ${typeof item.header === "string" ? item.header : ""} items`}
                          />
                        </div>
                      )}
                      <div>
                        {getFilteredContentItems(item).length === 0 ? (
                          <div className="p-4 text-center text-sm text-secondary-text">
                            {contentSearchValues[item.id]
                              ? item.noContentItemsFoundText
                              : item.noContentItemsAvailableText}
                          </div>
                        ) : (
                          getFilteredContentItems(item).map((ci) => (
                            <button
                              key={ci.id}
                              type="button"
                              disabled={ci.disabled}
                              className={`w-full p-3 text-left transition-colors duration-200 ease-in-out last:border-b-0 hover:bg-secondary-background ${ci.isSelected ? "bg-tertiary-background" : ""} ${ci.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer focus:outline-none"}`}
                              onClick={() => !ci.disabled && ci.onClick?.(ci)}
                            >
                              <div className="flex min-w-0 items-center justify-between">
                                <span className="min-w-0 flex-1">
                                  {ci.label}
                                </span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className={isCard ? "" : "p-4"}>{item.content}</div>
                  )}
                </div>
              </div>
            );

            // ── Card variant ──────────────────────────────────────────────

            if (isCard) {
              return (
                <Card
                  key={item.id}
                  tabIndex={-1}
                  className={`bg-white! p-0! outline-[#E5E7EB]! ${itemClassName}`}
                >
                  <button
                    id={buttonId}
                    type="button"
                    disabled={item.disabled}
                    aria-expanded={isExpanded}
                    aria-controls={contentId}
                    onClick={() => !item.disabled && handleToggle(item.id)}
                    onKeyDown={(e) =>
                      !item.disabled && handleKeyDown(e, item.id)
                    }
                    className={`w-full rounded px-3 py-2 text-left focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${item.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                  >
                    <div className="flex w-full items-center justify-between gap-4">
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <p className="truncate text-sm font-medium text-black">
                          {item.header}
                        </p>
                        {item.subtitle && (
                          <div className="flex min-w-0 items-center gap-2 overflow-hidden text-xs text-[#4A5565]">
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-4">
                        {item.statusBadge && (
                          <StatusComponent {...item.statusBadge} />
                        )}
                        {expandIconNode}
                      </div>
                    </div>
                  </button>
                  {expandedContentBlock}
                </Card>
              );
            }

            // ── Default variant ───────────────────────────────────────────

            return (
              <div
                key={item.id}
                className={`accordion-item ${itemClassName} ${item.disabled ? "opacity-50" : ""}`}
              >
                <button
                  id={buttonId}
                  type="button"
                  disabled={item.disabled}
                  aria-expanded={isExpanded}
                  aria-controls={contentId}
                  aria-disabled={item.disabled}
                  onClick={() => !item.disabled && handleToggle(item.id)}
                  onKeyDown={(e) => !item.disabled && handleKeyDown(e, item.id)}
                  className={`accordion-header w-full rounded-t-lg border border-secondary-accent bg-white px-4 py-3 text-left transition-colors duration-200 ease-in-out hover:bg-secondary-background focus:ring-1 focus:ring-secondary-accent focus:outline-none focus:ring-inset ${!isExpanded ? "rounded-b-lg" : ""} ${isExpanded ? "border-b-0 border-primary-accent" : ""} ${item.disabled ? "cursor-not-allowed bg-secondary-background" : "cursor-pointer"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-1 items-center gap-3">
                      <div className="accordion-header-content flex-1">
                        {item.header}
                        {item.subtitle && (
                          <div className="mt-0.5 text-xs text-gray-500">
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                      {item.badge && (
                        <div className="accordion-badge" aria-hidden="true">
                          {item.badge}
                        </div>
                      )}
                      {item.statusBadge && (
                        <StatusComponent {...item.statusBadge} />
                      )}
                    </div>
                    <div className="accordion-icon ml-2" aria-hidden="true">
                      {expandIconNode}
                    </div>
                  </div>
                </button>
                {expandedContentBlock}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdvancedAccordion;
