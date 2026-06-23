import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { logAction } from "@/lib/logger";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const update: Record<string, unknown> = {};
    let action = "EDIT_USER";

    if (body.password) {
      update.password = await bcrypt.hash(body.password, 12);
      action = "RESET_PASSWORD";
    }
    if (body.name !== undefined) update.name = body.name;
    if (body.email !== undefined) update.email = body.email.toLowerCase();
    if (body.role !== undefined) update.role = body.role;
    if (body.active !== undefined) {
      update.active = body.active;
      action = body.active ? "ENABLE_USER" : "DISABLE_USER";
    }

    const user = await User.findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .select("-password")
      .lean();

    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await logAction({
      userId: session.user.id,
      userName: session.user.name,
      action,
      targetType: "user",
      targetId: id,
      targetLabel: user.email,
    });

    return NextResponse.json(user);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
