import { escape } from "mysql2";
import connection from "../mysql/connection";
import ReservedDomain from "../model/reserved-domain";

const RESERVED_DOMAINS = 'reserved_domains'

const findBySubdomain = async (subdomain: string): Promise<ReservedDomain|undefined> => {
    const result = await connection.execute(`
        SELECT * FROM ${RESERVED_DOMAINS} 
        WHERE subdomain = '${subdomain}'
    `);
    
    return Promise.resolve(result[0]);
}

const addReservedDomain = async (reservedDomain: ReservedDomain) => {
    await connection.execute(`
        INSERT INTO ${RESERVED_DOMAINS} (apiKey, subdomain)
        VALUES (
            '${escape(reservedDomain.apiKey)}',
            '${escape(reservedDomain.subdomian)}'
        )
    `);
}

export {
    findBySubdomain,
    addReservedDomain
}