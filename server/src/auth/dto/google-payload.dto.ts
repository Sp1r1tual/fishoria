import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const GoogleAuthPayloadSchema = z.object({
  googleId: z.string(),
  email: z.email(),
  displayName: z.string().nullable().optional(),
  picture: z.string().nullable().optional(),
  accessToken: z.string().optional(),
});

export class GoogleAuthPayloadDto extends createZodDto(
  GoogleAuthPayloadSchema,
) {}
