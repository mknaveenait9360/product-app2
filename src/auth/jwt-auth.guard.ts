import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Request } from 'express';

interface AuthRequest extends Request {
  user?: User;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();

    const authHeader = request.headers['authorization'];
    if (!authHeader || Array.isArray(authHeader)) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid token format');
    }

    try {
      const payload = this.jwtService.verify<{ sub: number }>(token);

      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      request.user = user;

      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Token verification failed:', err.message);
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
