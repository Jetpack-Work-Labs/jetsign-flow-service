import express from "express";
import { HandleQueue, pollAndProcessJobs } from "./services/sqs";
import { config } from "./config";
import { connectDB } from "./infrastructure";
import { signPDFStream } from "./services/signserver/sign";
import { Readable } from "stream";
import { addWatermarkToPdf } from "./utils/watermark";
import { fixPdfForSignServer } from "./utils/pdf-fix";
import formidable from "formidable";

const app = express();
const PORT = 9999;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "GetSign Flow Service",
    version: "1.0.0",
  });
});

// SignServer health check endpoint
app.get("/health/signserver", async (req, res) => {
  try {
    const { exec } = require("child_process");
    const util = require("util");
    const execAsync = util.promisify(exec);

    const { stdout } = await execAsync(
      "docker exec signserver /opt/keyfactor/signserver/bin/signserver getstatus complete 62823351"
    );

    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      service: "SignServer",
      workerStatus: stdout,
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      service: "SignServer",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// PDF signing endpoint - handles FormData with formidable
app.post("/signserver/process", async (req, res) => {
  try {
    console.log("Processing PDF signing request");
    const form = formidable({
      maxFileSize: Infinity,
      keepExtensions: true,
      allowEmptyFiles: false,
    });
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing FormData:", err);
        res
          .status(400)
          .json({ error: "Error parsing FormData", details: err.message });
        return;
      }

      try {
        const filePart = files.datafile?.[0];
        const workerName = fields.workerName?.[0];
        const watermark = fields.watermark?.[0];

        if (!filePart) {
          res.status(400).json({
            error:
              "No file uploaded. Please provide a 'datafile' in the FormData",
          });
          return;
        }

        if (!workerName) {
          res.status(400).json({ error: "workerName field is required" });
          return;
        }

        const shouldAddWatermark = watermark === "true";

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="signed-document.pdf"'
        );

        // Step 1: Add watermark if requested
        let processedPdfBuffer: Buffer;

        // Try to get the buffer from the stream first, then fallback to filepath
        if ((filePart as any).buffer) {
          processedPdfBuffer = (filePart as any).buffer;
        } else if (filePart.filepath) {
          processedPdfBuffer = require("fs").readFileSync(filePart.filepath);
        } else {
          throw new Error("No file data found");
        }
        console.log(shouldAddWatermark);
        if (shouldAddWatermark) {
          try {
            processedPdfBuffer = await addWatermarkToPdf(processedPdfBuffer);
            console.log("watermark added ");
          } catch (watermarkError) {
            if ((filePart as any).buffer) {
              processedPdfBuffer = (filePart as any).buffer;
            } else if (filePart.filepath) {
              processedPdfBuffer = require("fs").readFileSync(
                filePart.filepath
              );
            }
          }
        }

        // Step 2: Fix PDF metadata to prevent SignServer ClassCastException
        try {
          processedPdfBuffer = await fixPdfForSignServer(processedPdfBuffer);
          console.log("PDF metadata fixed for SignServer compatibility");
        } catch (fixError) {
          console.warn(
            "Could not fix PDF metadata, proceeding with original:",
            fixError
          );
        }

        const fileStream = new Readable();
        fileStream.push(processedPdfBuffer);
        fileStream.push(null); // End the stream

        // Step 3: Digitally sign the PDF
        await signPDFStream({
          inputStream: fileStream,
          outputStream: res,
          WORKER_NAME: workerName,
          filename: filePart.originalFilename || "document.pdf",
        });
      } catch (parseError) {
        console.error("Error processing request:", parseError);
        res.status(400).json({
          error: "Error processing request",
          details:
            parseError instanceof Error
              ? parseError.message
              : "Unknown parsing error",
        });
      }
    });
  } catch (error) {
    console.error("Error in sign-pdf endpoint:", error);
    res.status(500).json({
      error: "Failed to sign PDF",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Express error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
);

// Initialize the application
const initializeApp = async () => {
  try {
    // Connect to database
    await connectDB(config.db);
    console.log("✅ Database connected successfully");

    // Start SQS polling
    pollAndProcessJobs(HandleQueue);
    console.log("✅ SQS polling started");

    // Start the server
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to initialize application:", error);
    process.exit(1);
  }
};

// Initialize the app
initializeApp();
