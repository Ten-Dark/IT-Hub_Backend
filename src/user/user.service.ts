import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateDto } from './dto/update.dto';
import { Prisma } from '@prisma/client';
import { hash, genSalt } from 'bcryptjs';

@Injectable()
export class UserService {
	constructor(private readonly prisma: PrismaService) {}

	async byId(id: string) {
		const user = await this.prisma.user.findUnique({
			where: { id },
		});

		if (!user) throw new NotFoundException('User not found');
		return user;
	}

	async updateProfile(id: string, data: UpdateDto) {
		const user = await this.prisma.user.findUnique({
			where: { id },
		});

		if (!user) throw new NotFoundException('User not found');

		const existingByEmail = await this.prisma.user.findUnique({
			where: { email: data.email },
		});

		if (existingByEmail && existingByEmail.id !== id) {
			throw new BadRequestException('Email is already in use');
		}

		const updateData: Prisma.UserUpdateInput = {
			email: data.email,
		};

		if (data.password) {
			const salt = await genSalt(10);
			updateData.password = await hash(data.password, salt);
		}

		if (typeof data.isAdmin === 'boolean') {
			updateData.isAdmin = data.isAdmin;
		}

		await this.prisma.user.update({
			where: { id },
			data: updateData,
		});
	}

	// async getFavoriteMovies(id: string) {
	// 	const user = await this.prisma.user.findUnique({
	// 		where: { id },
	// 		select: {
	// 			favorites: {
	// 				include: {
	// 					genres: true,
	// 				},
	// 			},
	// 		},
	// 	});
	//
	// 	if (!user) throw new NotFoundException('User not found');
	//
	// 	return user.favorites;
	// }
	//
	// async toggleFavorite(movieId: string, userId: string) {
	// 	const user = await this.prisma.user.findUnique({
	// 		where: { id: userId },
	// 		select: { favoritesIds: true },
	// 	});
	//
	// 	if (!user) throw new NotFoundException('User not found');
	//
	// 	const isFavorite = user.favoritesIds.includes(movieId);
	//
	// 	const updatedFavorites = isFavorite
	// 		? user.favoritesIds.filter((id) => id !== movieId)
	// 		: [...user.favoritesIds, movieId];
	//
	// 	await this.prisma.user.update({
	// 		where: { id: userId },
	// 		data: {
	// 			favoritesIds: updatedFavorites,
	// 		},
	// 	});
	// }

	async getCount() {
		return this.prisma.user.count();
	}

	async getAll(searchTerm?: string) {
		const where: Prisma.UserWhereInput = searchTerm
			? {
				OR: [
					{
						email: {
							contains: searchTerm,
							mode: 'insensitive',
						},
					},
				],
			}
			: {};

		return this.prisma.user.findMany({
			where,
			select: {
				id: true,
				email: true,
				isAdmin: true,
				createdAt: true,
			},
			orderBy: {
				createdAt: 'desc',
			},
		});
	}

	async delete(id: string) {
		const user = await this.prisma.user.findUnique({
			where: { id },
		});

		if (!user) throw new NotFoundException('User not found');

		return this.prisma.user.delete({
			where: { id },
		});
	}
}
