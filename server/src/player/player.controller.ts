import {
  Controller,
  Get,
  Post,
  UseGuards,
  Body,
  Query,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Throttle } from '@nestjs/throttler';
import { ZodValidationPipe } from 'nestjs-zod';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUserId } from '../auth/decorators/get-user-id.decorator';

import { SupabaseStorageService } from '../common/supabase/supabase-storage.service';

import { PlayerService } from './player.service';
import { AddMoneyDto } from './dto/player.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';

@Throttle({ default: { limit: 100, ttl: 60000 } })
@Controller('player')
export class PlayerController {
  constructor(
    private readonly playerService: PlayerService,
    private readonly configService: ConfigService,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(
    @GetUserId() userId: string,
    @Query('lang') language?: string,
  ) {
    const profile = await this.playerService.getProfile(userId, language);
    const jwtExp = this.configService.get<string>(
      'JWT_ACCESS_TOKEN_EXPIRATION',
    )!;
    const expiresIn = ms(jwtExp as ms.StringValue);

    return { ...profile, expiresIn };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile/:userId')
  async getOtherProfile(@Param('userId') targetUserId: string) {
    return this.playerService.getProfile(targetUserId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODERATOR')
  @Post('add-money')
  addMoney(
    @GetUserId() modId: string,
    @Body(new ZodValidationPipe(AddMoneyDto)) body: AddMoneyDto,
  ) {
    return this.playerService.addMoney(body.targetUserId || modId, body.amount);
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset')
  resetProfile(@GetUserId() userId: string) {
    return this.playerService.resetProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('language')
  updateLanguage(
    @GetUserId() userId: string,
    @Body(new ZodValidationPipe(UpdateLanguageDto)) body: UpdateLanguageDto,
  ) {
    return this.playerService.updateLanguage(userId, body.language);
  }

  @UseGuards(JwtAuthGuard)
  @Post('update')
  updateProfile(
    @GetUserId() userId: string,
    @Body(new ZodValidationPipe(UpdateProfileDto)) body: UpdateProfileDto,
  ) {
    return this.playerService.updateProfile(userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @GetUserId() userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp|gif)' }),
        ],
      }),
    )
    file: { buffer: Buffer; mimetype: string },
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const publicUrl = await this.supabaseStorageService.uploadAvatarFromBuffer(
      userId,
      file.buffer,
      file.mimetype,
    );

    if (!publicUrl) {
      throw new BadRequestException('Failed to upload avatar');
    }

    return { publicUrl };
  }
}
