import { IsEmail, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateDto {
	@IsEmail()
	@ApiProperty({ example: 'example@gmail.com', description: 'email' })
	email: string

	@IsString()
	@ApiProperty({ example: '*****', description: 'password 8 символов ' })
	password?: string
	@ApiProperty({ example: 'truefff', description: 'true or false' })
	isAdmin?: boolean
}
