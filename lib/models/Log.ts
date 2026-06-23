import mongoose, { Schema, model, models } from "mongoose";
import type { ILog } from "@/types";

const LogSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    user_name: { type: String, required: true },
    action: { type: String, required: true },
    target_type: { type: String, enum: ["sample", "user"], required: true },
    target_id: { type: Schema.Types.ObjectId, required: true },
    target_label: { type: String, required: true },
    changes: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const Log = models.Log || model<ILog>("Log", LogSchema);
export default Log;
