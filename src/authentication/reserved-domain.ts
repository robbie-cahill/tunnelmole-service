// Hardcode to 100 to prevent abuse
const getDomainLimit = async (apiKey: string): Promise<number> => {
    return 100;
}

export {
    getDomainLimit
}