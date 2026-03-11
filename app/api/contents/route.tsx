import { supabaseAdmin } from "@/utils/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabaseAdmin.from("contents").select("*");
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { url, type } = await request.json();
  const { error } = await supabaseAdmin.from("contents").insert({ url, type });
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ success: true });
}
