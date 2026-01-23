// Python Processing API configuration

module.exports = {
  baseUrl: process.env.PYTHON_API_URL || 'http://localhost:8000',
  timeout: parseInt(process.env.PYTHON_API_TIMEOUT) || 30000,
  endpoints: {
    translate: '/api/process/translate',
    classify: '/api/process/classify',
    resolveLocation: '/api/process/resolve-location',
    processComplaint: '/api/process/complaint'
  }
};
