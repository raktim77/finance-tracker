import DatePicker from "../ui/DatePicker";

type Props = {
value: Date;
onChange: (date: Date) => void;
};

export default function DateField({ value, onChange }: Props) {
return ( <div className="space-y-2"> <label className="text-sm text-[var(--color-text-secondary)]">
Date </label>


  <div className="border border-[var(--border)] rounded-xl p-3 bg-[var(--color-surface)]">
    <DatePicker
      value={value}
      onChange={(d) => {
        if (d) onChange(d);
      }}
    />
  </div>
</div>


);
}
