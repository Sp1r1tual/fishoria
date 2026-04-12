import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import * as express from 'express';
import { Throttle } from '@nestjs/throttler';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import type { marked as MarkedType } from 'marked';

import { AppService } from './app.service';
import { getAdminDashboardTemplate } from './common/templates/admin-dashboard.template';

@ApiTags('app')
@Throttle({ default: { limit: 100, ttl: 60000 } })
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get Admin Dashboard' })
  @ApiResponse({ status: 200, description: 'Return HTML Dashboard.' })
  async getDashboard(@Res() res: express.Response) {
    const stats = await this.appService.getStats();

    // Get list of doc files
    const docsPath = path.join(process.cwd(), 'docs');
    let docFiles: string[] = [];
    if (fs.existsSync(docsPath)) {
      docFiles = fs.readdirSync(docsPath).filter((f) => f.endsWith('.md'));
    }

    const html = getAdminDashboardTemplate(stats, docFiles);
    res.send(html);
  }

  @Get('api/docs-content/:filename')
  @ApiOperation({ summary: 'Get rendered markdown content' })
  async getDocContent(@Param('filename') filename: string) {
    const filePath = path.join(process.cwd(), 'docs', filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Documentation file not found');
    }

    const { marked } = await (import('marked') as Promise<{
      marked: typeof MarkedType;
    }>);
    const content = fs.readFileSync(filePath, 'utf-8');

    return {
      html: await marked.parse(content),
      filename,
    };
  }

  @Get('favicon.ico')
  getFavicon(@Res() res: express.Response) {
    return res.redirect('/favicon/favicon.ico');
  }
}
