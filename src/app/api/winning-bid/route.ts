import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://port-0-nsa-app-api-m6ojom0b30d70444.sel4.cloudtype.app';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const bidId = url.searchParams.get('bidId');
    
    if (!bidId) {
      return NextResponse.json(
        { error: 'bidId parameter is required' },
        { status: 400 }
      );
    }
    
    const apiUrl = `${API_BASE}/api/winning/${bidId}`;
    console.log('Winning API 호출:', apiUrl);
    
    // 원본 요청에서 인증 헤더 가져오기
    const headers: Record<string, string> = {};
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers.authorization = authHeader;
    }
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
    });
    
    console.log('외부 API 응답:', response.status, response.statusText);
    
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
    console.error('Winning API error:', error);
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
