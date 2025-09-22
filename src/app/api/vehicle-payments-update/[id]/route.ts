export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const id = pathSegments[pathSegments.length - 1];
  return NextResponse.json({ message: '동적 라우트 인식됨', id, path: url.pathname  });
}
import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://port-0-nsa-app-api-m6ojom0b30d70444.sel4.cloudtype.app';

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    const body = await request.text();

    const headers: Record<string, string> = {};
    const authHeader = request.headers.get('authorization');
    const contentType = request.headers.get('content-type');

    if (authHeader) headers.authorization = authHeader;
    if (contentType) headers['content-type'] = contentType;

  const targetUrl = `${API_BASE}/api/nsa-app-vehicle-bid/payments/${id}`;
    console.log('[프록시 PUT] 요청 id:', id);
    console.log('[프록시 PUT] 외부 API 이거뭐 나오나?경로:', targetUrl);
    console.log('[프록시 PUT] 요청 body:', body);

    const response = await fetch(targetUrl, {
      method: 'PUT',
      headers,
      body,
    });

    console.log('[프록시 PUT] 외부 API 응답 상태:', response.status, response.statusText);

    const data = await response.text();

    if (!response.ok) {
      console.error('[프록시 PUT] 외부 API 에러 뻐킹 응답:', data);
    }

    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('[프록시 PUT] 처리 중 에러:', error);
    return NextResponse.json(
      { error: 'Proxy request failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
