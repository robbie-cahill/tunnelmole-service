import { findBySubdomain } from "../repository/reserved-subdomain-repository";
import { reserveDomain } from "./reserved-domain";

jest.mock("../repository/reserved-subdomain-repository");
const mockedFindBySubdomain = findBySubdomain as jest.MockedFunction<typeof findBySubdomain>;

describe("reserveDomain", () => {
    it("should return true if domain is reserved successfully", async () => {
        mockedFindBySubdomain.mockResolvedValue(undefined);

        const reservedDomain = { apiKey: "test-api-key", subdomain: "example" };
        const result = await reserveDomain(reservedDomain);
        expect(result).toBe(true);
    });

    it("should return false if the domain is already reserved by a different apiKey", async () => {
        mockedFindBySubdomain.mockResolvedValue({ apiKey: "other-api-key", subdomain: "example" });

        const reservedDomain = { apiKey: "test-api-key", subdomain: "example" };
        const result = await reserveDomain(reservedDomain);
        expect(result).toBe(false);
    });
});

afterEach(() => {
    jest.resetAllMocks();
});