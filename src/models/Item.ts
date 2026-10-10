import { Schema, model } from "mongoose";
import { ItemStatus } from "../types/index";
import type { ItemDoc } from "../types/index";

const itemSchema = new Schema<ItemDoc>({
  // Holds the _id of a User document. ref tells Mongoose which
  // collection that id points into.
  reportedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // RULE 1 (required): the item must say what it is
  description: {
    type: String,
    required: [true, "description is required"],
    trim: true,
  },
  location: {
    type: String,
    required: [true, "location is required"],
    trim: true,
  },

  // RULE 2 (enum): only these two words are allowed
  type: {
    type: String,
    enum: { values: ["lost", "found"], message: "type must be lost or found" },
    required: [true, "type is required"],
  },

  reportedAt: { type: Date, default: Date.now },

  // RULE 3 (min/max): stored as 0, 1 or 2, matching your ItemStatus enum
  // (Open = 0, Claimed = 1, Resolved = 2)
  status: { type: Number, min: 0, max: 2, default: ItemStatus.Open },
});

// Same job as in User.ts: send id, not _id, and hide __v.
itemSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Item = model<ItemDoc>("Item", itemSchema);