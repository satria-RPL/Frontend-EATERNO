import { getSerialApi, openSerialPort, type SerialPortLike } from "@/lib/printing/escpos";

export type { SerialPortLike };

type PrinterConnectResult =
  | { ok: true; port: SerialPortLike }
  | { ok: false; error: string };

export async function connectPrinter(
  baudRate: number
): Promise<PrinterConnectResult> {
  const serialApi = getSerialApi();
  if (!serialApi) {
    return { ok: false, error: "Browser ini tidak mendukung Web Serial." };
  }

  try {
    const port = await serialApi.requestPort();
    await openSerialPort(port, baudRate);
    return { ok: true, port };
  } catch {
    return { ok: false, error: "Gagal menghubungkan printer." };
  }
}

export async function disconnectPrinter(port: SerialPortLike | null) {
  if (!port) return;
  try {
    await port.close();
  } catch {}
}
