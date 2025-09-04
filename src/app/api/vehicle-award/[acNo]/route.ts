import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://port-0-nsa-app-api-m6ojom0b30d70444.sel4.cloudtype.app';

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const acNo = pathSegments[pathSegments.length - 1];
    const body = await request.text();
    
    const headers: Record<string, string> = {};
    const authHeader = request.headers.get('authorization');
    const contentType = request.headers.get('content-type');
    
    if (authHeader) headers.authorization = authHeader;
    if (contentType) headers['content-type'] = contentType;
    
    const response = await fetch(`${API_BASE}/api/nsa-app-vehicle-bid/${acNo}/award`, {
      method: 'POST',
      headers,
      body,
    });
    
    const data = await response.text();
    
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
