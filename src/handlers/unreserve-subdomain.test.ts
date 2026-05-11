import unreserveSubdomain from "./unreserve-subdomain";
import { isAuthorizedApiKey } from "../authentication/api-key";
import { deleteReservedDomain } from "../repository/reserved-subdomain-repository";
import { OK_NO_CONTENT, UNAUTHORIZED } from "../http/status-codes";

jest.mock("../authentication/api-key");
jest.mock("../repository/reserved-subdomain-repository");

const mockedIsAuthorizedApiKey = isAuthorizedApiKey as jest.MockedFunction<typeof isAuthorizedApiKey>;
const mockedDeleteReservedDomain = deleteReservedDomain as jest.MockedFunction<typeof deleteReservedDomain>;

const createResponse = () => {
    return {
        status: jest.fn(),
        end: jest.fn()
    };
}

describe("unreserveSubdomain", () => {
    it("should reject requests with missing apiKey without deleting anything", async () => {
        mockedIsAuthorizedApiKey.mockReturnValue(false);
        const request = {
            body: Buffer.from(JSON.stringify({ subdomain: "example" }))
        };
        const response = createResponse();

        await unreserveSubdomain(request as any, response as any);

        expect(mockedIsAuthorizedApiKey).toHaveBeenCalledWith(undefined);
        expect(mockedDeleteReservedDomain).not.toHaveBeenCalled();
        expect(response.status).toHaveBeenCalledWith(UNAUTHORIZED);
        expect(response.end).toHaveBeenCalled();
    });

    it("should reject requests with invalid apiKey without deleting anything", async () => {
        mockedIsAuthorizedApiKey.mockReturnValue(false);
        const request = {
            body: Buffer.from(JSON.stringify({ apiKey: "invalid-key", subdomain: "example" }))
        };
        const response = createResponse();

        await unreserveSubdomain(request as any, response as any);

        expect(mockedIsAuthorizedApiKey).toHaveBeenCalledWith("invalid-key");
        expect(mockedDeleteReservedDomain).not.toHaveBeenCalled();
        expect(response.status).toHaveBeenCalledWith(UNAUTHORIZED);
        expect(response.end).toHaveBeenCalled();
    });

    it("should delete the reserved subdomain for authorized apiKey", async () => {
        mockedIsAuthorizedApiKey.mockReturnValue(true);
        mockedDeleteReservedDomain.mockResolvedValue();
        const request = {
            body: Buffer.from(JSON.stringify({ apiKey: "valid-key", subdomain: "example" }))
        };
        const response = createResponse();

        await unreserveSubdomain(request as any, response as any);

        expect(mockedIsAuthorizedApiKey).toHaveBeenCalledWith("valid-key");
        expect(mockedDeleteReservedDomain).toHaveBeenCalledWith("valid-key", "example");
        expect(response.status).toHaveBeenCalledWith(OK_NO_CONTENT);
        expect(response.end).toHaveBeenCalled();
    });
});

afterEach(() => {
    jest.resetAllMocks();
});
