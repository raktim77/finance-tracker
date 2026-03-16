import { useRef, useState, useEffect } from "react";

type Props = {
  value: number | "";
  onChange: (value: number | "") => void;
};

export default function OpeningBalanceInput({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Local string state to allow for "10." or "10.0" during typing
  const [localValue, setLocalValue] = useState<string>(value.toString());

  // Keep local value in sync if parent resets the value (e.g. on close)
  useEffect(() => {
    if (value === "") setLocalValue("");
    else if (Number(localValue) !== value) setLocalValue(value.toString());
  }, [value]);

  const getFontSize = (val: string) => {
    const len = val.length;
    if (len < 7) return "text-6xl";
    if (len < 10) return "text-4xl";
    return "text-3xl";
  };

  const fontSizeClass = getFontSize(localValue);

  const handleChange = (v: string) => {
    // 1. Allow only numbers and one decimal
    if (v !== "" && !/^\d*\.?\d*$/.test(v)) return;

    // 2. Limit to 2 decimal places
    if (v.includes('.') && v.split('.')[1].length > 2) return;

    setLocalValue(v);

    // 3. Send numeric value to parent, but handle empty/dots
    if (v === "" || v === ".") {
      onChange("");
    } else {
      onChange(parseFloat(v));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-4 w-full overflow-hidden">
      <div className={`flex items-center justify-center gap-3 transition-all duration-300 ${fontSizeClass}`}>
        
        <span className="font-black text-[var(--color-text-secondary)] opacity-40 select-none">
          ₹
        </span>

        <div className="relative flex items-center">
          {/* Sizer for dynamic width */}
          <span className="invisible whitespace-pre min-w-[20px] px-1 font-black">
            {localValue || "0"}
          </span>

          <input
            ref={inputRef}
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            inputMode="decimal"
            placeholder="0"
            autoFocus={false}
            className="
              absolute inset-0
              w-full
              bg-transparent
              outline-none
              font-black
              text-[var(--color-text-primary)]
              caret-[var(--color-accent)]
              text-center
              placeholder:opacity-20
            "
          />
        </div>
      </div>
      
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-secondary)] opacity-40 mt-4">
        Enter Opening Balance
      </span>
    </div>
  );
}