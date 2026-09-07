"use client";

import { FC, useEffect } from "react";

interface Props {
  title?: string;
}

/**
 * Sets the document title from a client component.
 *
 * The App Router ignores `next/head`, and these titles are produced inside
 * client components (they come from `useTranslator`), so a `metadata` export
 * is not an option.
 */
const PageTitle: FC<Props> = ({ title }) => {
  useEffect(() => {
    if (title) document.title = title;
  }, [title]);

  return null;
};

export default PageTitle;
