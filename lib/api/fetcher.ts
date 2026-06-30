export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    const message = body?.error?.message ?? `Request failed (${res.status})`;
    throw Object.assign(new Error(message), { status: res.status });
  }
  return res.json() as Promise<T>;
}
