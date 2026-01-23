// HTTP client for Python Processing API

const axios = require('axios');
const pythonApiConfig = require('../../config/python-api');
const logger = require('../../utils/logger');

class PythonAPIClient {
  constructor() {
    this.baseUrl = pythonApiConfig.baseUrl;
    this.timeout = pythonApiConfig.timeout;
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug('Python API Request', {
          method: config.method,
          url: config.url,
          data: config.data
        });
        return config;
      },
      (error) => {
        logger.error('Python API Request Error', { error: error.message });
        return Promise.reject(error);
      }
    );

    // Add response logging
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('Python API Response', {
          status: response.status,
          url: response.config.url
        });
        return response;
      },
      (error) => {
        logger.error('Python API Response Error', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
          data: error.response?.data
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Translate text from source to target language
   */
  async translateText(text, sourceLanguage, targetLanguage = 'en') {
    try {
      const response = await this.client.post(pythonApiConfig.endpoints.translate, {
        text,
        source_language: sourceLanguage,
        target_language: targetLanguage
      });

      return response.data;
    } catch (error) {
      logger.error('Translation failed', {
        error: error.message,
        sourceLanguage,
        targetLanguage
      });
      throw new Error(`Translation failed: ${error.message}`);
    }
  }

  /**
   * Classify complaint category
   */
  async classifyComplaint(text, language = 'en') {
    try {
      const response = await this.client.post(pythonApiConfig.endpoints.classify, {
        text,
        language
      });

      return response.data;
    } catch (error) {
      logger.error('Classification failed', {
        error: error.message
      });
      throw new Error(`Classification failed: ${error.message}`);
    }
  }

  /**
   * Resolve location from text
   */
  async resolveLocation(text) {
    try {
      const response = await this.client.post(pythonApiConfig.endpoints.resolveLocation, {
        text
      });

      return response.data;
    } catch (error) {
      logger.error('Location resolution failed', {
        error: error.message
      });
      throw new Error(`Location resolution failed: ${error.message}`);
    }
  }

  /**
   * Process complete complaint (translation + classification + location)
   */
  async processComplaint(complaintData) {
    try {
      const response = await this.client.post(pythonApiConfig.endpoints.processComplaint, {
        text: complaintData.text,
        language: complaintData.language,
        phone_number: complaintData.phoneNumber,
        call_sid: complaintData.callSid
      });

      return response.data;
    } catch (error) {
      logger.error('Complete complaint processing failed', {
        error: error.message,
        callSid: complaintData.callSid
      });
      throw new Error(`Complaint processing failed: ${error.message}`);
    }
  }

  /**
   * Check API health
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      logger.error('Python API health check failed', {
        error: error.message
      });
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

// Singleton instance
const pythonApiClient = new PythonAPIClient();

module.exports = pythonApiClient;
