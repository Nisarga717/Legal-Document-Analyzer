import pdfParse from 'pdf-parse';
import fs from 'fs';

export const extractTextFromPDF = async (filePath: string): Promise<string> => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.text || '';
  } catch (error) {
    console.error('PDF Parsing Error:', error);
    throw new Error('Failed to extract text from PDF file');
  }
};
