import { Controller, Get, Res } from '@nestjs/common';
import * as express from 'express';
import { Throttle } from '@nestjs/throttler';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Throttle({ default: { limit: 100, ttl: 60000 } })
@Controller()
export class AppController {
  @ApiExcludeEndpoint()
  @Get()
  async getDashboard(@Res() res: express.Response) {
    res.redirect('/admin');
  }

  @ApiExcludeEndpoint()
  @Get('favicon.ico')
  getFavicon(@Res() res: express.Response) {
    return res.redirect('/favicon/favicon.ico');
  }
}
