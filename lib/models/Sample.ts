import { Schema, model, models } from "mongoose";
import type { ISample } from "@/types";

const SampleSchema = new Schema<ISample>(
  {
    client_name: { type: String, required: true, trim: true },
    sent_date: { type: Date, required: true },
    returned_date: { type: Date, default: null },
    status: {
      type: String,
      enum: ["Sent", "Returned", "Lost"],
      default: "Sent",
      required: true,
    },
    image_url: { type: String, default: "" },
    comment: { type: String, default: "" },
    created_at: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const Sample = models.Sample || model<ISample>("Sample", SampleSchema);
export default Sample;
