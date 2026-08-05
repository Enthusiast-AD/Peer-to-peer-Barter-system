export const SITE_NAME = "Peersy";
export const SITE_URL = "https://peersy.vercel.app";
export const SITE_DEFAULT_TITLE = "Peersy - Free Student Skill Exchange & Barter Platform";
export const SITE_DESCRIPTION =
  "Peersy is a free peer-to-peer skill exchange platform for students. Teach skills you know, earn credits, and learn new skills from real experts through live video sessions.";
export const SITE_DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
export const SITE_LOCALE = "en_US";
export const SITE_TWITTER_HANDLE = "@peersy";

export function siteTitle(title: string): string {
  return title ? `${title} | ${SITE_NAME}` : SITE_DEFAULT_TITLE;
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}
