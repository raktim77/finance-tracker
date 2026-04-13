export function createSMSHash(
  message: string,
  sender: string,
  timestamp?: number
) {
  return `${message}-${sender}-${timestamp ?? ""}`;
}