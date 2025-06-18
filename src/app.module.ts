import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'

import { FilesModule } from './files/files.module'
import { TelegramModule } from './telegram/telegram.module'
import { UserModule } from './user/user.module'


import { PrismaModule } from './prisma/prisma.module';

import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'

@Module({
	imports: [

		ConfigModule.forRoot(),
		UserModule,
		AuthModule,
		FilesModule,
		TelegramModule,
		PrismaModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
