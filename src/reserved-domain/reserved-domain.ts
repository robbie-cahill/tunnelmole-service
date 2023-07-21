import ReservedDomain from "../model/reserved-domain";
import { addReservedDomain, findBySubdomain } from "../repository/reserved-subdomain-repository";

/**
 * Reserve a subdomain and link it to an api key
 * 
 * Returns true on success or false on failure
 *  
 * @param reservedDomain 
 */
const reserveDomain = async(apiKey: string, reservedDomain: ReservedDomain): Promise<boolean> => {
    // If there is an existing domain belonging to a different apiKey, do not reserve the domain
    const existingDomain = await findBySubdomain(apiKey);
    if (existingDomain !== undefined && existingDomain.apiKey !== apiKey) {
        return false;
    }

    // All good, now reserve the domain
    try {
        await addReservedDomain(reservedDomain);
        return true;
    } catch (error) {
        return false;
    }
}

export { reserveDomain }