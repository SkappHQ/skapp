import { RefObject, useCallback, useEffect, useState } from "react";

interface CardAlignedPopup {
  width: number;
  offsetX: number;
}

const useCardAlignedPopup = (
  cardRef: RefObject<HTMLDivElement | null>,
  fieldRef: RefObject<HTMLDivElement | null>
): CardAlignedPopup => {
  const [popup, setPopup] = useState<CardAlignedPopup>({
    width: 0,
    offsetX: 0
  });

  const measure = useCallback((): void => {
    const card = cardRef.current;
    const field = fieldRef.current;
    if (!card || !field) return;

    const cardRect = card.getBoundingClientRect();
    const fieldRect = field.getBoundingClientRect();
    setPopup({
      width: cardRect.width,
      offsetX: cardRect.right - fieldRect.right
    });
  }, [cardRef, fieldRef]);

  useEffect(() => {
    const card = cardRef.current;
    const field = fieldRef.current;
    if (!card || !field) return;

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(card);
    observer.observe(field);

    return () => observer.disconnect();
  }, [cardRef, fieldRef, measure]);

  return popup;
};

export default useCardAlignedPopup;
