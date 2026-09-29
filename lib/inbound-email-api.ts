export type ErrorResponse = {
  success: false;
  message: string;
};

export type CreatedInbox = {
  session: {
    token: string;
    expiresAt: string;
  };
  id: string;
  address: string;
  token: string;
  expiresAt: string;
};

export type CreateInboxResponse = {
  success: true;
  data: CreatedInbox;
};

export type SessionInfo = {
  createdAt: string;
  expiresAt: string;
  lastExtendedAt: string | null;
  inboxCount: number;
};

export type SessionInboxSummary = {
  address: string;
  localPart: string;
  domain: string;
  createdAt: string;
  expiresAt: string;
  messageCount: number;
};

export type StoredInboxCredentials = CreatedInbox & {
  sessionToken: string;
  sessionExpiresAt: string;
  inboxToken: string;
  inboxExpiresAt: string;
};

export type InboxInfo = {
  address: string;
  localPart: string;
  extendCount: number;
  domain: string;
  createdAt: string;
  expiresAt: string;
  message: Record<string, never>;
};

export type InboxMessageSummary = {
  id: string;
  subject: string | null;
  fromName: string | null;
  fromAddress: string;
  toAddress: string;
  isRead: boolean;
  status: 'PENDING' | 'PARSED' | 'FAILED';
  receivedAt: string;
  expiresAt: string;
  attachmentCount: number;
};

export type InboxMessagesResponse = {
  success: true;
  message: string;
  data: { messages: InboxMessageSummary[] };
};

type ApiResponse<T> = T | ErrorResponse;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:9001';

class InboundEmailApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'InboundEmailApiError';
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...init?.headers,
      },
    });
  } catch {
    throw new InboundEmailApiError('Unable to reach the inbound email service.', 0);
  }

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;
  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload !== null && 'message' in payload
        ? payload.message
        : 'Request failed.';
    throw new InboundEmailApiError(message, response.status);
  }

  return payload as T;
}

function bearer(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export const inboundEmailApi = {
  createInbox() {
    return request<CreateInboxResponse>('/api/v1/inbox', { method: 'POST' });
  },

  getInboxInfo(token: string) {
    return request<{ success: true; message: string; data: InboxInfo }>('/api/v1/inbox/info', {
      headers: bearer(token),
    });
  },

  extendInbox(token: string) {
    return request<{ success: true; message: string }>('/api/v1/inbox/extend', {
      method: 'PATCH',
      headers: bearer(token),
    });
  },

  getMessages(token: string) {
    return request<InboxMessagesResponse>('/api/v1/inbox/messages', {
      headers: bearer(token),
    });
  },

  getMessage(token: string, id: string) {
    return request<{ success: true; message: string; data: unknown }>(`/api/v1/inbox/messages/${id}`, {
      headers: bearer(token),
    });
  },

  markMessageRead(token: string, id: string) {
    return request<{ success: true; message: string }>(`/api/v1/inbox/messages/${id}/read`, {
      headers: bearer(token),
    });
  },

  getUnreadMessages(token: string) {
    return request<{ success: true; message: string; data: unknown[] }>('/api/v1/inbox/messages/unread/all', {
      headers: bearer(token),
    });
  },

  getSessionInfo(sessionToken: string) {
    return request<{ success: true; message: string; data: SessionInfo }>('/api/v1/session', {
      headers: bearer(sessionToken),
    });
  },

  getSessionInboxes(sessionToken: string) {
    return request<{ success: true; message: string; data: { inboxes: SessionInboxSummary[] } }>('/api/v1/session/inboxes', {
      headers: bearer(sessionToken),
    });
  },
};

export { InboundEmailApiError };