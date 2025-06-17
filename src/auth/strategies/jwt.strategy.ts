import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly configService: ConfigService,
		private readonly prisma: PrismaService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false, // Рекомендуется false для проверки срока действия токена
			secretOrKey: configService.get('JWT_SECRET'),
		});
	}

	async validate(payload: { id: string }): Promise<User | null> {
		return this.prisma.user.findUnique({
			where: { id: payload.id },
		});
	}
}