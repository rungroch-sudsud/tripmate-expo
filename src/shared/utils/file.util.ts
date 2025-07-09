export function convertBase64ToFile(
  base64Uri: string,
  filename: string,
  mimeType: string
) {
  const base64Data = base64Uri.split(',')[1];
  return {
    uri: base64Uri,
    base64Data: base64Data,
    type: mimeType,
    name: filename,
    isBase64: true,
  };
}
