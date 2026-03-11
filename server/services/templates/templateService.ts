import { Op, Transaction } from 'sequelize';
import { sequelize } from '../../models/index';
import SlideTemplate from '../../models/slideTemplate';
import SlideElement from '../../models/slideElement';

export async function listTemplates(userId: number) {
  return SlideTemplate.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
  });
}

export async function getTemplate(id: number, userId: number) {
  return SlideTemplate.findOne({
    where: { id, userId },
    include: [{ model: SlideElement, as: 'elements' }],
  });
}

export async function createTemplate(
  name: string,
  userId: number,
  description?: string
) {
  return SlideTemplate.create({ name, userId, description: description ?? null });
}

interface TemplateElementInput {
  id?: number;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  revealOrder?: number | null;
  properties?: Record<string, unknown>;
  zIndex?: number;
}

export async function updateTemplate(
  id: number,
  userId: number,
  fields: { name?: string; description?: string; elements?: TemplateElementInput[] }
) {
  const template = await SlideTemplate.findOne({ where: { id, userId } });
  if (!template) return null;

  await sequelize.transaction(async (t: Transaction) => {
    if (fields.name !== undefined || fields.description !== undefined) {
      await template.update(
        {
          ...(fields.name !== undefined && { name: fields.name }),
          ...(fields.description !== undefined && {
            description: fields.description,
          }),
        },
        { transaction: t }
      );
    }

    if (fields.elements !== undefined) {
      const savedElementIds: number[] = [];

      for (const elementData of fields.elements) {
        const { id: elementId, ...elementFields } = elementData;
        if (elementId) {
          const existing = await SlideElement.findByPk(elementId, {
            transaction: t,
          });
          if (existing && existing.templateId === template.id) {
            await existing.update(elementFields, { transaction: t });
            savedElementIds.push(existing.id);
          } else {
            const created = await SlideElement.create(
              { ...elementFields, templateId: template.id, slideId: null },
              { transaction: t }
            );
            savedElementIds.push(created.id);
          }
        } else {
          const created = await SlideElement.create(
            { ...elementFields, templateId: template.id, slideId: null },
            { transaction: t }
          );
          savedElementIds.push(created.id);
        }
      }

      if (savedElementIds.length === 0) {
        await SlideElement.destroy({ where: { templateId: template.id }, transaction: t });
      } else {
        await SlideElement.destroy({
          where: { templateId: template.id, id: { [Op.notIn]: savedElementIds } },
          transaction: t,
        });
      }
    }
  });

  return getTemplate(id, userId);
}

export async function deleteTemplate(id: number, userId: number) {
  const template = await SlideTemplate.findOne({ where: { id, userId } });
  if (!template) return false;
  await template.destroy();
  return true;
}
