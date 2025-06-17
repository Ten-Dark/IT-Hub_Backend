import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { genSalt, hash, compare } from 'bcryptjs'

import { RefreshTokenDto } from './dto/refreshToken.dto'
import { User } from '@prisma/client';
import { AuthDto } from './dto/auth.dto'

import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private readonly jwtService: JwtService
	) {}

	async login({ email, password }: AuthDto) {
		const user = await this.validateUser(email, password)

		const tokens = await this.issueTokenPair(String(user.id))

		return {
			user: this.returnUserFields(user),
			...tokens,
		}
	}


async register({ email, password }: AuthDto) {
	// Хешируем пароль
	const salt = await genSalt(10);
	const hashedPassword = await hash(password, salt);

	// Создаём пользователя в БД через Prisma
	const user = await this.prisma.user.create({
		data: {
			email,
			password: hashedPassword,
		},
	});

	// Генерируем токены (предполагается, что `this.issueTokenPair` уже адаптирован под Prisma)
	const tokens = await this.issueTokenPair(String(user.id)); // В Prisma обычно `id`, а не `_id`

	return {
		user: this.returnUserFields(user), // Адаптируйте `returnUserFields` под структуру Prisma
		...tokens,
	};
}
	async getNewTokens({ refreshToken }: RefreshTokenDto) {
		if (!refreshToken) throw new UnauthorizedException('Please sign in!');

		const result = await this.jwtService.verifyAsync(refreshToken);
		if (!result) throw new UnauthorizedException('Invalid token or expired!');

		// Заменяем UserModel.findById() на prisma.user.findUnique()
		const user = await this.prisma.user.findUnique({
			where: { id: result.id }, // Если в токене остался _id, можно заменить на result.id
		});

		if (!user) throw new UnauthorizedException('User not found');

		const tokens = await this.issueTokenPair(user.id);
		return {
			user: this.returnUserFields(user),
			...tokens,
		};
	}
	async findByEmail(email: string) {
		return this.prisma.user.findUnique({
			where: { email },
		});
	}

	async validateUser(email: string, password: string): Promise<User> {
		const user = await this.findByEmail(email);
		if (!user) throw new UnauthorizedException('User not found');

		const isValidPassword = await compare(password, user.password);
		if (!isValidPassword) throw new UnauthorizedException('Invalid password');

		return user;
	}

	async issueTokenPair(userId: string) {
		const data = { _id: userId }

		const refreshToken = await this.jwtService.signAsync(data, {
			expiresIn: '15d',
		})

		const accessToken = await this.jwtService.signAsync(data, {
			expiresIn: '1h',
		})

		return { refreshToken, accessToken }
	}

	returnUserFields(user: User) {  // User — это тип, сгенерированный Prisma
		return {
			id: user.id,  // Заменяем _id на id
			email: user.email,
			isAdmin: user.isAdmin,  // Если такое поле есть в модели
		};
	}
}
