import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const { assignmentId } = await params;
    const assignment = await db.assignment.findUnique({
      where: { id: assignmentId },
      include: { submissions: true },
    });

    if (!assignment) {
      return new NextResponse("Assignment not found", { status: 404 });
    }

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("[ASSIGNMENT_GET_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
