import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Sample from "@/lib/models/Sample";
import { logAction } from "@/lib/logger";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;
    const sample = await Sample.findById(id).lean();
    if (!sample) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(sample);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch sample" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const oldSample = await Sample.findById(id).lean();
    if (!oldSample) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await Sample.findByIdAndUpdate(id, body, { new: true, runValidators: true }).lean();

    // Detect changed fields for audit log
    const changes: Record<string, { from: unknown; to: unknown }> = {};
    for (const key of Object.keys(body)) {
      const oldVal = String((oldSample as Record<string, unknown>)[key] ?? "");
      const newVal = String(body[key] ?? "");
      if (oldVal !== newVal) {
        changes[key] = { from: (oldSample as Record<string, unknown>)[key], to: body[key] };
      }
    }

    const action = changes.status ? "UPDATE_STATUS" : "UPDATE_SAMPLE";
    await logAction({
      userId: session.user.id,
      userName: session.user.name,
      action,
      targetType: "sample",
      targetId: id,
      targetLabel: oldSample.client_name,
      changes,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update sample" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;
    const sample = await Sample.findByIdAndDelete(id);
    if (!sample) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await logAction({
      userId: session.user.id,
      userName: session.user.name,
      action: "DELETE_SAMPLE",
      targetType: "sample",
      targetId: id,
      targetLabel: sample.client_name,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete sample" }, { status: 500 });
  }
}
