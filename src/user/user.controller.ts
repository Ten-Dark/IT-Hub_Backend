import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	NotFoundException,
	Param,
	Post,
	Put,
	Query,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common'

import { UserService } from './user.service'
import { Auth } from 'src/auth/decorators/Auth.decorator'
import { UpdateDto } from './dto/update.dto'
import { IdValidationPipe } from 'src/pipes/id.validation.pipe'
import { UserDecorator } from './decorators/user.decorator'


@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('profile')
	@Auth()
	async getProfile(@UserDecorator('id') id: string) {
		return this.userService.byId(id)
	}

	@UsePipes(new ValidationPipe())
	@Put('profile')
	@HttpCode(200)
	@Auth()
	async updateProfile(@UserDecorator('id') _id: string, @Body() data: UpdateDto) {
		return this.userService.updateProfile(_id, data)
	}



	@Get('count')
	@Auth('admin')
	async getCountUsers() {
		return this.userService.getCount()
	}

	@Get()
	@Auth('admin')
	async getUsers(@Query('searchTerm') searchTerm?: string) {
		return this.userService.getAll(searchTerm)
	}

	@Get(':id')
	@Auth('admin')
	async getUser(@Param('id', IdValidationPipe) id: string) {
		return this.userService.byId(id)
	}

	@UsePipes(new ValidationPipe())
	@Put(':id')
	@HttpCode(200)
	@Auth('admin')
	async updateUser(
		@Param('id', IdValidationPipe) id: string,
		@Body() data: UpdateDto
	) {
		return this.userService.updateProfile(id, data)
	}

	@Delete(':id')
	@Auth('admin')
	async delete(@Param('id', IdValidationPipe) id: string) {
		const deletedDoc = await this.userService.delete(id)
		if (!deletedDoc) throw new NotFoundException('Movie not found')
	}
}
