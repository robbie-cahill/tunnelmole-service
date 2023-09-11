import { getDomainLimit } from "../authentication/reserved-domain";
import ReservedDomain from "../model/reserved-domain";
import { 
    addReservedDomain, 
    countReservedDomainsByApiKey, 
    findSubdomainsNotBelongingToApiKey 
} from "../repository/reserved-subdomain-repository";

const DOMAIN_ALREADY_RESERVED = "domainAlreadyReserved";
const TOO_MANY_DOMAINS = "tooManyDomains";
const SUCCESS = "success";
const ERROR = "error";

/**
 * Reserve a subdomain and link it to an api key
 * 
 * Returns true on success or false on failure
 *  
 * @param reservedDomain 
 */
const reserveDomain = async(reservedDomain: ReservedDomain): Promise<string> => {
    const { apiKey, subdomain } = reservedDomain;

    // If there is an existing domain belonging to a different apiKey, do not reserve the domain
    const existingDomain = await findSubdomainsNotBelongingToApiKey(apiKey, subdomain);
    if (existingDomain) {
        return DOMAIN_ALREADY_RESERVED;
    } 

    // All good, now reserve the domain
    try {
        const domainCount = await countReservedDomainsByApiKey(apiKey);
        const domainLimit = await getDomainLimit(apiKey); // Hardcoded to 10 for now

        if (domainCount > domainLimit) {
            console.info(`API Key ${apiKey} has a limit of ${domainLimit} but tried to reserve ${domainCount} domains`);
            return TOO_MANY_DOMAINS;
        }

        await addReservedDomain(reservedDomain);
        return SUCCESS;
    } catch (error) {
        console.log(`Error reserving domain: ${JSON.stringify(error)}`)
        return ERROR;
    }
}

export { 
    DOMAIN_ALREADY_RESERVED,
    TOO_MANY_DOMAINS,
    SUCCESS,
    ERROR,
    reserveDomain 
}