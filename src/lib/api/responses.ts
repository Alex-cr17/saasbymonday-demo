import { NextResponse } from 'next/server';

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, { status: 200, ...init });
}

export function created<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, { status: 201, ...init });
}

export function notFound(message: string, init?: ResponseInit) {
  return NextResponse.json(
    { error: { code: 'NOT_FOUND', message } },
    { status: 404, ...init },
  );
}

export function fail(
  code: string,
  message: string,
  status: number,
  init?: ResponseInit,
) {
  return NextResponse.json(
    { error: { code, message } },
    { status, ...init },
  );
}