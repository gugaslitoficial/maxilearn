import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { CertificatesPublicController } from './certificates-public.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CertificatesController, CertificatesPublicController],
  providers: [CertificatesService],
  exports: [CertificatesService],
})
export class CertificatesModule {}
