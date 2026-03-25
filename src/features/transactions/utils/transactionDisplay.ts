import type { Transaction } from "../types/transaction.types";

export function formatTransactionDisplayDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function getTransactionTitle(transaction: Transaction) {
  if (transaction.note && transaction.note !== "" && transaction.note !== "null") {
    return transaction.note;
  }

  if (!transaction.note || transaction.note === "" || transaction.note === "null") {
    if (transaction.type === "expense" || transaction.type === "income") {
      return transaction.category_name || "Transaction";
    }

    if (transaction.type === "transfer") return "Transfer";
  }

  return "Transaction";
}

export function getTransactionCategoryLabel(transaction: Transaction) {
  if (transaction.type === "expense" || transaction.type === "income") {
    return transaction.account_id.name;
  }

  if (transaction.type === "transfer") {
    return `${transaction.account_id.name} ↔ ${transaction?.to_account_id?.name}`;
  }

  return transaction.account_id.name;
}

export function getTransactionDisplayAmount(transaction: Transaction) {
  if (transaction.type === "expense") return -Math.abs(transaction.amount);
  if (transaction.type === "income") return Math.abs(transaction.amount);

  return Math.abs(transaction.amount);
}
