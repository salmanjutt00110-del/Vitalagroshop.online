const GEMINI_MODEL = 'gemini-1.5-flash';

/**
 * Sends a text prompt query to the Google Gemini API.
 * 
 * @param {string} prompt - Input user request.
 * @returns {Promise<string>} Parsed response content.
 */
export async function askGemini(prompt) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error('Gemini API key is missing. Please check VITE_GEMINI_API_KEY in .env.local.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Gemini API error status: ${response.status}`);
  }

  const data = await response.json();
  const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResult) {
    throw new Error('Empty response content received from Gemini API.');
  }

  return textResult;
}

/**
 * Sends a base64 encoded image and instructions for Gemini Vision analysis.
 * 
 * @param {string} base64Data - Raw base64 string (no header prefix).
 * @param {string} mimeType - Image mime type e.g. 'image/jpeg', 'image/png'.
 * @param {string} prompt - OCR or analysis instructions.
 * @returns {Promise<string>} Gemini Vision response.
 */
export async function analyzeImageWithGemini(base64Data, mimeType, prompt) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error('Gemini API key is missing. Please check VITE_GEMINI_API_KEY in .env.local.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            },
            { text: prompt }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Gemini Vision error status: ${response.status}`);
  }

  const data = await response.json();
  const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResult) {
    throw new Error('Empty response content received from Gemini Vision.');
  }

  return textResult;
}
