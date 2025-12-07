import { NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './auth';

/**
 * Middleware helper to protect API routes
 * Returns user payload if authenticated, or error response
 */
export async function authenticateRequest(
  request: Request
): Promise<{ user: JWTPayload } | NextResponse> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized - No token provided' },
      { status: 401 }
    );
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return NextResponse.json(
      { error: 'Unauthorized - Invalid token' },
      { status: 401 }
    );
  }

  return { user: payload };
}
