import { supabase } from '@/integrations/supabase/client';

export const uploadMedia = async (file: File, path: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${path}/${fileName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('media')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('media')
    .getPublicUrl(filePath);

  // Store in media library
  await supabase.from('media_library').insert({
    url: publicUrl,
    filename: file.name,
    file_type: file.type,
    file_size: file.size
  });

  return publicUrl;
};
