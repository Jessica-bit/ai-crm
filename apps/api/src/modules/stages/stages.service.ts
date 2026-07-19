import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateStageDto } from './dto/create-stage.dto';
import { ListStageDto } from './dto/list-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';

@Injectable()
export class StagesService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateStageDto) {
    return this.prisma.stage.create({
      data: { ...dto, userId },
    });
  }

  async findAll(userId: string, query: ListStageDto) {
    const { page, limit, name } = query;

    const where: Prisma.StageWhereInput = {
      userId,
      deletedAt: null,
      ...(name && { name: { contains: name, mode: 'insensitive' } }),
    };

    const [data, total] = await Promise.all([
      this.prisma.stage.findMany({
        where,
        orderBy: { order: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.stage.count({ where }),
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
    const stage = await this.prisma.stage.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!stage) {
      throw new NotFoundException('Estágio não encontrado');
    }

    return stage;
  }

  async update(userId: string, id: string, dto: UpdateStageDto) {
    // Garante existência e posse antes de atualizar (retorna 404 do findOne).
    await this.findOne(userId, id);

    return this.prisma.stage.update({
      where: { id },
      data: dto,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    const linkedDealsCount = await this.prisma.deal.count({
      where: { stageId: id, deletedAt: null },
    });

    if (linkedDealsCount > 0) {
      throw new ConflictException(
        'Não é possível remover um estágio com deals vinculados',
      );
    }

    return this.prisma.stage.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
