import { processMeeting } from "@/lib/assembly";
import { db } from "@/server/db";
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server"; // or the correct path for your auth provider

const bodyParser = z.object({
  meetingId: z.string(),
  meetingUrl: z.string(),
  projectId: z.string(),
});

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { meetingId, meetingUrl, projectId } = bodyParser.parse(body);
    const { summaries } = await processMeeting(meetingUrl);
    await db.issue.createMany({
        data: summaries.map((summary) => ({
            start: summary.start,
            end: summary.end,
            gist: summary.gist,
            headline: summary.headline,
            summary: summary.summary,
            meetingId,
        }))
    })
    await db.meeting.update({
      where: { id: meetingId },
      data: {
        status: "COMPLETED",
        name: summaries[0]!.headline,
      },
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error processing meeting:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
