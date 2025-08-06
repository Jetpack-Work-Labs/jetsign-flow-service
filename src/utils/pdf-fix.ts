import { PDFDocument } from "pdf-lib";

/**
 * Fixes PDF metadata to prevent ClassCastException in SignServer
 * This is a workaround for the known issue in SignServer CE 7.1.1
 */
export async function fixPdfForSignServer(pdfBuffer: Buffer): Promise<Buffer> {
  try {
    // Load the PDF
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    // Get the PDF context
    const context = pdfDoc.context;

    // Try to fix the metadata structure to prevent ClassCastException
    // The issue occurs when SignServer tries to modify the producer metadata
    // and encounters incompatible PDF object types

    // Create a new PDF document with clean metadata
    const newPdfDoc = await PDFDocument.create();

    // Copy all pages from the original document
    const pages = await newPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
    pages.forEach((page) => newPdfDoc.addPage(page));

    // Set clean metadata
    newPdfDoc.setTitle("Document");
    newPdfDoc.setAuthor("GetSign");
    newPdfDoc.setSubject("Digitally Signed Document");
    newPdfDoc.setCreator("GetSign Digital Signature Service");
    newPdfDoc.setProducer("GetSign PDF Signer");

    // Save the fixed PDF
    const fixedPdfBytes = await newPdfDoc.save();
    return Buffer.from(fixedPdfBytes);
  } catch (error) {
    console.warn("Could not fix PDF metadata, using original:", error);
    // Return original if fixing fails
    return pdfBuffer;
  }
}

/**
 * Alternative approach: Strip problematic metadata completely
 */
export async function stripPdfMetadata(pdfBuffer: Buffer): Promise<Buffer> {
  try {
    // Load the PDF
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    // Create a new document without copying metadata
    const newPdfDoc = await PDFDocument.create();

    // Copy pages without metadata
    const pages = await newPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
    pages.forEach((page) => newPdfDoc.addPage(page));

    // Save without metadata
    const strippedPdfBytes = await newPdfDoc.save();
    return Buffer.from(strippedPdfBytes);
  } catch (error) {
    console.warn("Could not strip PDF metadata, using original:", error);
    return pdfBuffer;
  }
}
