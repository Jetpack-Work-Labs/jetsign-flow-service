import { exec } from "child_process";
import { execSync } from "child_process"; // Use execSync for simplicity
export function runDockerCommand(command: string) {
  try {
    // const output = exec(command, { encoding: "utf8" });
    const output = execSync(command, { encoding: "utf8", stdio: "pipe" });
    console.log(`Docker Command Output: ${output}`);
    return output;
  } catch (error) {
    console.error(`Error executing Docker command: ${error}`);
    throw error;
  }
}

export const createP12Docker = async (p12: string) => {
  const fileName = p12.split("/").reverse()[0];
  const fullPath = `/opt/keyfactor/signserver/res/certificates/${fileName}`;
  await runDockerCommand(
    `docker exec signserver mkdir -p /opt/keyfactor/signserver/res/certificates/ `
  );
  await runDockerCommand(`docker cp ${p12} signserver:${fullPath}`);
  return fullPath;
};
