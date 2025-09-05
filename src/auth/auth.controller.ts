import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    console.log('Request Body:', body); // DEBUG
    if (!body) return { message: 'Request body is missing' };

    const { username, email, password } = body;
    if (!username || !email || !password) {
      return { message: 'All fields are required' };
    }

    try {
      return await this.authService.register(username, email, password);
    } catch (err) {
      return { message: err.message };
    }
  }

  @Post('login')
  async login(@Body() body: any) {
    console.log('Login Body:', body); // DEBUG
    if (!body) return { message: 'Request body is missing' };

    const { email, password } = body;
    if (!email || !password) return { message: 'Email and password required' };

    try {
      const user = await this.authService.validateUser(email, password);
      if (!user) return { message: 'Invalid credentials' };

      return await this.authService.login(user);
    } catch (err) {
      return { message: err.message };
    }
  }
}
