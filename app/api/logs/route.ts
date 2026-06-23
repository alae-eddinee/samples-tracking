import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Log from "@/lib/models/Log";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = 20;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};
    if (action) filter.action = action;
    if (dateFrom || dateTo) {
      filter.timestamp = {};
      if (dateFrom) filter.timestamp.$gte = new Date(dateFrom);
      if (dateTo) filter.timestamp.$lte = new Date(dateTo + "T23:59:59");
    }

    const [logs, total] = await Promise.all([
      Log.find(filter)
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Log.countDocuments(filter),
    ]);

    return NextResponse.json({ logs, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
