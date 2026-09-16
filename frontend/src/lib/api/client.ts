import { env } from "@/lib/env";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  baseUrl?: string;
};

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, headers, baseUrl, ...rest } = options;

  const response = await fetch(`${baseUrl ?? env.NEXT_PUBLIC_API_URL}${path}`, {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    let code: string | undefined;
    try {
      const payload = (await response.json()) as {
        message?: string | string[];
        code?: string;
      };
      if (typeof payload.message === "string") {
        message = payload.message;
      } else if (Array.isArray(payload.message) && payload.message[0]) {
        message = payload.message[0];
      }
      code = payload.code;
    } catch {
      // keep fallback
    }
    throw new ApiError(message, response.status, code);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
