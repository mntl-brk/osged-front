export const splitTextIntoChunks = (text: string): string[] => {
  const sentences = text
    .split(/(\.\.\.|ขั้นที่\s*\d+|และขั้นสุดท้าย)/)
    .reduce((acc: string[], curr) => {
      if (!curr.trim()) return acc;
      if (acc.length === 0) return [curr.trim()];
      acc[acc.length - 1] += curr;
      return acc;
    }, []);

  return sentences.map(s => s.trim()).filter(Boolean);
};