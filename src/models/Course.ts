import { Schema, model } from "mongoose";
import type { CourseDoc } from "../types/index";

// The third Session 1 interface, written a second time as a schema.
// Courses are the one thing this API serves to somebody who is not
// logged in, so these routes have no requireAuth above them.
const courseSchema = new Schema<CourseDoc>({
  code: {
    type: String,
    required: [true, "code is required"],
    unique: true,
    uppercase: true,
    trim: true,
  },
  title: { type: String, required: [true, "title is required"], trim: true },
  units: { type: Number, required: true, min: 1, max: 6 },
  semester: { type: String, required: true, trim: true },
});

// Course never had an id -- the code is its identity -- so there is
// nothing to rename, and the two fields Mongo added are the only two
// that have to come out.
courseSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Course = model<CourseDoc>("Course", courseSchema);
