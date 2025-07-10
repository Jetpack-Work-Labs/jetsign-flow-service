import forge from "node-forge";
import fs from "fs";
import { certificatePath, generateRandomPassword } from "../../utils";
import { CertificateDto } from "../../interfaces";

const friendlyName = "signer00003";
export { CertificateService } from "./certificate";

export const createCertificate = ({
  serialNumber,
  commonName,
  countryName,
  state,
  localityName,
  organizationName,
}: CertificateDto) => {
  const pki = forge.pki;
  const keys: forge.pki.KeyPair = pki.rsa.generateKeyPair(2048);
  const cert: forge.pki.Certificate = pki.createCertificate();

  cert.publicKey = keys.publicKey;
  cert.serialNumber = serialNumber;
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

  const attrs: forge.pki.CertificateField[] = [
    { name: "commonName", value: commonName },
    { name: "countryName", value: countryName },
    { shortName: "ST", value: state },
    { name: "localityName", value: localityName },
    { name: "organizationName", value: organizationName },
    { shortName: "OU", value: "GetSign CA" },
  ];

  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.sign(keys.privateKey);

  const password = generateRandomPassword();
  const p12Asn1 = forge.pkcs12.toPkcs12Asn1(keys.privateKey, cert, password, {
    algorithm: "3des",
    friendlyName,
  });
  const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
  if (!fs.existsSync(certificatePath)) {
    fs.mkdirSync(certificatePath, { recursive: true });
  }
  const cp = certificatePath + "/" + serialNumber + ".p12";
  fs.writeFileSync(cp, Buffer.from(p12Der, "binary"));
  return { certificatePath: cp, password };
};
