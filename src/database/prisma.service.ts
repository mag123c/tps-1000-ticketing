import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';
import { initializeUser } from 'src/database/initialize';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
    this.logger.log('TXPrismaService constructor');
  }

  async onModuleInit() {
    await initializeUser(this);
  }
}
