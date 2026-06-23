import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

// One-time endpoint to create the first admin account.
// Disabled permanently once any user exists in the database.
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const count = await User.countDocuments();
    if (count > 0) {
      return NextResponse.json(
        { error: "Setup already completed. Users already exist." },
        { status: 400 }
      );
    }

    const { name, email, password } = await req.json();
    if (!name || !email || !password || password.length < 8) {
      return NextResponse.json(
        { error: "name, email, and password (min 8 chars) are required" },
        { status: 422 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: "admin",
      active: true,
    });

    return NextResponse.json({ success: true, id: (user._id as { toString(): string }).toString() }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Setup failed" }, { status: 500 });
  }
}
