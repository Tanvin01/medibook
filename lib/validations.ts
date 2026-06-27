import { z } from "zod";
export const appointmentSchema = z.object({
  doctorId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().int().min(15).max(120).optional().default(30),
  notes: z.string().max(500).optional(),
});
export type AppointmentInput = z.infer<typeof appointmentSchema>;
