import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/apiBackend';

export async function PUT(
  _: Request,
  { params }: { params: { id: string } }
) {
  const body = await _.json();

  const data = await backendFetch(`/participants/${params.id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

  return NextResponse.json(data);
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  await backendFetch(`/participants/${params.id}`, {
    method: 'DELETE',
  });

  return NextResponse.json({ ok: true });
}