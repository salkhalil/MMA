"use client";

import { useCallback, useRef } from "react";
import { RankedItem } from "@/types";
import RankedNominationItem from "./RankedNominationItem";

interface Props {
  items: RankedItem[];
  categoryType: "FILM" | "ACTOR" | "DIRECTOR";
  locked: boolean;
  onChange: (items: RankedItem[]) => void;
}

export default function RankedNominationList({
  items,
  categoryType,
  locked,
  onChange,
}: Props) {
  const dragIdx = useRef<number | null>(null);

  const moveItem = useCallback(
    (fromIdx: number, toIdx: number) => {
      if (fromIdx === toIdx) return;
      const next = [...items];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      onChange(next.map((it, i) => ({ ...it, rank: i + 1 })));
    },
    [items, onChange]
  );

  const removeItem = useCallback(
    (idx: number) => {
      const next = items.filter((_, i) => i !== idx);
      onChange(next.map((it, i) => ({ ...it, rank: i + 1 })));
    },
    [items, onChange]
  );

  if (items.length === 0) {
    return (
      <div
        className="text-center py-12 rounded-xl border-2 border-dashed"
        style={{ borderColor: "var(--card-border)", color: "var(--text-tertiary)" }}
      >
        <p className="text-lg font-medium">No nominations yet</p>
        <p className="text-sm mt-1">Click items on the left to add them</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <RankedNominationItem
          key={item.movieId ?? item.movieCreditId ?? idx}
          item={item}
          categoryType={categoryType}
          isFirst={idx === 0}
          isLast={idx === items.length - 1}
          locked={locked}
          onMoveUp={() => moveItem(idx, idx - 1)}
          onMoveDown={() => moveItem(idx, idx + 1)}
          onRemove={() => removeItem(idx)}
          onDragStart={() => {
            dragIdx.current = idx;
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (dragIdx.current !== null) {
              moveItem(dragIdx.current, idx);
              dragIdx.current = null;
            }
          }}
        />
      ))}
    </div>
  );
}
