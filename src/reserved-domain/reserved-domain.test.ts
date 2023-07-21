import { addReservedDomain, findBySubdomain } from "../repository/reserved-subdomain-repository";
import { reserveDomain } from "./reserved-domain";

jest.mock('../repository/reserved-subdomain-repository');
const mockFindBySubdomain = findBySubdomain as jest.MockedFunction<typeof findBySubdomain>;

describe("Reserved Domain Tests", () => {
    it ("Should return false if a domain has already been taken by another api key", async () => {
        mockFindBySubdomain.mockResolvedValue(undefined);

        const result = reserveDomain({
            apiKey: 'fake-api-key',
            subdomain: 'mydomain'
        });

        expect(mockFindBySubdomain).toBeCalledTimes(1);
        expect(result).toBe(false);
    })
});

afterEach(() => {
    jest.resetAllMocks();
});