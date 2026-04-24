import {
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
  Res,
  Body,
  Param,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import ms from 'ms';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { GoogleAuthPayloadDto } from './dto/google-payload.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      const internalUser = await this.authService.validateOAuthUser(
        req.user as GoogleAuthPayloadDto,
      );

      const { access_token, refresh_token } = await this.authService.login(
        internalUser,
        req.headers['user-agent'],
        req.ip,
      );

      this.setCookies(res, access_token, refresh_token);

      res.redirect(this.configService.get<string>('CLIENT_URL')!);
    } catch (error: unknown) {
      const clientUrl = this.configService.get<string>('CLIENT_URL');

      if (error instanceof UnauthorizedException) {
        return res.redirect(
          `${clientUrl}/welcome?error=${encodeURIComponent(error.message)}`,
        );
      }

      res.redirect(`${clientUrl}/welcome?error=auth.errors.generic`);
    }
  }

  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.Refresh || req.body?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    let tokens: Awaited<ReturnType<AuthService['refreshTokens']>>;
    try {
      tokens = await this.authService.refreshTokens(
        refreshToken,
        req.headers['user-agent'],
        req.ip,
      );
    } catch (error) {
      this.clearCookies(res);
      throw error;
    }

    if (!tokens) {
      this.clearCookies(res);
      throw new UnauthorizedException('Invalid refresh token');
    }

    this.setCookies(res, tokens.access_token, tokens.refresh_token);

    const jwtExp = this.configService.get<string>(
      'JWT_ACCESS_TOKEN_EXPIRATION',
    )!;
    const expiresIn = ms(jwtExp as ms.StringValue);

    res.send({
      user: tokens.user,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      success: true,
      expiresIn,
    });
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.Refresh || req.body?.refreshToken;

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    this.clearCookies(res);
    res.send({ success: true });
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
    await this.authService.requestPasswordReset(
      dto.email,
      req.headers['user-agent'],
      req.ip,
      dto.language,
    );

    return { message: 'auth.resetLinkSent' };
  }

  @Post('verify-reset-token')
  async verifyResetToken(@Body('token') token: string) {
    return await this.authService.verifyPasswordResetToken(token);
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.password);

    return { success: true, message: 'auth.passwordUpdated' };
  }

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(AuthGuard('local'))
  async login(
    @Body() _dto: LoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = req.user as {
      id: string;
      email: string;
      role: string;
      language: string;
    };

    const tokens = await this.authService.login(
      user,
      req.headers['user-agent'],
      req.ip,
    );

    this.setCookies(res, tokens.access_token, tokens.refresh_token);

    const jwtExp = this.configService.get<string>(
      'JWT_ACCESS_TOKEN_EXPIRATION',
    )!;
    const expiresIn = ms(jwtExp as ms.StringValue);

    return res.json({
      user,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      success: true,
      expiresIn,
    });
  }

  @Get('activate/:link')
  async activate(@Param('link') link: string, @Res() res: Response) {
    try {
      await this.authService.activate(link);

      return res.redirect(
        `${this.configService.get('CLIENT_URL')}/welcome?activated=true`,
      );
    } catch {
      return res.redirect(
        `${this.configService.get('CLIENT_URL')}/welcome?activationError=true`,
      );
    }
  }

  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProd = this.configService.get('NODE_ENV') === 'production';
    const cookieDomain = this.configService.get<string>('COOKIE_DOMAIN');
    const jwtExp = this.configService.get<string>(
      'JWT_ACCESS_TOKEN_EXPIRATION',
    )!;
    const refreshExp = this.configService.get<string>(
      'JWT_REFRESH_TOKEN_EXPIRATION',
    )!;

    const jwtMs = ms(jwtExp as ms.StringValue);

    res.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: isProd,
      maxAge: jwtMs,
      sameSite: isProd ? 'none' : 'lax',
      ...(cookieDomain && { domain: cookieDomain }),
    });

    res.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: isProd,
      maxAge: ms(refreshExp as ms.StringValue),
      sameSite: isProd ? 'none' : 'lax',
      ...(cookieDomain && { domain: cookieDomain }),
    });
  }

  private clearCookies(res: Response) {
    const isProd = this.configService.get('NODE_ENV') === 'production';
    const cookieDomain = this.configService.get<string>('COOKIE_DOMAIN');

    res.clearCookie('Authentication', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      ...(cookieDomain && { domain: cookieDomain }),
    });

    res.clearCookie('Refresh', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      ...(cookieDomain && { domain: cookieDomain }),
    });
  }
}
