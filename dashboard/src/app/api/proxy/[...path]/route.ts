import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { checkDashboardAccess } from '@/lib/dashboard-access';

// Use Docker service name in production, localhost in development
const API_URL = process.env.API_URL || (process.env.NODE_ENV === 'production' ? 'http://api:3000' : 'http://localhost:3000');

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
): Promise<NextResponse> {
  return handleProxyRequest(request, params, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
): Promise<NextResponse> {
  return handleProxyRequest(request, params, 'POST');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
): Promise<NextResponse> {
  return handleProxyRequest(request, params, 'PATCH');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
): Promise<NextResponse> {
  return handleProxyRequest(request, params, 'DELETE');
}

async function handleProxyRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication
    if (!session && process.env.SKIP_AUTH !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate accessToken is present
    if (process.env.SKIP_AUTH !== 'true' && session && !session.accessToken) {
      console.warn('Proxy request: Session exists but accessToken is missing', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
      });
      return NextResponse.json({ error: 'Session invalid. Please sign in again.' }, { status: 401 });
    }

    // Check dashboard access (unless SKIP_AUTH is enabled)
    // Only check if we have a valid session with accessToken
    if (process.env.SKIP_AUTH !== 'true' && session?.accessToken) {
      const hasAccess = await checkDashboardAccess();
      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied. Insufficient permissions.' }, { status: 403 });
      }
    }

    // Build the backend API URL
    const path = params.path.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${API_URL}/api/${path}${searchParams ? `?${searchParams}` : ''}`;

    // Forward the request to the backend
    const body = method !== 'GET' && method !== 'DELETE' ? await request.text() : undefined;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        // Pass auth headers if available
        ...(session?.accessToken && {
          Authorization: `Bearer ${session.accessToken}`,
          'X-User-Id': session.user?.discordId || session.user?.id || '',
        }),
      },
      body,
    });

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

