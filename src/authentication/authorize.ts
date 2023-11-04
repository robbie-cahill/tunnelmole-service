import fs from 'fs';
import { ROOT_DIR } from '../../constants';

const authorize = async(apiKey: string) : Promise<boolean> => {
    const apiKeys = JSON.parse(fs.readFileSync(ROOT_DIR + "/src/authentication/apiKeys.json").toString());

    const apiKeyRecord = apiKeys.find((record: any) => {
        return record.apiKey == apiKey;
    });

    if (typeof apiKeyRecord !== 'undefined') {
        return true;
    }

    return false;
}

export {
    authorize
}