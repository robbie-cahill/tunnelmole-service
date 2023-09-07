import { findBySubdomain, findSubdomainsNotBelongingToApiKey } from "../repository/reserved-subdomain-repository";
import { reserveDomain } from "./reserved-domain";

jest.mock("../repository/reserved-subdomain-repository");
const mockedFindBySubdomain = findBySubdomain as jest.MockedFunction<typeof findBySubdomain>;

const mockedFindSubdomainsNotBelongingToApiKey = findSubdomainsNotBelongingToApiKey as jest.MockedFunction<typeof findBySubdomain>;

describe("reserveDomain", () => {
    it("should return true if no other users own this subdomain", async () => {
        mockedFindBySubdomain.mockImplementation(async () => {
            return Promise.resolve(undefined);
        });

        mockedFindSubdomainsNotBelongingToApiKey.mockImplementation(async() => {
            return Promise.resolve(undefined);
        })

        const reservedDomain = { apiKey: "test-api-key", subdomain: "example" };
        const result = await reserveDomain(reservedDomain);
        expect(result).toBe(true);
    });

    it("should return false if the domain is already reserved by a different apiKey", async () => {
        mockedFindSubdomainsNotBelongingToApiKey.mockImplementation(async () => {
            return Promise.resolve({ 
                apiKey: "other-api-key", 
                subdomain: "example" 
            });
        });

        const reservedDomain = { apiKey: "test-api-key", subdomain: "example" };
        const result = await reserveDomain(reservedDomain);
        expect(result).toBe(false);
    });
});

afterEach(() => {
    jest.resetAllMocks();
});