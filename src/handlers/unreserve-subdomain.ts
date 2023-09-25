import { Request, Response } from "express";
import parseJson from "../express/parse-json";
import { deleteReservedDomain } from "../repository/reserved-subdomain-repository";
import { OK_NO_CONTENT } from "../http/status-codes";

interface UnReserveDomainRequest {
    apiKey: string
    subdomain: string
}

const unreserveSubdomain = async function(request : Request, response : Response) {
    const unReserveDomainRequest: UnReserveDomainRequest = parseJson(request.body);
    const { apiKey, subdomain } = unReserveDomainRequest;
    await deleteReservedDomain(apiKey, subdomain);
    response.status(OK_NO_CONTENT);
    response.end();
}

export default unreserveSubdomain;