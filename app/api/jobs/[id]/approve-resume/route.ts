import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { approveResume } from "@/lib/notion";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await approveResume(params.id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Approve resume error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
