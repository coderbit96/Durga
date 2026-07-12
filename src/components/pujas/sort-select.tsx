"use client";

type SortSelectProps = {
  onChange: (value: "popularity" | "name" | "recently-updated" | "nearest") => void;
  value: "popularity" | "name" | "recently-updated" | "nearest";
};

export function SortSelect({ onChange, value }: SortSelectProps) {
  return (
    <label className="grid gap-1 text-sm font-medium">
      Sort
      <select
        className="min-h-11 rounded-md border border-border bg-surface/90 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
        onChange={(event) =>
          onChange(
            event.target.value as
              | "popularity"
              | "name"
              | "recently-updated"
              | "nearest",
          )
        }
        value={value}
      >
        <option value="popularity">Popularity</option>
        <option value="name">Name</option>
        <option value="recently-updated">Recently updated</option>
        <option value="nearest">Nearest</option>
      </select>
    </label>
  );
}
