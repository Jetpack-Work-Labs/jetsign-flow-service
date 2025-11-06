import fs from "fs/promises";
import path from "path";
import { runDockerCommand, sleep } from "../../utils";
import { Sentry } from "../../infrastructure";

export const createCryptoToken = async ({
  PATH,
  KEYSTORE_PASSWORD,
}: {
  PATH: string;
  KEYSTORE_PASSWORD: string;
}) => {
  console.log({ PATH });

  try {
    await runDockerCommand(
      `docker exec signserver sh -c "/opt/keyfactor/signserver/bin/signserver deactivatecryptotoken 1"`
    );
  await runDockerCommand(
    `docker exec signserver sh -c "/opt/keyfactor/signserver/bin/signserver removeworker 2"`
  );
  await runDockerCommand(
    `docker exec signserver sh -c "/opt/keyfactor/signserver/bin/signserver removeworker 1"`
  );
  await runDockerCommand(
    `docker exec signserver sh -c "
    /opt/keyfactor/signserver/bin/signserver setproperty 1 KEYSTOREPATH  ${PATH} && \
    /opt/keyfactor/signserver/bin/signserver setproperty 1 KEYSTOREPASSWORD ${KEYSTORE_PASSWORD} && \
    /opt/keyfactor/signserver/bin/signserver setproperty 1 DEFAULTKEY "signer00003" && \
    /opt/keyfactor/signserver/bin/signserver reload 1"`
  );

  console.log("sleep for 3 sec ");
  await sleep(5000); // sleep for 2 seconds

  await runDockerCommand(
    `docker exec signserver sh -c "/opt/keyfactor/signserver/bin/signserver setproperties /opt/keyfactor/signserver/doc/sample-configs/pdfsigner.properties && \
    /opt/keyfactor/signserver/bin/signserver setproperty 2 DEFAULTKEY "signer00003" && \
    /opt/keyfactor/signserver/bin/signserver setproperty 2 ADD_VISIBLE_SIGNATURE false && \
    /opt/keyfactor/signserver/bin/signserver setproperty 2 WATERMARK_IMAGE_PATH \"/opt/keyfactor/signserver/watermark.png\" && \
    /opt/keyfactor/signserver/bin/signserver setproperty 2 WATERMARK_OPACITY \"0.5\" && \
    /opt/keyfactor/signserver/bin/signserver setproperty 2 WATERMARK_POSITION \"CENTER\" && \
    /opt/keyfactor/signserver/bin/signserver setproperty 2 WATERMARK_PAGE_SPECIFICATION \"ALL\" && \
    /opt/keyfactor/signserver/bin/signserver setproperty 2 WATERMARK_SCALE \"0.5\" && \
    /opt/keyfactor/signserver/bin/signserver reload 2"`
  );
  console.log("sleep for 3 sec ");

  await sleep(5000); // sleep for 2 seconds

  // 3. Upload the certificate from CryptoToken to the PDFSigner
  await runDockerCommand(
    `docker exec signserver /opt/keyfactor/signserver/bin/signserver uploadcertificate 2 signer00003`
  );

  await sleep(5000); // sleep for 2 seconds

  // 4. (Optional) Reload the signer again to reflect the certificate
    await runDockerCommand(
      `docker exec signserver /opt/keyfactor/signserver/bin/signserver reload 2`
    );
  } catch (error) {
    console.error("❌ Error creating crypto token:", error);
    Sentry.captureException(error, {
      tags: {
        service: "signserver",
        operation: "create_crypto_token",
      },
      contexts: {
        signserver: {
          keystore_path: PATH,
        },
      },
    });
    throw error;
  }
};
