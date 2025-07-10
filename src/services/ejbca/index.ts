import axios, { AxiosResponse, AxiosError } from "axios";
import * as fs from "fs";
import * as https from "https";
import * as forge from "node-forge";
import * as path from "path";

// EJBCA REST API base URL
// const baseUrl: string = "https://18.234.34.104:8443/ejbca/ejbca-rest-api/v1";
const baseUrl: string = "https://localhost/ejbca/ejbca-rest-api/v1";

// Configure HTTPS agent with PKCS12 client certificate
const httpsAgent: https.Agent = new https.Agent({
  pfx: fs.readFileSync("./superadmin.p12"), // Path to your admin .p12 file
  passphrase: "Root@jetsign", // Password for the .p12 file
  ca: fs.readFileSync("./ManagementCA.pem"), // CA certificate
  rejectUnauthorized: false, // Set to true in production
});

// List of usernames
const usernames: string[] = ["user1"]; // Replace with your usernames

// Interfaces for EJBCA API payloads and responses
interface EndEntity {
  username: string;
  password: string;
  certificate_profile_name: string;
  end_entity_profile_name: string;
  ca_name: string;
  token: string;
  subject_dn: string;
  subject_alt_name: string;
  email: string;
  status: string;
}

interface EnrollmentRequest {
  certificate_request: string | null;
  certificate_profile_name: string;
  end_entity_profile_name: string;
  ca_name: string;
  username: string;
  password: string;
  include_chain: boolean;
  key_algorithm: string;
  key_spec: string;
}

interface EndEntityResponse {
  username: string;
  status: string;
  // Add other fields as needed based on EJBCA response
}

interface EnrollKeystoreResponse {
  keystore: string; // Base64-encoded PKCS12
  certificate: string;
  // Add other fields as needed
}

interface CustomAxiosError extends AxiosError {
  response?: AxiosResponse;
}

// Function to add an end entity
async function addEndEntity(username: string): Promise<EndEntityResponse> {
  const endEntity: EndEntity = {
    username,
    password: `password_${username}`,
    certificate_profile_name: "ClientAuth",
    end_entity_profile_name: "ClientEndEntityProfile",
    ca_name: "ManagementCA",
    token: "P12",
    subject_dn: `CN=${username},O=JetpackLab`,
    subject_alt_name: `rfc822Name=${username}@example.com`,
    email: `${username}@example.com`,
    status: "NEW",
  };

  console.log(endEntity);

  try {
    const response: AxiosResponse<EndEntityResponse> = await axios.post(
      `${baseUrl}/endentity`,
      endEntity,
      {
        httpsAgent,
        headers: {
          "X-Keyfactor-Requested-With": "XMLHttpRequest",
          "Content-Type": "application/json",
        },
      }
    );
    console.log(`End entity created for ${username}:`, response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Function to enroll certificate and generate .p12
async function enrollAndGenerateP12(username: string): Promise<string> {
  const enrollment: EnrollmentRequest = {
    certificate_request: null,
    certificate_profile_name: "ClientAuth",
    end_entity_profile_name: "ClientEndEntityProfile",
    ca_name: "ManagementCA",
    username,
    password: `password_${username}`,
    include_chain: true,
    key_algorithm: "RSA",
    key_spec: "2048",
  };

  try {
    const response: AxiosResponse<EnrollKeystoreResponse> = await axios.post(
      `${baseUrl}/certificate/enrollkeystore`,
      enrollment,
      {
        httpsAgent,
        headers: {
          "X-Keyfactor-Requested-With": "XMLHttpRequest",
          "Content-Type": "application/json",
        },
      }
    );

    // Decode base64-encoded PKCS12
    const p12Base64: string = response.data.keystore;
    const p12Der: string = forge.util.decode64(p12Base64);

    // Create user directory
    const userDir: string = path.join(__dirname, "p12-files", username);
    fs.mkdirSync(userDir, { recursive: true });

    // Save .p12 file
    const p12Path: string = path.join(userDir, `${username}.p12`);
    fs.writeFileSync(p12Path, Buffer.from(p12Der, "binary"));
    console.log(`P12 file saved for ${username} at ${p12Path}`);

    return p12Path;
  } catch (error) {
    console.error(`Error enrolling certificate for ${username}:`);
    handleError(error as CustomAxiosError);
    throw error;
  }
}

// Error handling helper
function handleError(error: CustomAxiosError): void {
  if (error.response) {
    console.error("Status:", error.response.status);
    console.error("Data:", error.response.data);
  } else {
    console.error("Error:", error.message);
  }
}

// Main function
async function main(): Promise<void> {
  try {
    for (const username of usernames) {
      console.log(`Processing user: ${username}`);
      await addEndEntity(username);
      await enrollAndGenerateP12(username);
    }
    console.log("All users processed successfully.");
  } catch (error) {
    console.log(error);
    console.error("Operation failed.");
  }
}

// Run the script
main();
