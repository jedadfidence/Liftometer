import type { GadsAccount } from "@/lib/types";

interface OaiConnection {
  token: string;
  name: string;
  maskedId: string;
}

export interface ActivityEntry {
  campaignName: string;
  action: "cloned" | "connected" | "disconnected";
  timestamp: string;
}

interface UserTokens {
  gadsAccounts: GadsAccount[];
  oai?: OaiConnection;
  activity: ActivityEntry[];
}

const store = new Map<string, UserTokens>();

function getOrCreate(userId: string): UserTokens {
  if (!store.has(userId)) {
    store.set(userId, { gadsAccounts: [], activity: [] });
  }
  return store.get(userId)!;
}

// --- GAds ---

export function addGadsAccount(userId: string, account: GadsAccount): void {
  const tokens = getOrCreate(userId);
  const existing = tokens.gadsAccounts.findIndex(
    (a) => a.customerId === account.customerId,
  );
  if (existing >= 0) {
    tokens.gadsAccounts[existing] = account;
  } else {
    tokens.gadsAccounts.push(account);
  }
}

export function getGadsAccounts(userId: string): GadsAccount[] {
  return store.get(userId)?.gadsAccounts ?? [];
}

export function removeGadsAccount(
  userId: string,
  customerId: string,
): void {
  const tokens = store.get(userId);
  if (!tokens) return;
  tokens.gadsAccounts = tokens.gadsAccounts.filter(
    (a) => a.customerId !== customerId,
  );
}

// --- OAI ---

function maskToken(token: string): string {
  if (token.length <= 8) return "****";
  return `${token.slice(0, 4)}...${token.slice(-4)}`;
}

export function setOaiToken(
  userId: string,
  token: string,
  name?: string,
): void {
  const tokens = getOrCreate(userId);
  tokens.oai = {
    token,
    name: name || "OpenAI Ads",
    maskedId: maskToken(token),
  };
}

export function getOaiToken(userId: string): string | undefined {
  return store.get(userId)?.oai?.token;
}

export function getOaiConnection(
  userId: string,
): OaiConnection | undefined {
  return store.get(userId)?.oai;
}

export function removeOaiConnection(userId: string): void {
  const tokens = store.get(userId);
  if (!tokens) return;
  tokens.oai = undefined;
}

export function clearUserTokens(userId: string): void {
  store.delete(userId);
}

// --- Activity ---

export function addActivity(userId: string, entry: Omit<ActivityEntry, "timestamp">): void {
  const tokens = getOrCreate(userId);
  tokens.activity.unshift({
    ...entry,
    timestamp: new Date().toISOString(),
  });
  if (tokens.activity.length > 20) {
    tokens.activity = tokens.activity.slice(0, 20);
  }
}

export function getActivity(userId: string): ActivityEntry[] {
  return store.get(userId)?.activity ?? [];
}
