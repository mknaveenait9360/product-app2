import { Injectable, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // Register a new user or admin
  async register(
    username: string,
    email: string,
    password: string,
    role: string = 'user',
  ) {
    try {
      const existing = await this.userRepo.findOne({ where: { email } });
      if (existing) throw new BadRequestException('Email already exists');

      const hashed = await bcrypt.hash(password, 10);
      const user = this.userRepo.create({
        username,
        email,
        password: hashed,
        role,
      });
      return await this.userRepo.save(user);
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new BadRequestException('Registration failed' + err.message);
      }
      throw new BadRequestException('An unkown error Occured');
    }
  }

  // Validate user login credentials
  async validateUser(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  // Login and return JWT token
  login(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return { access_token: this.jwtService.sign(payload) };
  }
}
