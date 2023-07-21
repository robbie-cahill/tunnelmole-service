import fs from "fs";
import { ROOT_DIR } from "../../constants";
import config from "../../config";

export default async function authorize(apiKey: string): Promise<boolean> {
  if (config.server.apiKeys?.length) {
    return config.server.apiKeys.includes(apiKey);
  }
  try {
    const apiKeys = JSON.parse(
      fs.readFileSync(ROOT_DIR + "/src/authentication/apiKeys.json").toString(),
    );

    const apiKeyRecord = apiKeys.find((record: any) => {
      return record.apiKey == apiKey;
    });

    if (typeof apiKeyRecord !== "undefined") {
      return true;
    }
  } catch (error) {
    console.log("Failed to parse apiKeys.json", error.message);
  }

  return false;
}
