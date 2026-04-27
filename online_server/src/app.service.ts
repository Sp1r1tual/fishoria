import { Injectable } from '@nestjs/common';

import { StatusService } from './status/status.service';

@Injectable()
export class AppService {
  constructor(private readonly statusService: StatusService) {}

  getStatus() {
    return this.statusService.getPayload();
  }
}
