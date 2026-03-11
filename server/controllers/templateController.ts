import { Request, Response } from 'express';
import {
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from '../services/templates/templateService';
import { HTTP_STATUS } from '../constants/httpStatus';

const INVALID_TEMPLATE_ID = 'Invalid template ID';
const TEMPLATE_NOT_FOUND = 'Template not found';
const NAME_REQUIRED = 'name is required';
const ELEMENTS_REQUIRED = 'elements array is required';

export const list = async (req: Request, res: Response) => {
  const templates = await listTemplates(req.user!.id);
  return res.json(templates);
};

export const get = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: INVALID_TEMPLATE_ID });
  }

  const template = await getTemplate(id, req.user!.id);
  if (!template) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ error: TEMPLATE_NOT_FOUND });
  }

  return res.json(template);
};

export const create = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: NAME_REQUIRED });
  }

  const template = await createTemplate(name, req.user!.id, description);
  return res.status(HTTP_STATUS.CREATED).json(template);
};

export const update = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: INVALID_TEMPLATE_ID });
  }

  const { name, description, elements } = req.body;
  if (!Array.isArray(elements)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: ELEMENTS_REQUIRED });
  }

  const template = await updateTemplate(id, req.user!.id, { name, description, elements });
  if (!template) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ error: TEMPLATE_NOT_FOUND });
  }

  return res.json(template);
};

export const remove = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: INVALID_TEMPLATE_ID });
  }

  const deleted = await deleteTemplate(id, req.user!.id);
  if (!deleted) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ error: TEMPLATE_NOT_FOUND });
  }

  return res.status(HTTP_STATUS.NO_CONTENT).send();
};
