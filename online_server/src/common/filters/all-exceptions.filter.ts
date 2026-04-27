import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    if (host.getType() === 'ws') {
      this.handleWsException(exception, host);
      return;
    }

    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'errors.unknown';

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'object' && response !== null) {
        const msg = (response as Record<string, unknown>).message;

        message = Array.isArray(msg)
          ? msg.join(', ')
          : (msg as string) || JSON.stringify(response);
      } else {
        message = response as string;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': {
          httpStatus = HttpStatus.CONFLICT;
          const target = (exception.meta?.target as string[])?.join(', ');

          message = `Unique constraint failed on field(s): ${target}`;
          break;
        }
        case 'P2025': {
          httpStatus = HttpStatus.NOT_FOUND;
          message = exception.message || 'Record not found';
          break;
        }
        default:
          message = `Database error: ${exception.code}`;
      }
    }

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message: message,
    };

    if (httpStatus >= 500) {
      this.logger.error(
        `[${httpStatus}] ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else if (httpStatus !== HttpStatus.UNAUTHORIZED) {
      this.logger.warn(`[${httpStatus}] ${message}`);
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }

  private handleWsException(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    let message = 'errors.unknown';

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && response !== null) {
        const msg = (response as Record<string, unknown>).message;
        message = Array.isArray(msg) ? msg.join(', ') : (msg as string);
      } else {
        message = response as string;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.warn(`[WS Exception] ${message}`);
    client.emit('exception', {
      status: 'error',
      message: message,
    });
  }
}
