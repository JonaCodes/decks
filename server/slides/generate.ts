import { getGoogleClients } from './auth.js';
import { discoverTemplateSlides } from './discovery.js';
import { buildBatchUpdateRequests } from './request-builder.js';
import type { SlidePayload } from './manifest.js';

export interface GenerateInput {
  templatePresentationId: string;
  outputTitle: string;
  slides: SlidePayload[];
}

export interface GenerateResult {
  presentationId: string;
  url: string;
}

export async function generatePresentation(
  input: GenerateInput
): Promise<GenerateResult> {
  const { slides, drive } = await getGoogleClients();

  let copyResponse;
  try {
    copyResponse = await drive.files.copy({
      fileId: input.templatePresentationId,
      requestBody: { name: input.outputTitle },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to copy template presentation "${input.templatePresentationId}". ` +
        'Check that TEMPLATE_PRESENTATION_ID is the Slides ID from the URL and that the ' +
        'Google account you authorized via GOOGLE_OAUTH_CLIENT_SECRET_PATH can open the template deck in Drive. ' +
        `Original error: ${message}`
    );
  }
  const presentationId = copyResponse.data.id!;

  const templateMap = await discoverTemplateSlides(slides, presentationId);

  const requests = buildBatchUpdateRequests(input.slides, templateMap);

  await slides.presentations.batchUpdate({
    presentationId,
    requestBody: { requests },
  });

  return {
    presentationId,
    url: `https://docs.google.com/presentation/d/${presentationId}/edit`,
  };
}
