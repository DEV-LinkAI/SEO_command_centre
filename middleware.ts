import { NextResponse, type NextRequest } from 'next/server'

// Auth temporarily disabled for deployment stability
export async function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = { matcher: [] }
