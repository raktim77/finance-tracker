import { useMutation } from "@tanstack/react-query";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { FileOpener } from "@capacitor-community/file-opener";
import { LocalNotifications } from "@capacitor/local-notifications";
import { exportTransactions } from "../api/exportTransactions";
import type { GetTransactionsParams } from "../types/transaction.types";

interface AuthOptions {
  accessToken?: string | null;
}
interface ExportPayload {
  params?: GetTransactionsParams;
  format?: "csv" | "pdf";
}

function getFileName(format: "csv" | "pdf") {
  const date = new Date().toISOString().split("T")[0];
  const time = new Date().toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS
  return `xpensio-transactions-${date}_${time}.${format}`;
}

function getMimeType(format: "csv" | "pdf") {
  return format === "pdf" ? "application/pdf" : "text/csv";
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function requestNotificationPermission() {
  const { display } = await LocalNotifications.requestPermissions();
  return display === "granted";
}

async function showDownloadNotification(
  format: "csv" | "pdf",
  fileName: string,
  filePath: string
) {
  const canNotify = await requestNotificationPermission();
  if (!canNotify) return;

  // Date.now() overflows Java int — cap it to safe range
  const safeId = Math.floor(Math.random() * 2_000_000_000);

  await LocalNotifications.schedule({
    notifications: [
      {
        id: safeId,  // ← was Date.now(), which is too large
        title: "Download Complete",
        body: `${fileName} saved to Documents`,
        actionTypeId: "OPEN_FILE",
        extra: {
          filePath,
          mimeType: getMimeType(format),
        },
        smallIcon: "res://ic_notification",
        iconColor: "#7C6CFF",
      },
    ],
  });
}

async function saveAndOpenOnAndroid(
  blob: Blob,
  format: "csv" | "pdf"
): Promise<void> {
  const fileName = getFileName(format);
  const base64Data = await blobToBase64(blob);

  // Documents directory = visible in file manager, never auto-deleted
  const writeResult = await Filesystem.writeFile({
    path: `Xpensio/${fileName}`,   // saves under Documents/Xpensio/
    data: base64Data,
    directory: Directory.Documents,
    recursive: true,               // creates the Xpensio folder if needed
  });

  // Show the download-complete notification
  await showDownloadNotification(format, fileName, writeResult.uri);

  // Also open the file immediately
  await FileOpener.open({
    filePath: writeResult.uri,
    contentType: getMimeType(format),
    openWithDefault: true,
  });
}

function downloadOnWeb(blob: Blob, format: "csv" | "pdf") {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = getFileName(format);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function useExportTransactions(options: AuthOptions = {}) {
  return useMutation({
    mutationFn: async ({ params = {}, format = "csv" }: ExportPayload) => {
      const blob = await exportTransactions(params, {
        format,
        accessToken: options.accessToken,
      });

      if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android") {
        await saveAndOpenOnAndroid(blob, format);
      } else {
        downloadOnWeb(blob, format);
      }
    },
  });
}