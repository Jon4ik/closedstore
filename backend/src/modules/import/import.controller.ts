import { Controller, Post, UseGuards, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportService } from './import.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Multer } from 'multer';

@Controller('import')
@UseGuards(JwtAuthGuard)
export class ImportController {
  constructor(private importService: ImportService) {}

  @Post('excel')
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(@UploadedFile() file: Multer.File, @Request() req) {
    return this.importService.importFromExcel(file.buffer, req.user.sub, req.user.username);
  }
}
