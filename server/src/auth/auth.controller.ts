import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  Body,
  Param,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import ms from 'ms';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUserId } from './decorators/get-user-id.decorator';
import { GoogleAuthPayloadDto } from './dto/google-payload.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginDto } from './dto/login.dto';

interface IRequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    role: string;
    language: string;
  };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth' })
  @ApiResponse({ status: 302, description: 'Redirect to Google.' })
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({
    status: 302,
    description: 'Login success and redirect to client.',
  })
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const internalUser = await this.authService.validateOAuthUser(
      req.user as GoogleAuthPayloadDto,
    );

    const { access_token, refresh_token } = await this.authService.login(
      internalUser,
      req.headers['user-agent'],
      req.ip,
    );

    this.setCookies(res, access_token, refresh_token);

    res.redirect(
      this.configService.get<string>('CLIENT_URL') || 'http://localhost:5173',
    );
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 201, description: 'Tokens refreshed.' })
  @ApiResponse({
    status: 401,
    description: 'Invalid or missing refresh token.',
  })
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.Refresh;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const tokens = await this.authService.refreshTokens(
      refreshToken,
      req.headers['user-agent'],
      req.ip,
    );

    if (!tokens) {
      this.clearCookies(res);
      throw new UnauthorizedException('Invalid refresh token');
    }

    this.setCookies(res, tokens.access_token, tokens.refresh_token);

    const jwtExp = this.configService.get<string>(
      'JWT_ACCESS_TOKEN_EXPIRATION',
    )!;
    const expiresIn = ms(jwtExp as ms.StringValue);

    res.send({ user: tokens.user, success: true, expiresIn });
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Authentication')
  @ApiSecurity('XSRF')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 201, description: 'Logged out successfully.' })
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.Refresh;

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    this.clearCookies(res);
    res.send({ success: true });
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('Authentication')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return user profile.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getProfile(@GetUserId() userId: string, @Req() req: IRequestWithUser) {
    const jwtExp = this.configService.get<string>(
      'JWT_ACCESS_TOKEN_EXPIRATION',
    )!;
    const expiresIn = ms(jwtExp as ms.StringValue);

    return { ...req.user, userId, expiresIn };
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 201, description: 'Reset link sent if email exists.' })
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
    await this.authService.requestPasswordReset(
      dto.email,
      req.headers['user-agent'],
      req.ip,
    );

    return { message: 'If an account exists, a reset link has been sent' };
  }

  @Post('verify-reset-token')
  @ApiOperation({ summary: 'Verify password reset token' })
  @ApiBody({
    schema: { type: 'object', properties: { token: { type: 'string' } } },
  })
  @ApiResponse({ status: 201, description: 'Token verified.' })
  @ApiResponse({ status: 400, description: 'Invalid token.' })
  async verifyResetToken(@Body('token') token: string) {
    return await this.authService.verifyPasswordResetToken(token);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 201, description: 'Password updated successfully.' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.password);

    return { success: true, message: 'Password updated successfully' };
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 201, description: 'Logged in successfully.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
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

    return res.json({ user, success: true, expiresIn });
  }

  @Get('activate/:link')
  @ApiOperation({ summary: 'Activate account via link' })
  @ApiResponse({
    status: 302,
    description: 'Account activated and redirect to client.',
  })
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
