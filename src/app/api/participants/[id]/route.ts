import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/apiBackend';

export async function PUT(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  const body = await _.json();
  const { id } = await context.params

  const data = await backendFetch(`/participants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

  return NextResponse.json(data);
}

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {

  const { id } = await context.params
  const data = await backendFetch(`/participants/${id}`, {
    method: 'DELETE',
  });

  return NextResponse.json(data);
}