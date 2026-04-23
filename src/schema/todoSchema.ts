import { z } from "zod";

export const todoValidation = z.object({
    id: z.string().describe("todo id"),
    todo: z.string().describe("todo title"),
    discription: z.string().optional().default("todo discription").describe("todo discrption"),
    isCompleated: z.boolean().optional().default(false).describe("todo status")
})

export type todo = z.infer<typeof todoValidation>