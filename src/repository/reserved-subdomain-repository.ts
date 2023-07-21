import { escape } from "mysql2";
import ReservedDomain from "../model/reserved-domain";
import { getConnection } from "../mysql/connection";

const RESERVED_DOMAINS = 'reserved_domains'

const findBySubdomain = async (subdomain: string): Promise<ReservedDomain|undefined> => {
    const connection = getConnection();
    const result = await connection.execute(`
        SELECT * FROM ${RESERVED_DOMAINS} 
        WHERE subdomain = '${subdomain}'
    `);
    
    return Promise.resolve(result[0]);
}

const addReservedDomain = async (reservedDomain: ReservedDomain) => {
    const connection = getConnection();
    await connection.execute(`
        INSERT INTO ${RESERVED_DOMAINS} (apiKey, subdomain)
        VALUES (
            '${escape(reservedDomain.apiKey)}',
            '${escape(reservedDomain.subdomain)}'
        )
    `);
}

export {
    findBySubdomain,
    addReservedDomain
}