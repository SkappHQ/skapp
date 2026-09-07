"use client";

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { useServerInsertedHTML } from "next/navigation";
import { FC, ReactNode, useState } from "react";

interface Props {
  children: ReactNode;
}

/**
 * Emotion cache wired into the App Router's server-insertion hook so MUI styles
 * are flushed into the streamed HTML instead of arriving after hydration.
 *
 * Replaces the implicit emotion SSR that `_document.tsx` provided under the
 * Pages Router.
 */
const EmotionCacheProvider: FC<Props> = ({ children }) => {
  const [{ cache, flush }] = useState(() => {
    const cache = createCache({ key: "mui", prepend: true });
    cache.compat = true;

    const prevInsert = cache.insert;
    let inserted: string[] = [];

    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };

    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };

    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();

    if (names.length === 0) return null;

    let styles = "";
    names.forEach((name) => {
      styles += cache.inserted[name];
    });

    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
};

export default EmotionCacheProvider;
