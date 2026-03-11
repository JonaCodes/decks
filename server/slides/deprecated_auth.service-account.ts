/**
 * We are not using this service-account flow for local deck generation.
 *
 * Why: `drive.files.copy` creates the generated deck in the authenticated
 * account's Drive. Service accounts do not have normal My Drive storage quota,
 * so the copy step fails with `The user's Drive storage quota has been
 * exceeded` even when the human user's Drive is fine.
 *
 * If we need this flow later, the practical workaround is to copy into a Shared
 * Drive that the service account can access, or use delegated user auth so the
 * output deck is created in a real user's Drive instead of the service
 * account's storage.
 */
import { google } from 'googleapis';

export async function getGoogleClients() {
  try {
    const auth = new google.auth.GoogleAuth({
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/presentations',
      ],
    });

    const slides = google.slides({ version: 'v1', auth });
    const drive = google.drive({ version: 'v3', auth });

    return { slides, drive };
  } catch (error) {
    throw new Error(
      `Failed to initialize Google API clients: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
