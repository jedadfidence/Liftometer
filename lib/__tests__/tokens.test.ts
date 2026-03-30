// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import { addGadsAccount, getGadsAccounts, removeGadsAccount, getOaiToken, setOaiToken, getOaiConnection, removeOaiConnection, clearUserTokens } from "@/lib/tokens";

describe("token store", () => {
  beforeEach(() => { clearUserTokens("user-1"); });

  it("stores and retrieves GAds accounts", () => {
    addGadsAccount("user-1", { customerId: "123-456-7890", name: "Test Account", accessToken: "access-token", refreshToken: "refresh-token" });
    const accounts = getGadsAccounts("user-1");
    expect(accounts).toHaveLength(1);
    expect(accounts[0].customerId).toBe("123-456-7890");
  });

  it("supports multiple GAds accounts per user", () => {
    addGadsAccount("user-1", { customerId: "111", name: "Account A", accessToken: "a", refreshToken: "a" });
    addGadsAccount("user-1", { customerId: "222", name: "Account B", accessToken: "b", refreshToken: "b" });
    expect(getGadsAccounts("user-1")).toHaveLength(2);
  });

  it("removes a GAds account", () => {
    addGadsAccount("user-1", { customerId: "111", name: "Account A", accessToken: "a", refreshToken: "a" });
    removeGadsAccount("user-1", "111");
    expect(getGadsAccounts("user-1")).toHaveLength(0);
  });

  it("returns empty array for unknown user", () => {
    expect(getGadsAccounts("unknown")).toEqual([]);
  });

  it("stores and retrieves OAI token", () => {
    setOaiToken("user-1", "oai-token-123");
    expect(getOaiToken("user-1")).toBe("oai-token-123");
  });

  it("stores OAI connection with name and masked ID", () => {
    setOaiToken("user-1", "oai-abcdefgh1234", "My OAI Account");
    const conn = getOaiConnection("user-1");
    expect(conn).toBeDefined();
    expect(conn!.name).toBe("My OAI Account");
    expect(conn!.maskedId).toBe("oai-...1234");
  });

  it("removes OAI connection", () => {
    setOaiToken("user-1", "oai-token-123");
    removeOaiConnection("user-1");
    expect(getOaiToken("user-1")).toBeUndefined();
    expect(getOaiConnection("user-1")).toBeUndefined();
  });

  it("returns undefined OAI token for unknown user", () => {
    expect(getOaiToken("unknown")).toBeUndefined();
  });
});
