import { useMutation } from "@tanstack/react-query";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { FileOpener } from "@capacitor-community/file-opener";
import { LocalNotifications } from "@capacitor/local-notifications";

import { exportAccountSummary } from "../api/exportAccountSummary";

import type {
  GetAccountSummaryParams,
} from "../types/account.types";

interface AuthOptions {
  accessToken?: string | null;
}

interface ExportPayload {
  params: GetAccountSummaryParams;
}

function getFileName() {
  const date = new Date().toISOString().split("T")[0];

  const time = new Date()
    .toTimeString()
    .split(" ")[0]
    .replace(/:/g, "-");

  return `xpensio-account-summary-${date}_${time}.pdf`;
}

function getMimeType() {
  return "application/pdf";
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
          mimeType: getMimeType(),
        },
        smallIcon: "res://ic_notification",
        iconColor: "#7C6CFF",
      },
    ],
  });
}

async function saveAndOpenOnAndroid(
  blob: Blob
): Promise<void> {
  const fileName = getFileName();

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
    fileName,
    writeResult.uri
  );

  await FileOpener.open({
    filePath: writeResult.uri,
    contentType: getMimeType(),
    openWithDefault: true,
  });
}

function downloadOnWeb(blob: Blob) {
  const url =
    window.URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download = getFileName();

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
}

export function useExportAccountSummary(
  options: AuthOptions = {}
) {
  return useMutation({
    mutationFn: async ({
      params,
    }: ExportPayload) => {
      const blob =
        await exportAccountSummary(
          params,
          {
            accessToken:
              options.accessToken,
          }
        );

      if (
        Capacitor.isNativePlatform() &&
        Capacitor.getPlatform() ===
          "android"
      ) {
        await saveAndOpenOnAndroid(blob);
      } else {
        downloadOnWeb(blob);
      }
    },
  });
}