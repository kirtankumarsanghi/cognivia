/**
 * ML Service - Integration with Python ML Engine
 * Connects Node.js backend to Python Flask ML service
 */

import axios from 'axios';
import { env } from '../config/env';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';
const ML_TIMEOUT = 10000; // 10 seconds

interface MLResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const mlService = {
  /**
   * Check if ML service is healthy and available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${ML_SERVICE_URL}/health`, {
        timeout: 3000
      });
      return response.data.status === 'healthy';
    } catch (error) {
      console.warn('ML service health check failed:', error);
      return false;
    }
  },

  /**
   * Get ML service metrics and model status
   */
  async getMetrics(): Promise<any> {
    try {
      const response = await axios.get(`${ML_SERVICE_URL}/ml/metrics`, {
        timeout: ML_TIMEOUT
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching ML metrics:', error);
      return { success: false, models: {} };
    }
  },

  /**
   * Calculate mastery using Bayesian Knowledge Tracing (BKT)
   * Now supports weighted attempts for anti-gaming rate limits
   */
  async calculateMastery(attempts: boolean[], weights?: number[], params?: any): Promise<any> {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/ml/mastery`, {
        attempts: attempts.map((correct, idx) => ({ 
          correct,
          weight: weights ? weights[idx] : 1.0
        })),
        params
      }, { timeout: ML_TIMEOUT });
      
      return response.data.success ? response.data : null;
    } catch (error) {
      console.error('Error calculating mastery:', error);
      return null;
    }
  },

  /**
   * Predict confusion risk for a student-concept pair
   */
  async predictConfusionRisk(features: {
    current_mastery: number;
    prerequisite_avg: number;
    prerequisite_min: number;
    incorrect_attempts: number;
    recent_accuracy: number;
    confusion_frequency: number;
    recent_confusion_count: number;
    time_since_last_practice: number;
    total_attempts: number;
    streak: number;
    revision_completion_rate: number;
    previous_concept_accuracy: number;
  }): Promise<any> {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/ml/predict-confusion`, {
        features
      }, { timeout: ML_TIMEOUT });
      
      return response.data.success ? response.data : null;
    } catch (error) {
      console.error('Error predicting confusion risk:', error);
      return null;
    }
  },

  /**
   * Early warning system - predict if student will struggle with next concept
   */
  async predictEarlyWarning(features: {
    prerequisite_avg: number;
    prerequisite_min: number;
    previous_accuracy: number;
    recent_incorrect: number;
    learning_velocity: number;
    recent_confusion_count: number;
    time_gap_hours: number;
    revision_completion: number;
    concept_difficulty: number;
  }): Promise<any> {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/ml/early-warning`, {
        features
      }, { timeout: ML_TIMEOUT });
      
      return response.data.success ? response.data : null;
    } catch (error) {
      console.error('Error predicting early warning:', error);
      return null;
    }
  },

  /**
   * Calculate adaptive concept difficulty for a student
   */
  async calculateConceptDifficulty(conceptStats: {
    concept_id: string;
    student_features: {
      mastery: number;
      attempts: number;
    };
  }): Promise<any> {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/ml/concept-difficulty`, {
        concept_stats: conceptStats
      }, { timeout: ML_TIMEOUT });
      
      return response.data.success ? response.data : null;
    } catch (error) {
      console.error('Error calculating concept difficulty:', error);
      return null;
    }
  },

  /**
   * Get student learning profile (K-Means clustering)
   */
  async getStudentProfile(features: {
    avg_practice_accuracy: number;
    avg_confusion_frequency: number;
    session_frequency: number;
    revision_completion: number;
    tutor_usage: number;
    avg_mastery_progression: number;
    total_practice_attempts: number;
  }): Promise<any> {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/ml/student-profile`, {
        features
      }, { timeout: ML_TIMEOUT });
      
      return response.data.success ? response.data : null;
    } catch (error) {
      console.error('Error getting student profile:', error);
      return null;
    }
  },

  /**
   * Detect anomalous learning behavior
   */
  async detectAnomaly(signalCounts: number[], currentCount: number): Promise<any> {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/ml/detect-anomaly`, {
        signal_counts: signalCounts,
        current_count: currentCount
      }, { timeout: ML_TIMEOUT });
      
      return response.data.success ? response.data : null;
    } catch (error) {
      console.error('Error detecting anomaly:', error);
      return null;
    }
  },

  /**
   * Classify confusion text using NLP
   */
  async classifyConfusion(text: string, conceptName?: string): Promise<any> {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/ml/classify-confusion`, {
        text,
        concept_name: conceptName
      }, { timeout: ML_TIMEOUT });
      
      return response.data.success ? response.data : null;
    } catch (error) {
      console.error('Error classifying confusion:', error);
      return null;
    }
  },

  /**
   * Calculate learning risk (knowledge decay)
   */
  async calculateLearningRisk(modelOutputs: {
    mastery_probability?: number;
    confusion_risk?: number;
    early_warning?: number;
    days_since_practice?: number;
  }): Promise<any> {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/ml/learning-risk`, {
        model_outputs: modelOutputs
      }, { timeout: ML_TIMEOUT });
      
      return response.data.success ? response.data : null;
    } catch (error) {
      console.error('Error calculating learning risk:', error);
      return null;
    }
  },

  /**
   * Get next-best action recommendation
   */
  async getRecommendation(studentId: string, currentConcept: string, history: string[]): Promise<any> {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/ml/recommendation`, {
        studentId,
        current_concept: currentConcept,
        history
      }, { timeout: ML_TIMEOUT });
      
      return response.data.success ? response.data : null;
    } catch (error) {
      console.error('Error getting recommendation:', error);
      return null;
    }
  }
};
