import type { AssessRequest, AssessResponse } from '@/types/api';

export async function assess(
  baseUrl: string,
  req: AssessRequest,
): Promise<AssessResponse> {
  const url = baseUrl.replace(/\/+$/, '') + '/assess';

  const formData = new FormData();
  formData.append('location', req.location);
  formData.append('budget', String(req.budget));
  formData.append('category', req.category);
  formData.append('community', req.community ?? 'SC');
  formData.append('annual_income', String(req.annual_income ?? 120000));
  formData.append('is_defaulter', String(req.is_defaulter ?? false));
  formData.append('moratorium_mode', req.moratorium_mode ?? 'SERVICED');

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
  } catch {
    throw new NetworkError();
  }

  if (response.status === 400) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(body.error ?? 'Bad request');
  }

  if (!response.ok) {
    throw new ApiError(`Server error (${response.status})`);
  }

  return response.json();
}

export class NetworkError extends Error {
  constructor() {
    super('NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}
