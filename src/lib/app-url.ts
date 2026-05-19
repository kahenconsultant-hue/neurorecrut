const LOCAL_APP_URL = "http://localhost:3000";

export function getAppUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || LOCAL_APP_URL;

  try {
    const url = new URL(rawUrl.trim());
    url.pathname = url.pathname.replace(/\/+$/, "");
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/+$/, "");
  } catch {
    return LOCAL_APP_URL;
  }
}
