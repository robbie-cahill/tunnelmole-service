import { getConnection } from "./connection";

const runPreparedStatement = async(sql: string, paramaters: any[]) => {
    const connection = await getConnection();

    try {
        return await connection.execute(sql, paramaters);
    } catch (error) {
        console.error("Mysql Query Error:");
        console.error(error);
    }
};

export { runPreparedStatement }