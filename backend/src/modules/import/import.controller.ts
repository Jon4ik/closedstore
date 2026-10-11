import { BadRequestException, Controller, Post, UseGuards, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { memoryStorage } from 'multer';
import { ImportService } from './import.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/require-permissions.decorator';

const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

@Controller('import')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ImportController {
  constructor(private importService: ImportService) {}

  @Post('excel')
  @RequirePermissions('import')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: MAX_IMPORT_BYTES, files: 1 },
    fileFilter: (_req, file, callback) => {
      if (extname(file.originalname).toLowerCase() !== '.xlsx') {
        return callback(new BadRequestException('Разрешены только файлы .xlsx'), false);
      }
      callback(null, true);
    },
  }))
  async importExcel(@UploadedFile() file: any, @Request() req) {
    if (!file?.buffer?.length) throw new BadRequestException('Необходимо приложить Excel-файл');
    return this.importService.importFromExcel(file.buffer, req.user.sub, req.user.username);
  }
}
