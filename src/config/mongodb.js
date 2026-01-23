// MongoDB configuration

module.exports = {
  uri: process.env.MONGODB_URI,
  dbName: process.env.MONGODB_DB_NAME || 'municipal_db',
  options: {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    retryWrites: true,
    w: 'majority'
  },
  collections: {
    zones: 'zones',
    wards: 'wards',
    areas: 'areas',
    complaints: 'complaints'
  }
};
