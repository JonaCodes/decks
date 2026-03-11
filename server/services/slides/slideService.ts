import { Transaction } from 'sequelize';
import { sequelize } from '../../models/index';
import Presentation from '../../models/presentation';
import Slide from '../../models/slide';
import SlideElement from '../../models/slideElement';
import SlideTemplate from '../../models/slideTemplate';

export async function addSlide(
  presentationId: number,
  userId: number,
  templateId?: number | null
) {
  const presentation = await Presentation.findOne({ where: { id: presentationId, userId } });
  if (!presentation) return null;

  return sequelize.transaction(async (t: Transaction) => {
    const maxOrderSlide = await Slide.findOne({
      where: { presentationId },
      order: [['order', 'DESC']],
      transaction: t,
    });
    const newOrder = maxOrderSlide ? maxOrderSlide.order + 1 : 0;

    const slide = await Slide.create(
      { presentationId, templateId: templateId ?? null, order: newOrder },
      { transaction: t }
    );

    if (templateId) {
      const template = await SlideTemplate.findByPk(templateId, {
        include: [{ model: SlideElement, as: 'elements' }],
        transaction: t,
      });

      if (template) {
        const templateElements = (template.get('elements') as SlideElement[] | undefined) ?? [];
        if (templateElements.length > 0) {
          await SlideElement.bulkCreate(
            templateElements.map((el) => ({
              slideId: slide.id,
              templateId: null,
              type: el.type,
              x: el.x,
              y: el.y,
              width: el.width,
              height: el.height,
              rotation: el.rotation,
              revealOrder: el.revealOrder,
              properties: el.properties,
              zIndex: el.zIndex,
            })),
            { transaction: t }
          );
        }
      }
    }

    return slide;
  });
}

export async function deleteSlide(id: number, userId: number) {
  const slide = await Slide.findOne({ where: { id } });
  if (!slide) return null;

  const presentation = await Presentation.findOne({
    where: { id: slide.presentationId, userId },
  });
  if (!presentation) return false;

  await slide.destroy();
  return true;
}
