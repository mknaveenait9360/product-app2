import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [ProductModule], // ✅ ProductService will now be available
  providers: [CronService],
})
export class CronModule {}
