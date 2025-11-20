import {
  createP12Docker,
  uploadFile,
  checkWorkerExists,
  CreateCryptoToken,
  createPdfWOrker,
} from "../../utils";
import { SignJob, Icertificate } from "../../interfaces";
import { createCertificate } from "../certificate";

import { ApplicationService } from "../application";
import { CertificateService } from "../certificate";
import { CRYPTO_TOKEN, PDF_SIGNER } from "../../const";

export const HandleQueue = async (job: SignJob): Promise<void> => {
  const applicationService = new ApplicationService();
  const certificateService = new CertificateService();
  console.log({ job });
  const { accountId } = job;
  const company = await applicationService.findCompany(accountId);
  if (company) {
    let docker_certificate_path;
    let docker_certificate_password;
    let certificate = await certificateService.findByCompanyId(accountId);
    if (!certificate) {
      const { user_email, user_name, account_slug } = company || {};
      const { certificatePath, password } = await createCertificate({
        serialNumber: `${accountId}`,
        commonName: `${user_name} (${user_email})`,
        countryName: "",
        state: "",
        localityName: "",
        organizationName: account_slug || "",
      });
      docker_certificate_password = password;
      const { fileUrl, fileName } = await uploadFile({
        filePath: certificatePath,
        type: "p12",
      });
      docker_certificate_path = await createP12Docker(certificatePath);
      const certificatePayload: Icertificate = {
        accountId,
        fileUrl,
        fileName,
        password,
        dockerFilePath: docker_certificate_path,
      };
      certificate = await certificateService.createCertificate(
        certificatePayload
      );
    } else {
      docker_certificate_password = certificate.password;
      docker_certificate_path = certificate.dockerFilePath;
    }
    const { exists: crypto_token_exist } = await checkWorkerExists({
      worker: String(accountId) + "0",
    });
    const { exists: pdf_signer_exist } = await checkWorkerExists({
      worker: String(accountId) + "1",
    });
    console.log({ crypto_token_exist, pdf_signer_exist });

    // Always use existing workers instead of creating new ones
    if (!crypto_token_exist) {
      await CreateCryptoToken({
        workerId: String(accountId) + "0",
        token_name: String(accountId) + "0",
        KEYSTOREPATH: docker_certificate_path,
        KEYSTOREPASSWORD: docker_certificate_password,
        DEFAULTKEY: "signer00003",
      });
    }
    if (!pdf_signer_exist) {
      await createPdfWOrker({
        workerId: String(accountId) + "1",
        token_name: String(accountId) + "0",
        DEFAULTKEY: "signer00003",
      });
    }

    console.log({
      accountId,
      workerId: String(accountId) + "1",
      tokenId: String(accountId) + "0",
    });
    await certificateService.updateCertificates({
      accountId,
      workerId: String(accountId) + "1",
      tokenId: String(accountId) + "0",
    });
  }
};
