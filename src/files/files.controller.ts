import {
	Controller,
	HttpCode,
	Post,
	Query,
	UploadedFile,
	UploadedFiles,
	UseGuards,
	UseInterceptors,
	Delete,
	Param,
	Get,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { FileResponse } from './dto/file.response';
import { Auth } from '../auth/decorators/auth.decorator'


@Controller('files')
export class FilesController {
	constructor(private readonly filesService: FilesService) {}

	// ===== Публичная загрузка одного файла (для примера)
	@Post('public')
	@HttpCode(200)
	@UseInterceptors(FileInterceptor('file'))
	async uploadPublicFile(
		@UploadedFile() file: Express.Multer.File,
		@Query('folder') folder?: string
	): Promise<FileResponse[]> {
		return this.filesService.saveFiles([file], `public/${folder || ''}`);
	}

	// ===== Публичная загрузка нескольких файлов
	@Post('public')
	@HttpCode(200)
	@UseInterceptors(FilesInterceptor('files'))
	async uploadPublicFiles(
		@UploadedFiles() files: Express.Multer.File[],
		@Query('folder') folder?: string
	): Promise<FileResponse[]> {
		return this.filesService.saveFiles(files, `public/${folder || ''}`);
	}

	// ===== Защищённая загрузка (требует admin)
	@Post('protected')
	@HttpCode(200)
	@Auth('admin')
	@UseInterceptors(FileInterceptor('file'))
	async uploadProtectedFile(
		@UploadedFile() file: Express.Multer.File,
		@Query('folder') folder?: string
	): Promise<FileResponse[]> {
		return this.filesService.saveFiles([file], `protected/${folder || ''}`);
	}

	// ===== Удаление файла
	@Delete(':type/:folder/:filename')
	@HttpCode(200)
	@Auth('admin')
	async deleteFile(
		@Param('type') type: 'public' | 'protected',
		@Param('folder') folder: string,
		@Param('filename') filename: string
	) {
		return this.filesService.deleteFile(`${type}/${folder}`, filename);
	}

	// ===== Список файлов в папке
	@Get(':type/:folder')
	@HttpCode(200)
	@Auth('admin')
	async listFiles(
		@Param('type') type: 'public' | 'protected',
		@Param('folder') folder: string
	) {
		return this.filesService.listFiles(`uploads/${type}/${folder}`);
	}
}
