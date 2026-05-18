import { FC, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import TaskTypeArrowIcon from "~community/common/assets/Icons/TaskTypeArrowIcon";
import Icon from "~community/common/components/atoms/Icon/Icon";
import {
  TASK_TYPES,
  TaskTypeValue,
  getTaskTypeConfig
} from "~community/crm/utils/crmTaskUtils";

import styles from "./styles";

interface DropdownPos {
  bottom: number;
  left: number;
}

interface Props {
  value: TaskTypeValue;
  onChange: (type: TaskTypeValue) => void;
}

const TaskTypeSelector: FC<Props> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<DropdownPos | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // recalculates on every render — icon updates automatically when value prop changes
  const currentType = getTaskTypeConfig(value);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const outsideTrigger =
        triggerRef.current && !triggerRef.current.contains(target);
      const outsideDropdown =
        dropdownRef.current && !dropdownRef.current.contains(target);
      if (outsideTrigger && outsideDropdown) close();
    };
    document.addEventListener("mousedown", onClickOutside);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("scroll", close, true);
    };
  }, [open, close]);

  const handleOpen = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({ bottom: window.innerHeight - rect.top + 4, left: rect.left });
    }
    setOpen((prev) => !prev);
  };

  const dropdown =
    open && pos
      ? createPortal(
          <div
            ref={dropdownRef}
            role="listbox"
            className={styles.dropdown}
            style={{ position: "fixed", bottom: pos.bottom, left: pos.left }}
          >
            {TASK_TYPES.map((type) => {
              const config = getTaskTypeConfig(type.value);
              return (
                <button
                  key={type.value}
                  type="button"
                  role="option"
                  aria-selected={type.value === value}
                  className={styles.option}
                  onClick={() => {
                    onChange(type.value);
                    setOpen(false);
                  }}
                >
                  <div
                    className={styles.optionIcon}
                    style={{ backgroundColor: config.bg }}
                  >
                    <Icon
                      name={config.iconName}
                      fill="white"
                      width="10"
                      height="10"
                    />
                  </div>
                  <span className={styles.optionLabel}>{type.label}</span>
                </button>
              );
            })}
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Task type: ${value}`}
      >
        <div
          className={styles.iconCircle}
          style={{ backgroundColor: currentType.bg }}
        >
          <Icon
            name={currentType.iconName}
            fill="white"
            width="12"
            height="12"
          />
        </div>
        <TaskTypeArrowIcon
          svgProps={{
            className: `transition-transform duration-200 ${open ? "rotate-180" : ""}`
          }}
        />
      </button>

      {dropdown}
    </>
  );
};

export default TaskTypeSelector;
