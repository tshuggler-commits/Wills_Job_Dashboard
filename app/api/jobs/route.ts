import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getActiveJobs } from "@/lib/notion";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const jobs = await getActiveJobs();
    return NextResponse.json(jobs);
  } catch (err: any) {
    console.error("Failed to fetch jobs:", err);
    return NextResponse.json(
      { error: "Failed to fetch jobs", detail: err.message },
      { status: 500 }
    );
  }
}
