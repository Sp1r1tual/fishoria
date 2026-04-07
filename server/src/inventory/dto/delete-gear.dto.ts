import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const DeleteGearSchema = z.object({
  uid: z.uuid(),
});

export class DeleteGearDto extends createZodDto(DeleteGearSchema) {}
