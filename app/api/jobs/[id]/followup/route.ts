import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { recordFollowUp } from "@/lib/notion";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { notes } = await req.json();
    await recordFollowUp(params.id, notes);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Follow-up error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
