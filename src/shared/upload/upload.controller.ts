import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Express, Request } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { UploadDto } from './dto/upload.dto';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { Response } from 'express';

@Controller('file')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const type = req.body.type;
          console.log(req.body);
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
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @Body() uploadDto: UploadDto
  ): Promise<any> {
    if (!file) throw new BadRequestException('File is missing');
    const userId = req.user['sub'];
    // const imgPath = `public/${uploadDto.type}/${file.filename}`;
    const image = await this.uploadService.uploadImageToDB({
      imgAuthor: userId,
      imgType: uploadDto.type,
      imgPath: file.path,
      imgName: file.filename,
    });
    return {
      imgId: image.id,
      size: file.size,
    };
  }

  @Get('assets/:filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    // Set content type of response
    res.set('Content-Type', 'image/jpeg');
    // Return image file
    res.sendFile(path.join(__dirname, '..', 'uploads', filename));
  }
}
