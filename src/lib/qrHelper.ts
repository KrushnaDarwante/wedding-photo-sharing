import QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark: string;
    light: string;
  };
}

/**
 * Generate a base64 Data URL for a wedding gallery URL.
 */
export async function generateQRCodeDataUrl(
  url: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const defaultOptions: QRCode.QRCodeToDataURLOptions = {
    width: options.width || 600,
    margin: options.margin || 2,
    color: {
      dark: options.color?.dark || '#1A1A1A',
      light: options.color?.light || '#FFFFFF'
    },
    errorCorrectionLevel: 'H'
  };

  try {
    return await QRCode.toDataURL(url, defaultOptions);
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw err;
  }
}

/**
 * Download a QR code image as a PNG file.
 */
export function downloadQRCodePNG(dataUrl: string, filename: string = 'wedding-qr-code.png') {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Trigger browser print dialog for the current window or specific print element.
 */
export function printElement(elementId?: string) {
  if (elementId) {
    const el = document.getElementById(elementId);
    if (!el) {
      window.print();
      return;
    }
  }
  window.print();
}
