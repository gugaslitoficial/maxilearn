import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class UploadService {
  constructor(private prisma: PrismaService) {}

  async save(file: Express.Multer.File, companyId: string) {
    const upload = await this.prisma.upload.create({
      data: {
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        data: file.buffer,
        companyId,
      },
    });
    return { id: upload.id, url: `/upload/${upload.id}` };
  }

  async findById(id: string) {
    const upload = await this.prisma.upload.findUnique({ where: { id } });
    if (!upload) throw new NotFoundException('Arquivo não encontrado');
    return upload;
  }
}
