import { IsString, IsNotEmpty } from 'class-validator';

export class UploadBookDto {
  @IsNotEmpty()
  @IsString()
  readonly userId!: string;
}