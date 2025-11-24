import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";
import { generateCalcQuestion, generateSeriesQuestion, generateDataQuestion } from "./mathEngine";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseGeminiResponse = (text: string) => {
  try {
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return null;
  }
};

// Generate "Daily 10" - A mix of everything
export const generateDaily10 = async (): Promise<Question[]> => {
  const questions: Question[] = [];
  
  // 3 Calc (Local)
  questions.push(generateCalcQuestion('calc_2digit_add'));
  questions.push(generateCalcQuestion('calc_mul_2x1'));
  questions.push(generateCalcQuestion('calc_square'));
  
  // 2 Series (Local)
  questions.push(generateSeriesQuestion('series_basic'));
  questions.push(generateSeriesQuestion('series_multi'));

  // 2 Data (Local)
  questions.push(generateDataQuestion('data_growth_rate'));
  questions.push(generateDataQuestion('data_proportion'));

  // 3 Verbal/Logic (AI)
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate 3 Chinese Civil Service Exam questions: 2 Logical Reasoning (Logic Judgment) and 1 Verbal Understanding (Idiom Filling). Format: JSON array. Fields: id, type ('verbal' or 'logic'), content, options, correctAnswer, explanation.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING },
              content: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING }
            }
          }
        }
      }
    });
    const aiQs = parseGeminiResponse(response.text) || [];
    questions.push(...aiQs);
  } catch (e) {
    // Fallback if AI fails
    questions.push({ id: 'fb1', type: 'verbal', content: '下列成语使用正确的是？', options: ['A', 'B', 'C', 'D'], correctAnswer: 'A', explanation: 'Fallback' });
  }

  return questions.sort(() => Math.random() - 0.5);
};
