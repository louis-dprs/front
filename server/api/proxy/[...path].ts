import { defineEventHandler, getQuery, readBody, setResponseStatus } from "h3";

import { ensureValidAccessToken } from "../../utils/auth-tokens";

interface ProxyError {
  status?: number;
  response?: { status?: number; _data?: unknown };
  message?: string;
  data?: unknown;
}

function normalizeBodyForFetch(
  body: unknown,
  headers: Record<string, string>
): BodyInit | undefined {
  if (body == null) return undefined;
  if (typeof body === "string") return body;
  // Default: JSON-encode plain objects and set content-type if not already defined
  if (!headers["Content-Type"]) headers["Content-Type"] = "application/json";
  try {
    return JSON.stringify(body);
  } catch {
    // As a last resort, drop the body to avoid sending invalid payloads
    return undefined;
  }
}

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event);
  const apiBase = runtimeConfig.public?.apiBase as string | undefined;
  if (!apiBase) {
    setResponseStatus(event, 500);
    return { error: "Missing runtimeConfig.public.apiBase" };
  }

  // Extract the proxied path
  const params = event.context.params as
    | { path?: string | string[] }
    | undefined;
  let pathSegments = params?.path ?? [];
  if (typeof pathSegments === "string") pathSegments = [pathSegments];
  const subPath = pathSegments.join("/");

  // Build target URL (ensure single slash between base and path)
  const target = `${apiBase.replace(/\/+$/, "")}/${subPath}`;

  // Try to get an access token from session. If missing, do not block:
  // let the backend decide (401/403). This makes public endpoints easy to test.
  const accessToken = await ensureValidAccessToken(event);

  // Prepare request options
  const method = (event.method || "GET").toUpperCase() as
    | "GET"
    | "POST"
    | "PUT"
    | "DELETE"
    | "PATCH"
    | "HEAD"
    | "OPTIONS";
  const query = getQuery(event);
  let body: unknown = undefined;

  if (!["GET", "HEAD"].includes(method)) {
    body = await readBody(event);
  }

  try {
    const headers: Record<string, string> = {};
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
    const bodyForFetch = normalizeBodyForFetch(body, headers);
    const result = await $fetch(target, {
      method,
      headers,
      params: query,
      body: bodyForFetch,
    });
    return result;
  } catch (err: unknown) {
    const error = err as ProxyError;
    const status = error?.status || error?.response?.status || 500;
    setResponseStatus(event, status);
    try {
      // Attempt to return backend error payload when available
      if (error?.data) return error.data;
      if (error?.response?._data) return error.response._data;
    } catch {
      // ignore
    }
    return { error: error?.message || "Proxy request failed" };
  }
});
