import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    upiId: 'bhusanrajlegend@oksbi',
    upiNumber: '7005814596',
    message: 'Help support the development and maintenance of this platform.'
  });
}
