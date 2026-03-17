import { type LucideIcon, HelpCircle } from "lucide-react";
import * as Icons from "lucide-react";

export default function resolveLucideIcon(
  iconName?: string | null,
): LucideIcon {
  const normalized = (iconName || "").trim().toLowerCase();

  const pascalName = normalized
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  const IconLibrary = Icons as unknown as Record<string, LucideIcon>;
  return IconLibrary[pascalName] || HelpCircle;
}
