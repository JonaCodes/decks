import { Op, Transaction } from 'sequelize';
import { sequelize } from '../../models/index';
import Presentation from '../../models/presentation';
import Slide from '../../models/slide';
import SlideElement from '../../models/slideElement';
import PresentationPlaceholder from '../../models/presentationPlaceholder';

export async function listPresentations(userId: number) {
  return Presentation.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
  });
}

export async function getPresentation(id: number, userId: number) {
  return Presentation.findOne({
    where: { id, userId },
    include: [
      {
        model: Slide,
        as: 'slides',
        include: [{ model: SlideElement, as: 'elements' }],
      },
      { model: PresentationPlaceholder, as: 'placeholders' },
    ],
    order: [
      [{ model: Slide, as: 'slides' }, 'order', 'ASC'],
    ],
  });
}

export async function createPresentation(name: string, userId: number) {
  return Presentation.create({ name, userId });
}

export async function updatePresentationName(
  id: number,
  userId: number,
  name: string
) {
  const presentation = await Presentation.findOne({ where: { id, userId } });
  if (!presentation) return null;
  return presentation.update({ name });
}

export async function deletePresentation(id: number, userId: number) {
  const presentation = await Presentation.findOne({ where: { id, userId } });
  if (!presentation) return false;
  await presentation.destroy();
  return true;
}

interface BulkSaveSlideElement {
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

interface BulkSaveSlide {
  id?: number;
  presentationId: number;
  templateId?: number | null;
  order: number;
  backgroundColor?: string;
  elements: BulkSaveSlideElement[];
}

interface BulkSavePlaceholder {
  presentationId: number;
  placeholderKey: string;
  imageSrc: string;
}

export async function bulkSavePresentation(
  presentationId: number,
  userId: number,
  slides: BulkSaveSlide[],
  placeholders: BulkSavePlaceholder[]
) {
  const presentation = await Presentation.findOne({
    where: { id: presentationId, userId },
  });
  if (!presentation) return null;

  await sequelize.transaction(async (t: Transaction) => {
    // Upsert slides and their elements
    const savedSlideIds: number[] = [];

    for (const slideData of slides) {
      const { elements, ...slideFields } = slideData;

      let slide: Slide;
      if (slideFields.id) {
        const existing = await Slide.findByPk(slideFields.id, {
          transaction: t,
        });
        if (existing && existing.presentationId === presentationId) {
          await existing.update(slideFields, { transaction: t });
          slide = existing;
        } else {
          slide = await Slide.create(
            { ...slideFields, presentationId },
            { transaction: t }
          );
        }
      } else {
        slide = await Slide.create(
          { ...slideFields, presentationId },
          { transaction: t }
        );
      }

      savedSlideIds.push(slide.id);

      // Upsert elements for this slide
      const savedElementIds: number[] = [];
      for (const elementData of elements) {
        const { id: elementId, ...elementFields } = elementData;
        if (elementId) {
          const existing = await SlideElement.findByPk(elementId, {
            transaction: t,
          });
          if (existing && existing.slideId === slide.id) {
            await existing.update(elementFields, { transaction: t });
            savedElementIds.push(existing.id);
          } else {
            const created = await SlideElement.create(
              { ...elementFields, slideId: slide.id, templateId: null },
              { transaction: t }
            );
            savedElementIds.push(created.id);
          }
        } else {
          const created = await SlideElement.create(
            { ...elementFields, slideId: slide.id, templateId: null },
            { transaction: t }
          );
          savedElementIds.push(created.id);
        }
      }

      // Delete removed elements
      if (savedElementIds.length === 0) {
        await SlideElement.destroy({ where: { slideId: slide.id }, transaction: t });
      } else {
        await SlideElement.destroy({
          where: { slideId: slide.id, id: { [Op.notIn]: savedElementIds } },
          transaction: t,
        });
      }
    }

    // Delete removed slides (cascades to their elements)
    await Slide.destroy({
      where: {
        presentationId,
        id: { [Op.notIn]: savedSlideIds },
      },
      transaction: t,
    });

    // Upsert placeholders
    await PresentationPlaceholder.destroy({
      where: { presentationId },
      transaction: t,
    });
    if (placeholders.length > 0) {
      await PresentationPlaceholder.bulkCreate(
        placeholders.map((p) => ({ ...p, presentationId })),
        { transaction: t }
      );
    }
  });

  return getPresentation(presentationId, userId);
}
