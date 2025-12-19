import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/db";

export async function GET() {
  await dbConnect();
  return NextResponse.json({ status: "OK" });
}
