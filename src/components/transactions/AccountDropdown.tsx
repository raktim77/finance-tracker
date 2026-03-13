export type Account = {
_id: string;
name: string;
type: string;
balance?: number;
};

type Props = {
accounts: Account[];

type: "expense" | "income" | "transfer";

accountId: string | null;
toAccountId: string | null;

onAccountChange: (id: string) => void;
onToAccountChange: (id: string) => void;
};

export default function AccountDropdown({
accounts,
type,
accountId,
toAccountId,
onAccountChange,
onToAccountChange,
}: Props) {
const filteredToAccounts = accounts.filter((a) => a._id !== accountId);

return ( <div className="space-y-4">
{/* Source account */} <div className="space-y-2"> <label className="text-sm text-[var(--color-text-secondary)]">
{type === "transfer" ? "From Account" : "Account"} </label>


    <div className="border border-[var(--border)] rounded-xl p-3 bg-[var(--color-surface)]">
      <select
        value={accountId ?? ""}
        onChange={(e) => onAccountChange(e.target.value)}
        className="w-full bg-transparent outline-none"
      >
        <option value="">Select account</option>

        {accounts.map((acc) => (
          <option key={acc._id} value={acc._id}>
            {acc.name}
          </option>
        ))}
      </select>
    </div>
  </div>

  {/* Destination account for transfer */}
  {type === "transfer" && (
    <div className="space-y-2">
      <label className="text-sm text-[var(--color-text-secondary)]">
        To Account
      </label>

      <div className="border border-[var(--border)] rounded-xl p-3 bg-[var(--color-surface)]">
        <select
          value={toAccountId ?? ""}
          onChange={(e) => onToAccountChange(e.target.value)}
          className="w-full bg-transparent outline-none"
        >
          <option value="">Select account</option>

          {filteredToAccounts.map((acc) => (
            <option key={acc._id} value={acc._id}>
              {acc.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )}
</div>


);
}
