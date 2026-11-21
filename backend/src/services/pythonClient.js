import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:8000';

export const callPythonAudioAnalysis = async (filePath, options = {}) => {
  try {
    const formData = new FormData();
    formData.append('audio_file', fs.createReadStream(filePath));
    
    if (options.agent_id) formData.append('agent_id', options.agent_id);
    if (options.borrower_id) formData.append('borrower_id', options.borrower_id);
    if (options.call_id) formData.append('call_id', options.call_id);
    if (options.language) formData.append('language', options.language);

    const response = await axios.post(`${PYTHON_SERVICE_URL}/api/v1/analyze-audio`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: 100 * 1024 * 1024,
      maxBodyLength: 100 * 1024 * 1024,
      timeout: 300000 // 5 minute timeout for local whisper + librosa
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`Python service error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
    } else if (error.code === 'ECONNREFUSED') {
      throw new Error(`Cannot connect to Python Audio AI service at ${PYTHON_SERVICE_URL}. Ensure uvicorn is running.`);
    } else {
      throw error;
    }
  }
};

export const checkPythonServiceHealth = async () => {
  try {
    const response = await axios.get(`${PYTHON_SERVICE_URL}/health`, { timeout: 3000 });
    return response.data;
  } catch (error) {
    return { status: 'offline', error: error.message };
  }
};
