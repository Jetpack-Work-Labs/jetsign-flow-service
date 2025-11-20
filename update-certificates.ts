import { connectDB } from "./src/infrastructure/db";
import { CertificateModel } from "./src/model";
import { config } from "./src/config";
import mongoose from "mongoose";

/**
 * Script to update all CertificateModel records:
 * - workerId: String(accountId) + "1"
 * - tokenId: String(accountId) + "0"
 */
const updateCertificates = async () => {
  try {
    console.log("🔌 Connecting to database...");
    await connectDB(config.db);
    console.log("✅ Database connected successfully\n");

    console.log("📋 Fetching all certificates...");
    const certificates = await CertificateModel.find({}).exec();
    console.log(`Found ${certificates.length} certificate(s) to update\n`);

    if (certificates.length === 0) {
      console.log("⚠️  No certificates found. Exiting...");
      await mongoose.connection.close();
      process.exit(0);
    }

    let updatedCount = 0;
    let errorCount = 0;

    console.log("🔄 Updating certificates...\n");

    for (const certificate of certificates) {
      try {
        const accountId = certificate.accountId;
        const newWorkerId = String(accountId) + "1";
        const newTokenId = String(accountId) + "0";

        // Check if update is needed
        if (
          certificate.workerId === newWorkerId &&
          certificate.tokenId === newTokenId
        ) {
          console.log(
            `⏭️  Skipping certificate with accountId ${accountId} (already up to date)`
          );
          continue;
        }

        // Update the certificate
        certificate.workerId = newWorkerId;
        certificate.tokenId = newTokenId;
        await certificate.save();

        updatedCount++;
        console.log(
          `✅ Updated certificate with accountId ${accountId}: workerId=${newWorkerId}, tokenId=${newTokenId}`
        );
      } catch (error) {
        errorCount++;
        console.error(
          `❌ Error updating certificate with accountId ${certificate.accountId}:`,
          error instanceof Error ? error.message : error
        );
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 Update Summary:");
    console.log(`   Total certificates: ${certificates.length}`);
    console.log(`   Successfully updated: ${updatedCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log("=".repeat(50));

    console.log("\n🔌 Closing database connection...");
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
    console.log("\n✨ Script completed successfully!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Fatal error:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the script
updateCertificates();

