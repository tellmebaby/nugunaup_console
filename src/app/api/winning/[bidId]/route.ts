import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://port-0-nsa-app-api-m6ojom0b30d70444.sel4.cloudtype.app';

export async function GET(
  request: NextRequest,
  { params }: { params: { bidId: string } }
) {
  console.log('Winning API 호출됨:', params.bidId);
  
  try {
    const bidId = params.bidId;
    const url = `${API_BASE}/api/winning/${bidId}`;
    
    console.log('외부 API 호출:', url);
    
    // 원본 요청에서 인증 헤더 가져오기
    const headers: Record<string, string> = {};
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers.authorization = authHeader;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    console.log('외부 API 응답:', response.status, response.statusText);

    if (!response.ok) {
      return NextResponse.json(
        { error: `External API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Winning API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
