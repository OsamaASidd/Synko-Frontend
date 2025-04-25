const api = process.env.NEXT_PUBLIC_BACKEND_API;
const adminURL = process.env.NEXT_PUBLIC_ADMIN_URL;
const posURL = process.env.NEXT_PUBLIC_POS_URL;
const kdsURL = process.env.NEXT_PUBLIC_KDS_URL;
const storeURL = process.env.NEXT_PUBLIC_STORE_URL;
const stripe_public_key = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL;
const googleAnalyticsApi = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_API;

export {
  api,
  storageUrl,
  stripe_public_key,
  adminURL,
  posURL,
  kdsURL,
  storeURL,
  googleAnalyticsApi,
};
