const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const resolveUrl = (path: string) => {
  if (API_BASE_URL) {
    return `${API_BASE_URL.replace(/\/$/, '')}${path}`;
  }
  return path;
};

export const fetchMembershipTypes = async () => {
  const response = await fetch(resolveUrl('/api/membership-types'));

  if (!response.ok) {
    throw new Error('Failed to load membership types');
  }

  const body = await response.json();
  return body.data ?? [];
};

interface SubmitRegistrationOptions {
  payload: Record<string, unknown>;
  profilePhoto?: File | null;
}

export const submitRegistration = async ({ payload, profilePhoto }: SubmitRegistrationOptions) => {
  const formData = new FormData();
  formData.append('payload', JSON.stringify(payload));

  if (profilePhoto) {
    formData.append('profilePhoto', profilePhoto);
  }

  const response = await fetch(resolveUrl('/api/registrations'), {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || 'Failed to save registration');
  }

  return response.json();
};
