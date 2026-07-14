import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { ListContactDto } from './dto/list-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateContactDto) {
    return this.prisma.contact.create({
      data: { ...dto, userId },
    });
  }

  async findAll(userId: string, query: ListContactDto) {
    const { page, limit, name, email, phone, company } = query;

    const where: Prisma.ContactWhereInput = {
      userId,
      deletedAt: null,
      ...(name && { name: { contains: name, mode: 'insensitive' } }),
      ...(email && { email: { contains: email, mode: 'insensitive' } }),
      ...(phone && { phone: { contains: phone, mode: 'insensitive' } }),
      ...(company && { company: { contains: company, mode: 'insensitive' } }),
    };

    const [data, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.contact.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: string, id: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!contact) {
      throw new NotFoundException('Contato não encontrado');
    }

    return contact;
  }

  async update(userId: string, id: string, dto: UpdateContactDto) {
    // Garante existência e posse antes de atualizar (retorna 404 do findOne).
    await this.findOne(userId, id);

    return this.prisma.contact.update({
      where: { id },
      data: dto,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    return this.prisma.contact.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
