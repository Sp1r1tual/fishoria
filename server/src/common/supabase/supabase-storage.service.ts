import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const AVATARS_BUCKET = 'avatars';

@Injectable()
export class SupabaseStorageService {
  private readonly supabase: SupabaseClient;
  private readonly logger = new Logger(SupabaseStorageService.name);

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL')!;
    const serviceKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    )!;

    this.supabase = createClient(url, serviceKey);
  }

  async uploadAvatarFromUrl(
    userId: string,
    imageUrl: string,
  ): Promise<string | null> {
    try {
      const response = await fetch(imageUrl);

      if (!response.ok) {
        this.logger.warn(
          `Failed to fetch avatar from URL: ${imageUrl} (${response.status})`,
        );
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const contentType = response.headers.get('content-type') || 'image/jpeg';
      const ext = contentType.includes('png') ? 'png' : 'webp';
      const filePath = `${userId}.${ext}`;

      const { error } = await this.supabase.storage
        .from(AVATARS_BUCKET)
        .upload(filePath, buffer, {
          cacheControl: '3600',
          contentType,
          upsert: true,
        });

      if (error) {
        this.logger.error(
          `Failed to upload avatar to storage: ${error.message}`,
        );
        return null;
      }

      const { data: urlData } = this.supabase.storage
        .from(AVATARS_BUCKET)
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      this.logger.error('Error uploading avatar from URL:', error);
      return null;
    }
  }
}
