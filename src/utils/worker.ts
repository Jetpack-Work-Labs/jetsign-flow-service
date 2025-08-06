import { runDockerCommand } from "./docker";

// Check if a worker exists using CLI
export async function checkWorkerExists({ worker }: { worker: string }) {
  if (!worker) {
    throw new Error("Worker ID or name must be provided");
  }
  const dockerCommand = `
    docker exec signserver sh -c "/opt/keyfactor/signserver/bin/signserver getstatus brief ${worker}"
  `.trim();
  try {
    const res = await runDockerCommand(dockerCommand);
    if (res.includes("Errors")) {
      return { exists: false };
    }
    return { exists: true };
  } catch (error) {
    return { exists: false };
  }
}
export async function activateAll() {
  const dockerCommand = `
    docker exec signserver sh -c "/opt/keyfactor/signserver/bin/signserver reload all"
  `.trim();
  try {
    const res = await runDockerCommand(dockerCommand);
    if (res.includes("Errors")) {
      return { exists: false };
    }
    return { exists: true };
  } catch (error) {
    return { exists: false };
  }
}

export async function CreateCryptoToken({
  workerId,
  token_name,
  KEYSTOREPATH,
  KEYSTOREPASSWORD,
  DEFAULTKEY,
}: {
  workerId: number | string;
  token_name: string;
  KEYSTOREPATH: string;
  KEYSTOREPASSWORD: string;
  DEFAULTKEY: string;
}) {
  await runDockerCommand(
    `docker exec signserver sh -c "/opt/keyfactor/signserver/bin/signserver removeworker ${workerId}"`
  );
  const dockerCommand = `
  docker exec signserver sh -c "
/opt/keyfactor/signserver/bin/signserver setproperty ${workerId} NAME "${token_name}" && \
/opt/keyfactor/signserver/bin/signserver setproperty ${workerId} TYPE \"CRYPTO_WORKER"\ && \
/opt/keyfactor/signserver/bin/signserver setproperty ${workerId} KEYSTORETYPE \"PKCS12"\ && \
/opt/keyfactor/signserver/bin/signserver setproperty ${workerId} IMPLEMENTATION_CLASS \"org.signserver.server.signers.CryptoWorker"\ && \
/opt/keyfactor/signserver/bin/signserver setproperty ${workerId} CRYPTOTOKEN_IMPLEMENTATION_CLASS \"org.signserver.server.cryptotokens.KeystoreCryptoToken"\ && \
/opt/keyfactor/signserver/bin/signserver setproperty ${workerId} KEYSTOREPATH "${KEYSTOREPATH}" && \
/opt/keyfactor/signserver/bin/signserver setproperty ${workerId} KEYSTOREPASSWORD "${KEYSTOREPASSWORD}" && \
/opt/keyfactor/signserver/bin/signserver setproperty ${workerId} DEFAULTKEY "${DEFAULTKEY}" && \
/opt/keyfactor/signserver/bin/signserver setproperty ${workerId} AUTOACTIVATE \"true\" && \
/opt/keyfactor/signserver/bin/signserver reload ${workerId}"
  `.trim();
  try {
    console.log(`Executing: ${dockerCommand}`);
    const output = runDockerCommand(dockerCommand);
    console.log({ output });
    return true;
  } catch (error) {
    return true;
  }
}

export async function createPdfWOrker({
  workerId,
  token_name,
  DEFAULTKEY,
}: {
  workerId: number | string;
  token_name: string;
  DEFAULTKEY: string;
}) {
  await runDockerCommand(
    `docker exec signserver sh -c "/opt/keyfactor/signserver/bin/signserver removeworker ${workerId}"`
  );
  const dockerCommand = `
docker exec signserver sh -c "
/opt/keyfactor/signserver/bin/signserver setproperty ${workerId} TYPE "PROCESSABLE" && \
/opt/keyfactor/signserver/bin/signserver setproperty ${workerId} IMPLEMENTATION_CLASS "org.signserver.module.pdfsigner.PDFSigner" && \
/opt/keyfactor/signserver/bin/signserver setproperty ${workerId} NAME "${workerId}" && \
/opt/keyfactor/signserver/bin/signserver setproperty ${workerId} AUTHTYPE "NOAUTH" && \
/opt/keyfactor/signserver/bin/signserver setproperty ${workerId} CRYPTOTOKEN "${token_name}" && \
/opt/keyfactor/signserver/bin/signserver setproperty ${workerId} DEFAULTKEY "${DEFAULTKEY}" && \
/opt/keyfactor/signserver/bin/signserver setproperty ${workerId} LOCATION "Nepal" && \
/opt/keyfactor/signserver/bin/signserver setproperty ${workerId} DIGESTALGORITHM "SHA256" && \
/opt/keyfactor/signserver/bin/signserver setproperty ${workerId} WORKERCLASS "org.signserver.module.pdfsigner.PDFSigner" && \
/opt/keyfactor/signserver/bin/signserver setproperty ${workerId} ADD_VISIBLE_SIGNATURE false && \
/opt/keyfactor/signserver/bin/signserver reload ${workerId}"
  
  `.trim();
  try {
    console.log(`Executing: ${dockerCommand}`);
    const output = runDockerCommand(dockerCommand);
    console.log({ output });
    return true;
  } catch (error) {
    return true;
  }
}
