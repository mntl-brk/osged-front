import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/apiBackend';

//get
export async function GET() {
  const data = await backendFetch('/participants/');
  return NextResponse.json(data);
}

//create
export async function POST() {
  const data = await backendFetch('/participants/create', {
    method: 'POST',
    body: JSON.stringify({ status: 'unused' }),
  });

  return NextResponse.json(data);
}

