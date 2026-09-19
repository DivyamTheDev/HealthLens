export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import for CommonJS / ESM compatibility
    const pdfModule = await import('pdf-parse');
    const pdf = (pdfModule.default || pdfModule) as (dataBuffer: Buffer) => Promise<{ text: string }>;
    const data = await pdf(buffer);
    if (data && data.text && data.text.trim().length > 0) {
      return data.text;
    }
  } catch (err) {
    console.warn('[pdfParser] pdf-parse failed, attempting text fallback:', err);
  }

  // Fallback: raw string conversion if text-based
  try {
    const str = buffer.toString('utf-8');
    const printable = str.replace(/[^\x20-\x7E\r\n\t]/g, ' ');
    return printable;
  } catch {
    return '';
  }
}
