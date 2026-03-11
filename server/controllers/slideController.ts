import { Request, Response } from 'express';
import { addSlide, deleteSlide } from '../services/slides/slideService';
import { HTTP_STATUS } from '../constants/httpStatus';

const INVALID_PRESENTATION_ID = 'Invalid presentation ID';
const INVALID_SLIDE_ID = 'Invalid slide ID';
const INVALID_TEMPLATE_ID = 'Invalid template ID';
const SLIDE_NOT_FOUND = 'Slide not found';
const FORBIDDEN = 'Forbidden';

export const add = async (req: Request, res: Response) => {
  const presentationId = parseInt(req.params.presentationId, 10);
  if (isNaN(presentationId)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: INVALID_PRESENTATION_ID });
  }

  const { templateId } = req.body;
  let resolvedTemplateId: number | undefined;
  if (templateId !== undefined) {
    const parsed = parseInt(templateId, 10);
    if (isNaN(parsed)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: INVALID_TEMPLATE_ID });
    }
    resolvedTemplateId = parsed;
  }

  const slide = await addSlide(presentationId, req.user!.id, resolvedTemplateId);
  if (!slide) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ error: FORBIDDEN });
  }
  return res.status(HTTP_STATUS.CREATED).json(slide);
};

export const remove = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: INVALID_SLIDE_ID });
  }

  const deleted = await deleteSlide(id, req.user!.id);
  if (deleted === null) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ error: SLIDE_NOT_FOUND });
  }
  if (!deleted) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ error: FORBIDDEN });
  }

  return res.status(HTTP_STATUS.NO_CONTENT).send();
};
