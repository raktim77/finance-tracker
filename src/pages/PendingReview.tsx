import { useEffect, useState } from "react";
import { getPendingSMS } from "../lib/localDb";
import { isNativeAndroidApp } from "../lib/capacitor/platform";

type PendingItem = {
  id: string;
  raw_message: string;
  sender: string;
  amount?: number;
  type?: string;
  merchant?: string;
};

export default function PendingReview() {
  const [items, setItems] = useState<PendingItem[]>([]);

 useEffect(() => {
  const load = async () => {
    if (!isNativeAndroidApp()) return;

    const data = await getPendingSMS();
    setItems(data);
  };

  load();
}, []);

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-semibold">Pending Transactions</h1>

      {items.length === 0 && (
        <div className="text-sm text-gray-500">
          No pending transactions 🎉
        </div>
      )}

      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white dark:bg-neutral-900 p-4 rounded-xl shadow cursor-pointer hover:scale-[1.01] transition"
          onClick={() => {
            console.log("Clicked:", item);
            // 👉 next step: open review modal
          }}
        >
          <div className="text-sm text-gray-500">
            {item.sender}
          </div>

          <div className="font-medium mt-1">
            {item.raw_message}
          </div>

          <div className="flex justify-between mt-2 text-sm">
            <span>
              {item.merchant || "Unknown"}
            </span>

            <span
              className={
                item.type === "expense"
                  ? "text-red-500"
                  : "text-green-500"
              }
            >
              {item.amount ? `₹${item.amount}` : "--"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}