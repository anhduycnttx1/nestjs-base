import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Express } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { UploadDto } from './dto/upload.dto';

@Controller('file/upload')
export class UploadController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const type = req.body.type;
          const uploadPath = `./uploads/${type}`;
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const type = req.body.type;
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const fileExtName = path.extname(file.originalname);
          const fileName = `${type}-${uniqueSuffix}${fileExtName}`;
          cb(null, fileName);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(new BadRequestException('Invalid file type (.jpg,.png).'), false);
        }
        cb(null, true);
      },
    })
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body() uploadDto: UploadDto): Promise<any> {
    if (!file) throw new BadRequestException('File is missing');
    return {
      path: `uploads/${uploadDto.type}/${file.filename}`,
      pathFile: file.path,
      size: file.size,
    };
  }
}
