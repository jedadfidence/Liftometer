import type { GadsAccount } from "@/lib/types";

interface UserTokens {
  gadsAccounts: GadsAccount[];
  oaiToken?: string;
}

const store = new Map<string, UserTokens>();

function getOrCreate(userId: string): UserTokens {
  if (!store.has(userId)) {
    store.set(userId, { gadsAccounts: [] });
  }
  return store.get(userId)!;
}

export function addGadsAccount(userId: string, account: GadsAccount): void {
  const tokens = getOrCreate(userId);
  const existing = tokens.gadsAccounts.findIndex((a) => a.customerId === account.customerId);
  if (existing >= 0) {
    tokens.gadsAccounts[existing] = account;
  } else {
    tokens.gadsAccounts.push(account);
  }
}

export function getGadsAccounts(userId: string): GadsAccount[] {
  return store.get(userId)?.gadsAccounts ?? [];
}

export function removeGadsAccount(userId: string, customerId: string): void {
  const tokens = store.get(userId);
  if (!tokens) return;
  tokens.gadsAccounts = tokens.gadsAccounts.filter((a) => a.customerId !== customerId);
}

export function setOaiToken(userId: string, token: string): void {
  const tokens = getOrCreate(userId);
  tokens.oaiToken = token;
}

export function getOaiToken(userId: string): string | undefined {
  return store.get(userId)?.oaiToken;
}

export function clearUserTokens(userId: string): void {
  store.delete(userId);
}
