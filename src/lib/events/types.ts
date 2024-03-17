import { z } from "zod"

export const eventSchema = z.enum(["submission.created","submission.updated"])
export const eventArraySchema = eventSchema.array()
export type EventType = z.infer<typeof eventSchema>
