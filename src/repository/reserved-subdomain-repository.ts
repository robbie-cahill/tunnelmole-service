import ReservedDomain from "../model/reserved-domain";
import { runPreparedStatement } from "../mysql/run-prepared-statement";

const RESERVED_DOMAINS = 'reserved_domains'

// Find subdomains not belonging to a specific apiKey
const findSubdomainsNotBelongingToApiKey = async (apiKey: string, subdomain: string): Promise<ReservedDomain | undefined> => {
    try {
        const [rows]: any = await runPreparedStatement(
            `
            SELECT * FROM ${RESERVED_DOMAINS}
            WHERE subdomain = ? AND apiKey <> ?
            `,
            [subdomain, apiKey]
        );
        return rows[0] ?? undefined;
    } catch (error) {
        console.error('Failed to find subdomains not belonging to apiKey:', error);
        throw error; // Ensure the caller can handle the error
    }
};

// Find by subdomain
const findBySubdomain = async (subdomain: string): Promise<ReservedDomain | undefined> => {
    try {
        const [rows]: any = await runPreparedStatement(
            `
            SELECT * FROM ${RESERVED_DOMAINS}
            WHERE subdomain = ?
            `,
            [subdomain]
        );
        return rows[0] ?? undefined;
    } catch (error) {
        console.error('Failed to find by subdomain:', error);
        throw error; // Ensure the caller can handle the error
    }
};

// Count reserved domains by apiKey
const countReservedDomainsByApiKey = async (apiKey: string): Promise<number> => {
    try {
        const [rows]: any = await runPreparedStatement(
            `
            SELECT COUNT(*) AS reservedDomainsCount FROM ${RESERVED_DOMAINS}
            WHERE apiKey = ?
            `,
            [apiKey]
        );
        return rows[0].reservedDomainsCount ?? 0;
    } catch (error) {
        console.error('Failed to count reserved domains by apiKey:', error);
        throw error; // Ensure the caller can handle the error
    }
};

// Add a reserved domain
const addReservedDomain = async (reservedDomain: ReservedDomain) => {
    const existingReservedDomain = await findBySubdomain(reservedDomain.subdomain);
    if (existingReservedDomain !== undefined) {
        return;
    }

    await runPreparedStatement(
        `
        INSERT INTO ${RESERVED_DOMAINS} (apiKey, subdomain)
        VALUES (?, ?)
        `,
        [reservedDomain.apiKey, reservedDomain.subdomain]
    );
};

/**
 * Delete the reserved domain only if the apiKey and subdomain have a matching record
 *
 * @param apiKey
 * @param subdomain
 */
const deleteReservedDomain = async (apiKey: string, subdomain: string): Promise<void> => {
    await runPreparedStatement(
        `
        DELETE FROM ${RESERVED_DOMAINS}
        WHERE apiKey = ? AND subdomain = ?
        `,
        [apiKey, subdomain]
    );
};


export {
    findBySubdomain,
    findSubdomainsNotBelongingToApiKey,
    countReservedDomainsByApiKey,
    addReservedDomain,
    deleteReservedDomain
}