import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { ListContactDto } from './dto/list-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@UseGuards(JwtAuthGuard)
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateContactDto) {
    return this.contactsService.create(userId, dto);
  }

  @Get()
  findAll(@CurrentUser('sub') userId: string, @Query() query: ListContactDto) {
    return this.contactsService.findAll(userId, query);
  }

  @Get(':id')
  findOne(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.contactsService.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateContactDto,
  ) {
    return this.contactsService.update(userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.contactsService.remove(userId, id);
  }
}
