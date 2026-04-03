/**
 * Auth Callback Route
 * ====================
 * Firebase doesn't use server-side callbacks like Supabase.
 * This route exists as a fallback redirect — redirects to dashboard.
 */

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/dashboard`);
}
