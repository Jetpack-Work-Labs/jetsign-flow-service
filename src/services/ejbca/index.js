const axios = require("axios");
const https = require("https");
const fs = require("fs").promises;
const path = require("path");
const forge = require("node-forge");

async function enrollKeystore() {
  try {
    // Configuration
    const ejbcaUrl =
      "https://18.234.34.104/ejbca/ejbca-rest-api/v1/certificate/pkcs10enroll";
    const superAdminP12Path = path.join(__dirname, "", "testadmin.p12");
    const superAdminPassphrase = "Root@jetsign";
    const outputP12Path = path.join(__dirname, "certs", "user-keystore.p12");

    console.log("Generating PKCS#10 CSR...");
    const pki = forge.pki;
    const keys = pki.rsa.generateKeyPair(2048);
    const csr = pki.createCertificationRequest();
    csr.publicKey = keys.publicKey;
    csr.setSubject([{ name: "commonName", value: "testuser" }]);
    csr.sign(keys.privateKey);
    const pem = pki.certificationRequestToPem(csr);
    console.log({ pem });
    // Extract Base64 without headers/footers
    const certificateRequest = pem
      .replace(/-----BEGIN CERTIFICATE REQUEST-----/g, "")
      .replace(/-----END CERTIFICATE REQUEST-----/g, "")
      .replace(/\n/g, "");
    console.log("CSR generated successfully.");

    // End entity details
    const payload = {
      username: "testuser",
      password: "foo123",
      certificate_profile_name: "ENDUSER",
      end_entity_profile_name: "ENDUSER",
      certificate_authority_name: "ManagementCA",
      key_algorithm: "RSA",
      key_spec: "2048",
      include_chain: true,
      certificate_requests: certificateRequest,
    };

    // Read SuperAdmin.p12 file
    console.log("Reading SuperAdmin.p12 file...");
    const pfx = await fs.readFile(superAdminP12Path);
    console.log("SuperAdmin.p12 file loaded successfully.");

    // Configure HTTPS agent
    const httpsAgent = new https.Agent({
      pfx: pfx,
      passphrase: superAdminPassphrase,
      rejectUnauthorized: false, // For self-signed certs
      keepAlive: true,
      maxSockets: 10,
      minVersion: "TLSv1.2", // Enforce TLS 1.2
      maxVersion: "TLSv1.3",
      timeout: 60000,
    });

    // Configure axios
    const axiosInstance = axios.create({
      httpsAgent,
      timeout: 60000,
      headers: {
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer",
    });

    // Test a simple GET request to verify authentication
    console.log("Testing authentication with /v1/ca...");
    try {
      const testResponse = await axiosInstance.get(
        "https://18.234.34.104/ejbca/ejbca-rest-api/v1/ca"
      );
      console.log("Test response:", testResponse.data.toString());
    } catch (testError) {
      console.error("Test request failed:", testError.message);
      if (testError.response) {
        console.error(
          "Test error response:",
          testError.response.status,
          testError.response.data.toString()
        );
      }
    }

    // Make POST request
    console.log(`Sending request to ${ejbcaUrl}...`);
    const response = await axiosInstance.post(ejbcaUrl, payload);

    // Check response status
    if (response.status === 201) {
      console.log("Request successful, saving P12 file...");
      await fs.writeFile(outputP12Path, response.data);
      console.log(`P12 certificate successfully saved to ${outputP12Path}`);
      console.log(`Use the enrollment code (password): ${payload.password}`);
    } else {
      console.error(
        "Unexpected response status:",
        response.status,
        response.data.toString()
      );
    }
  } catch (error) {
    if (error.response) {
      console.error(
        "Error response:",
        error.response.status,
        error.response.data.toString()
      );
    } else {
      console.error("Error:", error.message);
      if (error.code) console.error("Error code:", error.code);
      if (error.config) console.error("Request URL:", error.config.url);
      if (error.syscall) console.error("System call:", error.syscall);
      if (error.cause) console.error("Cause:", error.cause);
    }
  }
}

// Run the function
enrollKeystore();
