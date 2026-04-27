import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Subject } from 'rxjs';

import { ServerStatusResponseDto } from './dto/status-response.dto';

@Injectable()
export class StatusService implements OnModuleInit {
  private readonly logger = new Logger(StatusService.name);
  private currentStatus = 'online';
  private readonly bootStart = Date.now();

  readonly statusChange$ = new Subject<ServerStatusResponseDto>();

  onModuleInit() {
    this.logger.log('StatusService initialized');
  }

  setStatus(status: string, message?: string) {
    this.currentStatus = status;
    const payload = this.getPayload(message);
    this.logger.log(`Status → ${status}: ${payload.message}`);
    this.statusChange$.next(payload);
  }

  getStatus(): string {
    return this.currentStatus;
  }

  getPayload(overrideMessage?: string): ServerStatusResponseDto {
    return {
      status: this.currentStatus,
      message: overrideMessage ?? 'Server is online and ready',
      uptime: Math.floor((Date.now() - this.bootStart) / 1000),
      timestamp: new Date().toISOString(),
    };
  }
}
