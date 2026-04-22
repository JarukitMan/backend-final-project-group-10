import { PartialType } from '@nestjs/swagger';
import { BookDto } from './book.dto';

export class UnbookDto extends PartialType(BookDto) {}
