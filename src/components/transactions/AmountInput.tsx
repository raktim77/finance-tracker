import { useEffect, useRef } from "react";

type Props = {
value: number | "";
onChange: (value: number | "") => void;
};

export default function AmountInput({ value, onChange }: Props) {
const inputRef = useRef<HTMLInputElement>(null);

// auto focus when component mounts
useEffect(() => {
inputRef.current?.focus();
}, []);

const handleChange = (v: string) => {
// allow empty
if (v === "") {
onChange("");
return;
}


// allow only numbers and decimal
if (!/^\d*\.?\d*$/.test(v)) return;

onChange(Number(v));


};

return ( <div className="flex items-center justify-center"> <div className="flex items-center gap-2 text-4xl md:text-5xl font-semibold"> <span className="text-[var(--color-text-secondary)]">₹</span>


    <input
      ref={inputRef}
      value={value === "" ? "" : value}
      onChange={(e) => handleChange(e.target.value)}
      inputMode="decimal"
      placeholder="0"
      className="
        w-[140px]
        bg-transparent
        outline-none
        text-center
        caret-[var(--color-accent)]
      "
    />
  </div>
</div>


);
}
