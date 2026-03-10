import { supabase } from 'utils/general';

interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

const BUCKET_NAME = 'draft-files';

export const constructFilePath = (
  draftId: number,
  userId: number,
  originalFileName: string
) => {
  const sanitizedName = originalFileName
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[\[\]\(\)\{\}\<\>]/g, '') // Remove all types of brackets
    .replace(/[^a-zA-Z0-9:\-_.]/g, ''); // Remove any other illegal characters

  return `draft_${draftId}::user_${userId}::${sanitizedName}`;
};

export const uploadFile = async (
  draftId: number,
  userId: number,
  file: UploadedFile
) => {
  const filePath = constructFilePath(draftId, userId, file.originalname);

  console.log('Uploading file to Supabase:', filePath);
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    console.error('Error uploading file:', error.message);
    return;
  }

  console.log('File uploaded successfully:', data);
};

// Later: implement for image storage to allow accounts/users to upload avatars for instance
export const getFileBuffer = async () => {
  // For development purposes, we can use a local file instead of fetching from Supabase
  // const docxAsHTML = await mammoth.convertToHtml({
  //   path: './services/draft/alice3.docx',
  // });
  // const draftData = await DraftMetadata.findOne({
  //   where: { id: draftId },
  //   attributes: ['user_id', 'original_file_name'],
  // });
  // if (!draftData) throw Error('No draft found');
  // const { user_id: userId, original_file_name: originalFileName } = draftData;
  // const filePath = constructFilePath(draftId, userId, originalFileName!);
  // const { data, error } = await supabase.storage
  //   .from(BUCKET_NAME)
  //   .download(filePath);
  // if (error) {
  //   console.error('Error downloading file:', error.message);
  //   throw Error('Error fetching file buffer');
  // }
  // const arrayBuffer = await data.arrayBuffer();
  // const fileBuffer = Buffer.from(arrayBuffer);
  // return fileBuffer;
};
