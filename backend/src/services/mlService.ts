import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001';

// Base interface for ML responses
interface MLResponse {
  success: boolean;
  model: string;
  [key: string]: any;
}

export const mlService = {
  /**
   * Check if the ML service is healthy and available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 2000 });
      return response.data.status === 'healthy';
    } catch (error) {
      console.warn('ML Service is not reachable:', error.message);
      return false;
    }
  },

  /**
   * Calculate student mastery using Bayesian Knowledge Tracing
   */
  async calculateMastery(attempts: any[], params?: any): Promise<MLResponse | null> {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/ml/mastery`, {
        attempts,
        params
      }, { timeout: 3000 });
      return response.data;
    } catch (error) {
      console.error('ML Service Error (BKT):', error.message);
      return null;
    }
  },

  /**
   * Predict the risk of a student becoming confused
   */
  async predictConfusionRisk(features: Record<string, number>): Promise<MLResponse | null> {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/ml/predict-confusion`, {
        features
      }, { timeout: 3000 });
      return response.data;
    } catch (error) {
      console.error('ML Service Error (Confusion Risk):', error.message);
      return null;
    }
  },

  /**
   * Predict if a student will struggle proactively
   */
  async predictEarlyWarning(features: Record<string, number>): Promise<MLResponse | null> {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/ml/early-warning`, {
        features
      }, { timeout: 3000 });
      return response.data;
    } catch (error) {
      console.error('ML Service Error (Early Warning):', error.message);
      return null;
    }
  },

  /**
   * Calculate concept difficulty based on historical student performance
   */
  async calculateConceptDifficulty(conceptStats: Record<string, number>): Promise<MLResponse | null> {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/ml/concept-difficulty`, {
        concept_stats: conceptStats
      }, { timeout: 3000 });
      return response.data;
    } catch (error) {
      console.error('ML Service Error (Concept Difficulty):', error.message);
      return null;
    }
  },

  /**
   * Assign a student to a learning profile cluster
   */
  async predictStudentProfile(features: Record<string, number>): Promise<MLResponse | null> {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/ml/student-profile`, {
        features
      }, { timeout: 3000 });
      return response.data;
    } catch (error) {
      console.error('ML Service Error (Student Profile):', error.message);
      return null;
    }
  },

  /**
   * Detect anomalous spikes in confusion signals
   */
  async detectAnomaly(signalCounts: number[], currentCount?: number): Promise<MLResponse | null> {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/ml/detect-anomaly`, {
        signal_counts: signalCounts,
        current_count: currentCount
      }, { timeout: 3000 });
      return response.data;
    } catch (error) {
      console.error('ML Service Error (Anomaly Detection):', error.message);
      return null;
    }
  },

  /**
   * Classify student confusion text using NLP
   */
  async classifyConfusion(text: string, conceptName?: string): Promise<MLResponse | null> {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/ml/classify-confusion`, {
        text,
        concept_name: conceptName
      }, { timeout: 3000 });
      return response.data;
    } catch (error) {
      console.error('ML Service Error (NLP Classifier):', error.message);
      return null;
    }
  },

  /**
   * Calculate the ensemble Cogniva Learning Risk Score
   */
  async calculateLearningRisk(modelOutputs: Record<string, any>): Promise<MLResponse | null> {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/ml/learning-risk`, {
        model_outputs: modelOutputs
      }, { timeout: 3000 });
      return response.data;
    } catch (error) {
      console.error('ML Service Error (Learning Risk):', error.message);
      return null;
    }
  }
};
