import { Controller, Get, Param } from '@nestjs/common';
import { CertificatesService } from './certificates.service';

@Controller('certificates')
export class CertificatesPublicController {
  constructor(private readonly certificates: CertificatesService) {}

  // Public route — no JWT guard, for certificate validation links
  @Get('validate/:code')
  validate(@Param('code') code: string) {
    return this.certificates.validate(code);
  }
}
