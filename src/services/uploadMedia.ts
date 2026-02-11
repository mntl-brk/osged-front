import { uploadMedia } from '@/api/media/uploadMedia'

export const uploadTGDSVideo = async (
  sessionId: string,
  blob: Blob
): Promise<string> => {
  const result = await uploadMedia({
    sessionId: sessionId,
    purpose: 'tgds_test',
    file: blob,
  })

  return result.match(
    (media) => media.media_id,
    (error) => {
      throw error
    }
  )
}