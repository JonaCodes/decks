import redaxios from 'redaxios';
import { supabase } from '../lib/supabase';
import type {
  Presentation,
  Slide,
  SlideTemplate,
  BulkSavePayload,
} from '../types/presentation';

async function getAuthHeaders(): Promise<{ Authorization: string }> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  // TODO: remove this
  return { Authorization: '' };

  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }
  return { Authorization: `Bearer ${session.access_token}` };
}

const BASE_URL = '/api';

export const api = {
  // Presentations
  getPresentations: async (): Promise<Presentation[]> => {
    const headers = await getAuthHeaders();
    const res = await redaxios.get(`${BASE_URL}/presentations`, { headers });
    return res.data;
  },

  getPresentation: async (id: number): Promise<Presentation> => {
    const headers = await getAuthHeaders();
    const res = await redaxios.get(`${BASE_URL}/presentations/${id}`, {
      headers,
    });
    return res.data;
  },

  createPresentation: async (name: string): Promise<Presentation> => {
    const headers = await getAuthHeaders();
    const res = await redaxios.post(
      `${BASE_URL}/presentations`,
      { name },
      { headers }
    );
    return res.data;
  },

  updatePresentation: async (
    id: number,
    name: string
  ): Promise<Presentation> => {
    const headers = await getAuthHeaders();
    const res = await redaxios.patch(
      `${BASE_URL}/presentations/${id}`,
      { name },
      { headers }
    );
    return res.data;
  },

  deletePresentation: async (id: number): Promise<void> => {
    const headers = await getAuthHeaders();
    await redaxios.delete(`${BASE_URL}/presentations/${id}`, { headers });
  },

  savePresentation: async (
    id: number,
    payload: BulkSavePayload
  ): Promise<void> => {
    const headers = await getAuthHeaders();
    await redaxios.post(`${BASE_URL}/presentations/${id}/save`, payload, {
      headers,
    });
  },

  // Templates
  getTemplates: async (): Promise<SlideTemplate[]> => {
    const headers = await getAuthHeaders();
    const res = await redaxios.get(`${BASE_URL}/templates`, { headers });
    return res.data;
  },

  getTemplate: async (id: number): Promise<SlideTemplate> => {
    const headers = await getAuthHeaders();
    const res = await redaxios.get(`${BASE_URL}/templates/${id}`, { headers });
    return res.data;
  },

  createTemplate: async (
    name: string,
    description?: string
  ): Promise<SlideTemplate> => {
    const headers = await getAuthHeaders();
    const res = await redaxios.post(
      `${BASE_URL}/templates`,
      { name, description },
      { headers }
    );
    return res.data;
  },

  updateTemplate: async (
    id: number,
    data: {
      name?: string;
      description?: string;
      elements?: SlideTemplate['elements'];
    }
  ): Promise<SlideTemplate> => {
    const headers = await getAuthHeaders();
    const res = await redaxios.patch(`${BASE_URL}/templates/${id}`, data, {
      headers,
    });
    return res.data;
  },

  deleteTemplate: async (id: number): Promise<void> => {
    const headers = await getAuthHeaders();
    await redaxios.delete(`${BASE_URL}/templates/${id}`, { headers });
  },

  // Slides
  addSlide: async (
    presentationId: number,
    templateId?: number
  ): Promise<{ slide: Slide }> => {
    const headers = await getAuthHeaders();
    const res = await redaxios.post(
      `${BASE_URL}/presentations/${presentationId}/slides`,
      { templateId },
      { headers }
    );
    return res.data;
  },

  deleteSlide: async (slideId: number): Promise<void> => {
    const headers = await getAuthHeaders();
    await redaxios.delete(`${BASE_URL}/slides/${slideId}`, { headers });
  },
};
