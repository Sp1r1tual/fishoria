import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Subject } from 'rxjs';

import { ServerStatusResponseDto } from './dto/status-response.dto';
import { EServerStatus } from './enums/status.enum';

@Injectable()
export class StatusService implements OnModuleInit {
  private readonly logger = new Logger(StatusService.name);
  private currentStatus: EServerStatus = EServerStatus.STARTING;
  private readonly bootStart = Date.now();

  readonly statusChange$ = new Subject<ServerStatusResponseDto>();

  onModuleInit() {
    this.logger.log('StatusService initialized - server is booting');
  }

  setStatus(status: EServerStatus, message?: string) {
    this.currentStatus = status;
    const payload = this.getPayload(message);

    this.logger.log(`Status → ${status}: ${payload.message}`);
    this.statusChange$.next(payload);
  }

  getStatus(): EServerStatus {
    return this.currentStatus;
  }

  getPayload(overrideMessage?: string): ServerStatusResponseDto {
    return {
      status: this.currentStatus,
      message: overrideMessage ?? this.getDefaultMessage(),
      uptime: Math.floor((Date.now() - this.bootStart) / 1000),
      timestamp: new Date().toISOString(),
    };
  }

  private getDefaultMessage(): string {
    switch (this.currentStatus) {
      case EServerStatus.STARTING:
        return 'Server is starting up...';
      case EServerStatus.CONNECTING_DB:
        return 'Connecting to database...';
      case EServerStatus.CONNECTING_REDIS:
        return 'Connecting to Redis...';
      case EServerStatus.ONLINE:
        return 'Server is online and ready';
    }
  }
}
