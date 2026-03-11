import { Request, Response } from 'express';
import {
  listPresentations,
  getPresentation,
  createPresentation,
  updatePresentationName,
  deletePresentation,
  bulkSavePresentation,
} from '../services/presentations/presentationService';
import { HTTP_STATUS } from '../constants/httpStatus';

const INVALID_PRESENTATION_ID = 'Invalid presentation ID';
const PRESENTATION_NOT_FOUND = 'Presentation not found';
const NAME_REQUIRED = 'name is required';
const SLIDES_PLACEHOLDERS_REQUIRED = 'slides and placeholders arrays are required';

export const list = async (req: Request, res: Response) => {
  const presentations = await listPresentations(req.user!.id);
  return res.json(presentations);
};

export const get = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: INVALID_PRESENTATION_ID });
  }

  const presentation = await getPresentation(id, req.user!.id);
  if (!presentation) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ error: PRESENTATION_NOT_FOUND });
  }

  return res.json(presentation);
};

export const create = async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: NAME_REQUIRED });
  }

  const presentation = await createPresentation(name, req.user!.id);
  return res.status(HTTP_STATUS.CREATED).json(presentation);
};

export const update = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: INVALID_PRESENTATION_ID });
  }

  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: NAME_REQUIRED });
  }

  const presentation = await updatePresentationName(id, req.user!.id, name);
  if (!presentation) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ error: PRESENTATION_NOT_FOUND });
  }

  return res.json(presentation);
};

export const remove = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: INVALID_PRESENTATION_ID });
  }

  const deleted = await deletePresentation(id, req.user!.id);
  if (!deleted) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ error: PRESENTATION_NOT_FOUND });
  }

  return res.status(HTTP_STATUS.NO_CONTENT).send();
};

export const bulkSave = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: INVALID_PRESENTATION_ID });
  }

  const { slides, placeholders } = req.body;
  if (!Array.isArray(slides) || !Array.isArray(placeholders)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: SLIDES_PLACEHOLDERS_REQUIRED });
  }

  const presentation = await bulkSavePresentation(id, req.user!.id, slides, placeholders);
  if (!presentation) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ error: PRESENTATION_NOT_FOUND });
  }

  return res.json(presentation);
};
