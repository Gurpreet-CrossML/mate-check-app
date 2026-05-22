import { config } from './config';

export type ConnectionDetails = {
  token: string;
  url: string;
  roomName: string;
  identity: string;
};

/**
 * Ask the token server for a fresh LiveKit token + connection details.
 */
export async function fetchConnectionDetails(): Promise<ConnectionDetails> {
  const res = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Token request failed (${res.status}): ${text || res.statusText}`);
  }

  const data = (await res.json()) as Partial<ConnectionDetails>;
  if (!data.token || !data.url) {
    throw new Error('Token server response is missing `token` or `url`.');
  }

  return data as ConnectionDetails;
}
