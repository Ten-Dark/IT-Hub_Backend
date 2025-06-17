import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	app.setGlobalPrefix('api')
	const config = new DocumentBuilder()
		.setTitle('My API')
		.setDescription('API Documentation')
		.setVersion('1.0')
		.addBearerAuth() // Если есть JWT
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('swagger', app, document); // Доступно по /api
	console.log('http://localhost:4200/api')
	await app.listen(4200)
}
bootstrap()
