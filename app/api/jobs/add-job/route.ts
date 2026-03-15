import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addJob } from "@/lib/notion";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    if (!data.title) {
      return NextResponse.json(
        { error: "Job title required" },
        { status: 400 }
      );
    }
    const job = await addJob(data);
    return NextResponse.json(job);
  } catch (err: any) {
    console.error("Add job error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
