import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client'; // Импортируем тип User из Prisma

type TypeData = keyof User; // Используем ключи Prisma-модели User

export const UserDecorator = createParamDecorator(
	(data: TypeData | undefined, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest();
		const user: User = request.user; // Типизируем user как Prisma User

		return data ? user?.[data] : user;
	}
);