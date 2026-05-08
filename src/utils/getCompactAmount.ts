export default function formatCompactCurrency(value: number) {
  const abs = Math.abs(value);

  const format = (num: number, suffix: string) => {
    const fixed =
      num >= 100
        ? num.toFixed(0)
        : num >= 10
          ? num.toFixed(1)
          : num.toFixed(2);

    return `${fixed.replace(/\.0+$/, "")}${suffix}`;
  };

  if (abs >= 1e12) {
    return format(value / 1e12, "T");
  }

  if (abs >= 1e9) {
    return format(value / 1e9, "B");
  }

  if (abs >= 1e6) {
    return format(value / 1e6, "M");
  }

  if (abs >= 1e3) {
    return format(value / 1e3, "K");
  }

  return value.toString();
}