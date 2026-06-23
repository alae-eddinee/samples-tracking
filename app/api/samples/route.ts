import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Sample from "@/lib/models/Sample";
import { logAction } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const client = searchParams.get("client");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};
    if (status && status !== "all") filter.status = status;
    if (client) filter.client_name = { $regex: client, $options: "i" };
    if (dateFrom || dateTo) {
      filter.sent_date = {};
      if (dateFrom) filter.sent_date.$gte = new Date(dateFrom);
      if (dateTo) filter.sent_date.$lte = new Date(dateTo);
    }

    const samples = await Sample.find(filter).sort({ created_at: -1 }).lean();
    return NextResponse.json(samples);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch samples" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const body = await req.json();
    const sample = await Sample.create(body);

    await logAction({
      userId: session.user.id,
      userName: session.user.name,
      action: "CREATE_SAMPLE",
      targetType: "sample",
      targetId: (sample._id as { toString(): string }).toString(),
      targetLabel: sample.client_name,
    });

    return NextResponse.json(sample, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create sample" }, { status: 500 });
  }
}
