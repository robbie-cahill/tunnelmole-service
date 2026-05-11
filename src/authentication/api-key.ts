import fs from 'fs';
import { ROOT_DIR } from '../../constants';

interface ApiKeyRecord {
    apiKey: string
}

const loadApiKeys = (): ApiKeyRecord[] => {
    return JSON.parse(fs.readFileSync(ROOT_DIR + "/src/authentication/apiKeys.json").toString());
}

const isAuthorizedApiKey = (apiKey: string | undefined): boolean => {
    if (!apiKey) {
        return false;
    }

    const apiKeys = loadApiKeys();

    return apiKeys.some((record: ApiKeyRecord) => {
        return record.apiKey == apiKey;
    });
}

export {
    isAuthorizedApiKey
}
