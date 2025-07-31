import { PDFDocument, PDFName, PDFArray, PDFString } from "pdf-lib";
import fs from "fs";
import path from "path";
import { GETSIGN_DIGITAL_SIGNATURE_URL } from "../const";

export async function addWatermarkToPdf(pdfBuffer: Buffer): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();
  const lastPage = pages[pages.length - 1]; // Get the last page

  const pageWidth = lastPage.getWidth();

  const watermarkWidth = 120;
  const watermarkHeight = 60;
  const margin = 10;
  const x = pageWidth - watermarkWidth - margin; // Right side
  const y = margin; // Bottom area

  // Get watermark image path
  const watermarkImagePath = path.join(
    __dirname,
    "../public/watermark/watermark.png"
  );
  console.log(watermarkImagePath);
  // Add watermark image if provided
  if (watermarkImagePath && fs.existsSync(watermarkImagePath)) {
    try {
      const watermarkImageBytes = fs.readFileSync(watermarkImagePath);
      const watermarkImage = await pdfDoc.embedPng(watermarkImageBytes);
      console.log({
        watermarkImageBytes,
        watermarkImage,
      });
      lastPage.drawImage(watermarkImage, {
        x,
        y,
        width: watermarkWidth,
        height: watermarkHeight,
      });
    } catch (error) {
      console.warn(
        "Could not embed watermark image, using text instead:",
        error
      );
    }
  }

  // Add clickable link annotation
  const linkAnnot = pdfDoc.context.obj({
    Type: "Annot",
    Subtype: "Link",
    Rect: [x, y, x + watermarkWidth, y + watermarkHeight],
    Border: [0, 0, 0], // No border
    A: {
      Type: "Action",
      S: "URI",
      URI: PDFString.of(GETSIGN_DIGITAL_SIGNATURE_URL),
    },
    F: 4, // Print annotation
  });

  // Add annotation to the last page
  const annots = lastPage.node.lookupMaybe(PDFName.of("Annots"), PDFArray);
  if (annots) {
    annots.push(linkAnnot);
  } else {
    const newAnnots = pdfDoc.context.obj([linkAnnot]);
    lastPage.node.set(PDFName.of("Annots"), newAnnots);
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
