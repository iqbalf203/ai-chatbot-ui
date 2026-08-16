import type {
  SignUpRequest,
  SignInRequest,
  User,
} from "../types/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000";

export class AuthAPIError extends Error {
  detail: string;
  status: number;

  constructor(
    detail: string,
    status: number
  ) {
    super(detail);

    this.name = "AuthAPIError";
    this.detail = detail;
    this.status = status;
  }
}

interface SignUpResponse {
  user: User;
}

interface SignInResponse {
  access_token: string;
  token_type: string;
}

async function parseError(
  response: Response
): Promise<string> {
  try {
    const data = await response.json();

    if (typeof data?.detail === "string") {
      return data.detail;
    }

    return "Request failed";
  } catch {
    return (
      response.statusText ||
      "Request failed"
    );
  }
}

async function signUp(
  request: SignUpRequest
): Promise<SignUpResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/signup`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const detail =
      await parseError(response);

    throw new AuthAPIError(
      detail,
      response.status
    );
  }

  return response.json();
}

async function signIn(
  request: SignInRequest
): Promise<SignInResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const detail =
      await parseError(response);

    throw new AuthAPIError(
      detail,
      response.status
    );
  }

  return response.json();
}

async function getMe(
  token: string
): Promise<User> {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/me`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const detail =
      await parseError(response);

    throw new AuthAPIError(
      detail,
      response.status
    );
  }

  return response.json();
}

export const authAPI = {
  signUp,
  signIn,
  getMe,
};