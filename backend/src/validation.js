import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1),
  floors: z.string().min(1),
  type: z.enum(["Residential", "Commercial"])
});

export const createTaskSchema = z.object({
  name: z.string().min(1),
  mepType: z.enum(["Electrical", "HVAC", "Plumbing"]),
  floor: z.string().min(1),
  startDate: z.string().min(10),
  endDate: z.string().min(10).optional(),
  quantity: z.number().nonnegative().optional(),
  productivityRate: z.number().positive().optional(),
  status: z.enum(["Not Started", "In Progress", "Completed"]).default("Not Started"),
  completionPercent: z.number().min(0).max(100).default(0)
});
