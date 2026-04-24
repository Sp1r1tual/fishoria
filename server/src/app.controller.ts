import { Controller, Get, Res } from '@nestjs/common';
import * as express from 'express';
import { Throttle } from '@nestjs/throttler';

@Throttle({ default: { limit: 100, ttl: 60000 } })
@Controller()
export class AppController {
  @Get()
  async getDashboard(@Res() res: express.Response) {
    res.redirect('/admin');
  }

  @Get('favicon.ico')
  getFavicon(@Res() res: express.Response) {
    return res.redirect('/favicon/favicon.ico');
  }
}
