import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

import { getActivationTemplate } from './templates/activation.template';
import { getPasswordResetTemplate } from './templates/password-reset.template';
import { getBanTemplate } from './templates/ban.template';
import { getUnbanTemplate } from './templates/unban.template';

@Injectable()
export class MailService {
  private transporter: Transporter;
  private readonly logger = new Logger(MailService.name);
  private readonly projectName = 'Fishoria';

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  async sendActivationMail(to: string, link: string, lang: string = 'en') {
    const isUa = lang === 'ua';
    const subject = isUa
      ? `Активація акаунту - ${this.projectName}`
      : `Activate your account - ${this.projectName}`;

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_USER'),
        to,
        subject,
        html: getActivationTemplate(link, this.projectName, lang),
      });
    } catch (error) {
      this.logger.error(
        `Failed to send activation email to ${to}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  async sendPasswordResetMail(to: string, link: string, lang: string = 'en') {
    const isUa = lang === 'ua';
    const subject = isUa
      ? `Відновлення паролю - ${this.projectName}`
      : `Password Reset - ${this.projectName}`;

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_USER'),
        to,
        subject,
        html: getPasswordResetTemplate(link, this.projectName, lang),
      });
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${to}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  async sendBanMail(to: string, reason: string, lang: string = 'en') {
    const isUa = lang === 'ua';
    const subject = isUa
      ? `Блокування акаунту - ${this.projectName}`
      : `Account Suspended - ${this.projectName}`;

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_USER'),
        to,
        subject,
        html: getBanTemplate(reason, this.projectName, lang),
      });
    } catch (error) {
      this.logger.error(`Failed to send ban email to ${to}`, error.stack);
    }
  }

  async sendUnbanMail(to: string, lang: string = 'en') {
    const isUa = lang === 'ua';
    const subject = isUa
      ? `Акаунт розблоковано - ${this.projectName}`
      : `Account Unbanned - ${this.projectName}`;

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_USER'),
        to,
        subject,
        html: getUnbanTemplate(this.projectName, lang),
      });
    } catch (error) {
      this.logger.error(`Failed to send unban email to ${to}`, error.stack);
    }
  }
}
