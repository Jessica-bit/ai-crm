import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { ListDealDto } from './dto/list-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';

@Injectable()
export class DealsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateDealDto) {
    await this.ensureContactBelongsToUser(userId, dto.contactId);

    return this.prisma.deal.create({
      data: { ...dto, userId },
    });
  }

  async findAll(userId: string, query: ListDealDto) {
    const { page, limit, title, status, contactId } = query;

    const where: Prisma.DealWhereInput = {
      userId,
      deletedAt: null,
      ...(title && { title: { contains: title, mode: 'insensitive' } }),
      ...(status && { status }),
      ...(contactId && { contactId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.deal.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.deal.count({ where }),
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
    const deal = await this.prisma.deal.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!deal) {
      throw new NotFoundException('Deal não encontrado');
    }

    return deal;
  }

  async update(userId: string, id: string, dto: UpdateDealDto) {
    // Garante existência e posse antes de atualizar (retorna 404 do findOne).
    await this.findOne(userId, id);

    if (dto.contactId) {
      await this.ensureContactBelongsToUser(userId, dto.contactId);
    }

    return this.prisma.deal.update({
      where: { id },
      data: dto,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    return this.prisma.deal.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private async ensureContactBelongsToUser(userId: string, contactId: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id: contactId, userId, deletedAt: null },
    });

    if (!contact) {
      throw new NotFoundException('Contato não encontrado');
    }
  }
}
