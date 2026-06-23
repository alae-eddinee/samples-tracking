import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Sample from "@/lib/models/Sample";
import User from "@/lib/models/User";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const [total, sent, returned, lost, totalUsers] = await Promise.all([
      Sample.countDocuments(),
      Sample.countDocuments({ status: "Sent" }),
      Sample.countDocuments({ status: "Returned" }),
      Sample.countDocuments({ status: "Lost" }),
      User.countDocuments({ active: true }),
    ]);

    return NextResponse.json({ total, sent, returned, lost, totalUsers });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
