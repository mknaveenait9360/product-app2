import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';

@Processor('productQueue')
export class ProductProcessor {
  private readonly logger = new Logger(ProductProcessor.name);

  @Process('add-product-job')
  handleAddProduct(job: Job) {
    this.logger.debug(`Processing Job: ${JSON.stringify(job.data)}`);
  }
}
