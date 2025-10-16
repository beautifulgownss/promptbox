import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.ABTEST_API_URL ?? 'http://127.0.0.1:8000/api/abtest';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const response = await axios.post(BACKEND_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 60_000,
    });

    return NextResponse.json(response.data, {
      status: response.status,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 502;
      const details =
        (error.response?.data as unknown) ?? error.message;

      return NextResponse.json(
        {
          error: 'Failed to reach PromptBox backend.',
          details,
        },
        { status },
      );
    }

    return NextResponse.json(
      {
        error: 'Unexpected error while proxying request.',
      },
      { status: 500 },
    );
  }
}
