import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { UploadService } from './upload.service';

const IMAGE_MIME = /^image\/(jpeg|png|webp|gif)$/;
const FILE_MIME =
  /^(image\/(jpeg|png|webp|gif)|application\/(pdf|msword|vnd\.ms-powerpoint|vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|presentationml\.presentation|spreadsheetml\.sheet)))$/;

@Controller('upload')
export class UploadController {
  constructor(private readonly uploads: UploadService) {}

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!IMAGE_MIME.test(file.mimetype)) {
          return cb(
            new BadRequestException('Apenas imagens JPG, PNG, WEBP ou GIF são permitidas'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadImage(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado');
    return this.uploads.save(file, user.companyId);
  }

  @Post('file')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!FILE_MIME.test(file.mimetype)) {
          return cb(
            new BadRequestException(
              'Tipo de arquivo não permitido. Use PDF, Word, PowerPoint ou imagens.',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadFile(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado');
    return this.uploads.save(file, user.companyId);
  }

  @Get(':id')
  async serve(@Param('id') id: string, @Res() res: Response) {
    const upload = await this.uploads.findById(id);
    res.setHeader('Content-Type', upload.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${upload.filename}"`);
    res.send(upload.data);
  }
}
