import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { JwtAuthGuard } from './../auth/guards/jwt.guard';

@Module({
	imports: [
		ServeStaticModule.forRoot(
			{
				rootPath: join(process.cwd(), 'uploads', 'public'),
				serveRoot: '/uploads/public',
			},
			{
				rootPath: join(process.cwd(), 'uploads', 'protected'),
				serveRoot: '/uploads/protected',
				exclude: ['*'], // защищённая папка не раздаётся напрямую
			}
		)
	],
	providers: [FilesService, JwtAuthGuard],
	controllers: [FilesController],
})
export class FilesModule {}
