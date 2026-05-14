import React from "react";

/**
 * Recursively extracts plain text content from a React node.
 * Used for searching/filtering accordion items by their rendered text.
 */
export const getTextContent = (node: React.ReactNode): string => {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (React.isValidElement(node)) {
    const props = (node as { props?: { children?: React.ReactNode } }).props;
    if (props?.children) {
      return React.Children.toArray(props.children)
        .map(getTextContent)
        .join("");
    }
  }
  if (Array.isArray(node)) {
    return node.map(getTextContent).join("");
  }
  return "";
};
