import { escape } from "mysql2";
import ReservedDomain from "../model/reserved-domain";
import { getConnection } from "../mysql/connection";

const RESERVED_DOMAINS = 'reserved_domains'

const findBySubdomain = async (subdomain: string): Promise<ReservedDomain|undefined> => {
    const connection = getConnection();
    const sql = `
        SELECT * FROM ${RESERVED_DOMAINS} 
        WHERE subdomain = ${escape(subdomain)}
    `;
    const result = await connection.execute(sql);

    return Promise.resolve(result[0]);
}

const addReservedDomain = async (reservedDomain: ReservedDomain) => {
    const connection = getConnection();
    const sql = `
        INSERT INTO ${RESERVED_DOMAINS} (apiKey, subdomain)
        VALUES (
            ${escape(reservedDomain.apiKey)},
            ${escape(reservedDomain.subdomain)}
        )
    `;
    await connection.execute(sql);
}

export {
    findBySubdomain,
    addReservedDomain
}