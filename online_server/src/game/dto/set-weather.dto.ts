import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const SetWeatherSchema = z.object({
  weather: z.enum(['clear', 'cloudy', 'rain']),
});

export class SetWeatherDto extends createZodDto(SetWeatherSchema) {}
