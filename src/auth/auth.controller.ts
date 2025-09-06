import { Controller, Post, Body, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    if (!body) throw new BadRequestException('Request body is missing');

    const { username, email, password } = body;
    if (!username || !email || !password) {
      throw new BadRequestException('All fields are required');
    }

    try {
      const user = await this.authService.register(username, email, password);
      return { message: 'Registration successful', user };
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Post('login')
  async login(@Body() body: any) {
    if (!body) throw new BadRequestException('Request body is missing');

    const { email, password } = body;
    if (!email || !password) throw new BadRequestException('Email and password required');

    try {
      const user = await this.authService.validateUser(email, password);
      if (!user) throw new UnauthorizedException('Invalid email or password');

      return await this.authService.login(user);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
