import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import * as express from 'express';
import { Throttle } from '@nestjs/throttler';

import { AdminService } from './admin.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { getAdminDashboardTemplate } from './templates/admin-dashboard.template';
import { BanUserDto } from './dto/ban-user.dto';
import { UnbanUserDto } from './dto/unban-user.dto';

@Throttle({ default: { limit: 100, ttl: 60000 } })
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  async getDashboard(@Res() res: express.Response) {
    const stats = await this.adminService.getStats();
    const docFiles = this.adminService.getDocFiles();

    const html = getAdminDashboardTemplate(stats, docFiles);
    res.send(html);
  }

  @Get('api/docs-content/:filename')
  async getDocContent(@Param('filename') filename: string) {
    return await this.adminService.getRenderedDoc(filename);
  }

  @Post('ban')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODERATOR')
  async banUser(@Body() dto: BanUserDto, @Req() req: express.Request) {
    const adminId = (req.user as { id: string }).id;
    return await this.adminService.banUser(
      dto.userId,
      dto.reason,
      adminId,
      dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    );
  }

  @Post('unban')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODERATOR')
  async unbanUser(@Body() dto: UnbanUserDto) {
    return await this.adminService.unbanUser(dto.userId);
  }

  @Get('check-ban/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MODERATOR')
  async checkBan(@Param('userId') userId: string) {
    const isBanned = await this.adminService.isUserBanned(userId);
    return { isBanned };
  }
}
