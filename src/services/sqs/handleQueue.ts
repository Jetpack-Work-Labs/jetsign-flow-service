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
  const { account_id } = job;
  const company = await applicationService.findCompany(account_id);
  if (company) {
    let docker_certificate_path;
    let docker_certificate_password;
    let certificate = await certificateService.findByCompanyId(account_id);
    if (!certificate) {
      const { user_email, user_name, account_slug } = company || {};
      const { certificatePath, password } = await createCertificate({
        serialNumber: `${account_id}`,
        commonName: `t${user_name} (${user_email})`,
        countryName: "",
        state: "",
        localityName: "",
        organizationName: account_slug || "",
      });
      docker_certificate_password = password;
      const { file_url, file_name } = await uploadFile({
        filePath: certificatePath,
        type: "p12",
      });
      docker_certificate_path = await createP12Docker(certificatePath);
      const certificatePayload: Icertificate = {
        account_id,
        file_url,
        file_name,
        password,
        docker_file_path: docker_certificate_path,
      };
      certificate = await certificateService.createCertificate(
        certificatePayload
      );
    } else {
      docker_certificate_password = certificate.password;
      docker_certificate_path = certificate.docker_file_path;
    }
    const { exists: crypto_token_exist } = await checkWorkerExists({
      worker: CRYPTO_TOKEN(account_id),
    });
    const { exists: pdf_signer_exist } = await checkWorkerExists({
      worker: PDF_SIGNER(account_id),
    });
    if (!crypto_token_exist) {
      await CreateCryptoToken({
        workerId: account_id + 0,
        token_name: account_id + 0,
        KEYSTOREPATH: docker_certificate_path,
        KEYSTOREPASSWORD: docker_certificate_password,
        DEFAULTKEY: "signer00003",
      });
    }
    if (!pdf_signer_exist) {
      await createPdfWOrker({
        workerId: account_id + 1,
        token_name: account_id + 0,
        DEFAULTKEY: "signer00003",
      });
    }

    await certificateService.updateCertificates({
      account_id,
      workerId: account_id + 1,
      tokenId: account_id + 0,
    });
  }
};
