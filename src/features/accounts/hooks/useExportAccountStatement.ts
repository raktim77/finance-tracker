import { useMutation } from "@tanstack/react-query";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { FileOpener } from "@capacitor-community/file-opener";
import { LocalNotifications } from "@capacitor/local-notifications";

import { exportAccountStatement } from "../api/exportAccountStatement";

import type {
  AccountStatementFormat,
  GetAccountStatementParams,
} from "../types/account.types";

interface AuthOptions {
  accessToken?: string | null;
}

interface ExportPayload {
  accountId: string;
  params: GetAccountStatementParams;
  format?: AccountStatementFormat;
}

function getFileName(
  format: AccountStatementFormat
) {
  const date = new Date()
    .toISOString()
    .split("T")[0];

  const time = new Date()
    .toTimeString()
    .split(" ")[0]
    .replace(/:/g, "-");

  return `xpensio-account-statement-${date}_${time}.${format}`;
}

function getMimeType(
  format: AccountStatementFormat
) {
  return format === "pdf"
    ? "application/pdf"
    : "text/csv";
}

async function blobToBase64(
  blob: Blob
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () =>
      resolve(
        (reader.result as string).split(",")[1]
      );

    reader.onerror = reject;

    reader.readAsDataURL(blob);
  });
}

async function requestNotificationPermission() {
  const { display } =
    await LocalNotifications.requestPermissions();

  return display === "granted";
}

async function showDownloadNotification(
  format: AccountStatementFormat,
  fileName: string,
  filePath: string
) {
  const canNotify =
    await requestNotificationPermission();

  if (!canNotify) return;

  const safeId = Math.floor(
    Math.random() * 2_000_000_000
  );

  await LocalNotifications.schedule({
    notifications: [
      {
        id: safeId,
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
  format: AccountStatementFormat
): Promise<void> {
  const fileName =
    getFileName(format);

  const base64Data =
    await blobToBase64(blob);

  const writeResult =
    await Filesystem.writeFile({
      path: `Xpensio/${fileName}`,
      data: base64Data,
      directory: Directory.Documents,
      recursive: true,
    });

  await showDownloadNotification(
    format,
    fileName,
    writeResult.uri
  );

  await FileOpener.open({
    filePath: writeResult.uri,
    contentType: getMimeType(format),
    openWithDefault: true,
  });
}

function downloadOnWeb(
  blob: Blob,
  format: AccountStatementFormat
) {
  const url =
    window.URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download = getFileName(format);

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
}

export function useExportAccountStatement(
  options: AuthOptions = {}
) {
  return useMutation({
    mutationFn: async ({
      accountId,
      params,
      format = "csv",
    }: ExportPayload) => {
      const blob =
        await exportAccountStatement(
          accountId,
          params,
          {
            format,
            accessToken:
              options.accessToken,
          }
        );

      if (
        Capacitor.isNativePlatform() &&
        Capacitor.getPlatform() ===
          "android"
      ) {
        await saveAndOpenOnAndroid(
          blob,
          format
        );
      } else {
        downloadOnWeb(blob, format);
      }
    },
  });
}