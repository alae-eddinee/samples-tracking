import { connectDB } from "./mongodb";
import Log from "./models/Log";

interface LogActionParams {
  userId: string;
  userName: string;
  action: string;
  targetType: "sample" | "user";
  targetId: string;
  targetLabel: string;
  changes?: Record<string, { from: unknown; to: unknown }>;
}

export async function logAction(params: LogActionParams): Promise<void> {
  try {
    await connectDB();
    await Log.create({
      user_id: params.userId,
      user_name: params.userName,
      action: params.action,
      target_type: params.targetType,
      target_id: params.targetId,
      target_label: params.targetLabel,
      changes: params.changes ?? {},
      timestamp: new Date(),
    });
  } catch (err) {
    // Log failures must never break the main operation
    console.error("Audit log write failed:", err);
  }
}
