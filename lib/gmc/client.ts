const BASE_URL = "https://shoppingcontent.googleapis.com/content/v2.1";

export function merchantApiUrl(merchantId: string, path: string): string {
  return `${BASE_URL}/${merchantId}/${path}`;
}
