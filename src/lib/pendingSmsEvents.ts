export const PENDING_SMS_UPDATED_EVENT = "xpensio:pending-sms-updated";

export function notifyPendingSMSUpdated() {
  window.dispatchEvent(new Event(PENDING_SMS_UPDATED_EVENT));
}

export function listenForPendingSMSUpdates(listener: () => void) {
  window.addEventListener(PENDING_SMS_UPDATED_EVENT, listener);

  return () => {
    window.removeEventListener(PENDING_SMS_UPDATED_EVENT, listener);
  };
}
