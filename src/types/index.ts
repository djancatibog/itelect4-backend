import type { Types } from "mongoose";

// FROM SESSION 1: copied from itelect4-project's src/types/index.ts.
// Only what the backend needs. Same names and fields as the frontend.

export enum ItemStatus {
  Open,
  Claimed,
  Resolved,
}

export enum ClaimStatus {
  Pending  = "pending",
  Verified = "verified",
  Rejected = "rejected",
}

export interface User {
  id:       number;
  name:     string;
  email:    string;
  role:     "student" | "security_admin";
  isActive: boolean;
}

export interface Item {
  id:          number | string;
  description: string;
  location:    string;
  type:        "lost" | "found";
  reportedBy:  number;
  reportedAt:  Date;
  status:      ItemStatus;
}

export interface Claim {
  id:          number;
  itemId:      number;
  claimantId:  number;
  submittedAt: Date;
  status:      ClaimStatus;
}

// What the database actually stores.
// MongoDB makes its own ids, so User and Item lose `id`.
// reportedBy used to be a number; now it holds the _id of a User document.
export type UserDoc = Omit<User, "id"> & {
  password: string;
};

export type ItemDoc = Omit<Item, "id" | "reportedBy"> & {
  reportedBy: Types.ObjectId;
};

// The body a client sends to create an item.
// No id, no reportedBy (the server reads that from the token),
// and no status or date (the schema fills those in).
export type NewItemBody = Pick<Item, "description" | "location" | "type">;

// The body a client may send to change an item.
export type UpdateItemBody = Partial<Pick<Item, "description" | "location" | "type" | "status">>;

// Reference data for the dropdown. Nobody creates a course through the API,
// so there is no POST route -- just the list and one lookup.
export interface Course {
  code: string;
  title: string;
  units: number;
  semester: string;
}

// Pick builds a mapped type, which the toJSON transform below accepts.
// An interface would be refused there.
export type CourseDoc = Pick<Course, "code" | "title" | "units" | "semester">;