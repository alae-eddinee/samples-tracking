import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { logAction } from "@/lib/logger";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();
    const users = await User.find({}, { password: 0 }).sort({ created_at: -1 }).lean();
    return NextResponse.json(users);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();
    const { name, email, password, role } = await req.json();

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role,
      active: true,
      created_by: session.user.id,
    });

    await logAction({
      userId: session.user.id,
      userName: session.user.name,
      action: "ADD_USER",
      targetType: "user",
      targetId: (user._id as { toString(): string }).toString(),
      targetLabel: user.email,
    });

    // Return without password
    const { password: _pw, ...safe } = user.toObject();
    return NextResponse.json(safe, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
