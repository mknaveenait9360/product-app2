import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../auth/entities/user.entity';

export class AdminSeeder {
  static async run(dataSource: DataSource) {
    const userRepo = dataSource.getRepository(User);

    const existing = await userRepo.findOne({
      where: { email: 'admin@example.com' },
    });
    if (existing) {
      console.log('Admin already exists, skipping...');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = userRepo.create({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
    });

    await userRepo.save(admin);
    console.log('Admin user created successfully.');
  }
}
