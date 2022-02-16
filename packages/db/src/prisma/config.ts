import { registerAs } from '@nestjs/config';
import { Prisma } from '@prisma/client';

export default registerAs('prisma', () => ({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://chatop:chatOperator@localhost:5432/chat-operator',
    }
  }
} as Prisma.PrismaClientOptions));
