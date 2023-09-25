import { findBySubdomain, findSubdomainsNotBelongingToApiKey } from "../repository/reserved-subdomain-repository";
import { DOMAIN_ALREADY_RESERVED, SUCCESS, reserveDomain } from "./reserved-domain";

jest.mock("../repository/reserved-subdomain-repository");
const mockedFindBySubdomain = findBySubdomain as jest.MockedFunction<typeof findBySubdomain>;

const mockedFindSubdomainsNotBelongingToApiKey = findSubdomainsNotBelongingToApiKey as jest.MockedFunction<typeof findBySubdomain>;

describe("reserveDomain", () => {
    it("should return success if no other users own this subdomain", async () => {
        mockedFindBySubdomain.mockImplementation(async () => {
            return Promise.resolve(undefined);
        });

        mockedFindSubdomainsNotBelongingToApiKey.mockImplementation(async() => {
            return Promise.resolve(undefined);
        })

        const reservedDomain = { apiKey: "test-api-key", subdomain: "example" };
        const result = await reserveDomain(reservedDomain);
        expect(result).toBe(SUCCESS);
    });

    it("should return an error if the domain is already reserved by a different apiKey", async () => {
        mockedFindSubdomainsNotBelongingToApiKey.mockImplementation(async () => {
            return Promise.resolve({ 
                apiKey: "other-api-key", 
                subdomain: "example" 
            });
        });

        const reservedDomain = { apiKey: "test-api-key", subdomain: "example" };
        const result = await reserveDomain(reservedDomain);
        expect(result).toBe(DOMAIN_ALREADY_RESERVED);
    });
});

afterEach(() => {
    jest.resetAllMocks();
});