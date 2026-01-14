export const splitTextIntoChunks = (
  text: string,
  maxLength = 90
): string[] => {
  // 1. แยกตามจุดหยุดธรรมชาติ
  const rawParts = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?…])|(?<=\.\.\.)|(?<=ครับ)|(?<=ค่ะ)/);

  const chunks: string[] = [];
  let buffer = '';

  for (const part of rawParts) {
    const p = part.trim();
    if (!p) continue;

    // ถ้า buffer ยังไม่ยาวเกิน → ต่อ
    if ((buffer + ' ' + p).length <= maxLength) {
      buffer = buffer ? `${buffer} ${p}` : p;
    } else {
      // ดัน buffer เก่าออก
      if (buffer) chunks.push(buffer);
      buffer = p;
    }
  }

  if (buffer) chunks.push(buffer);

  return chunks;
};