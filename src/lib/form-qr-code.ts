import QRCode from "qrcode";

export function getFormShareUrl(siteUrl: string, slug: string) {
  return new URL(`/formulaires/${encodeURIComponent(slug)}`, siteUrl).toString();
}

export function createFormQrCode(shareUrl: string) {
  return QRCode.toDataURL(shareUrl, {
    type: "image/png",
    width: 1024,
    margin: 4,
    errorCorrectionLevel: "M",
    color: { dark: "#0D1B3D", light: "#FFFFFF" },
  });
}
