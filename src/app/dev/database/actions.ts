'use server';

/**
 * @fileOverview Server Action untuk melakukan pemantauan kesehatan (health check) 
 * pada endpoint eksternal tanpa batasan CORS browser.
 */

export interface HealthCheckResult {
  status: 'Operational' | 'Unstable' | 'Offline';
  httpCode: number;
  latency: number;
}

export async function checkEndpointHealth(url: string): Promise<HealthCheckResult> {
  if (!url) {
    return { status: 'Offline', httpCode: 0, latency: 0 };
  }

  const start = Date.now();
  try {
    // Melakukan request ke endpoint dengan timeout singkat
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 8000); // 8 detik timeout

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'STSPoint-Audit-Bot/1.0',
      },
      next: { revalidate: 0 }, // Hindari caching agar data selalu fresh
      signal: controller.signal
    });

    clearTimeout(id);
    const latency = Date.now() - start;

    return {
      status: response.status >= 500 ? 'Unstable' : 'Operational',
      httpCode: response.status,
      latency: latency,
    };
  } catch (error: any) {
    const latency = Date.now() - start;
    // Jika timeout atau gagal koneksi
    return {
      status: 'Offline',
      httpCode: error.name === 'AbortError' ? 408 : 502,
      latency: latency,
    };
  }
}
