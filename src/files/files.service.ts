import { Injectable } from '@nestjs/common';
import { path as appRootPath } from 'app-root-path';
import { ensureDir, writeFile, readdir, unlink } from 'fs-extra';
import { FileResponse } from './dto/file.response';
import { join } from 'path';

@Injectable()
export class FilesService {
	async saveFiles(
		files: Express.Multer.File[],
		folder: string = 'default'
	): Promise<FileResponse[]> {
		const uploadFolder = join(appRootPath, 'uploads', folder);
		await ensureDir(uploadFolder);
		const res: FileResponse[] = await Promise.all(
			files.map(async (file) => {
				const filePath = join(uploadFolder, file.originalname);
				await writeFile(filePath, file.buffer);
				return {
					url: `/uploads/${folder}/${file.originalname}`,
					name: file.originalname,
				};
			})
		);
		return res;
	}

	async deleteFile(folder: string, filename: string) {
		const filePath = join(appRootPath, 'uploads', folder, filename);
		await unlink(filePath);
		return { deleted: filename };
	}

	async listFiles(folderPath: string) {
		const files = await readdir(folderPath);
		return files;
	}
}
