// MongoDB connection manager

const { MongoClient } = require('mongodb');
const mongoConfig = require('../config/mongodb');
const logger = require('../utils/logger');

class MongoDBConnection {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
  }

  /**
   * Establish connection to MongoDB
   */
  async connect() {
    if (this.isConnected) {
      logger.info('MongoDB already connected');
      return this.db;
    }

    try {
      logger.info('Connecting to MongoDB...', {
        dbName: mongoConfig.dbName
      });

      this.client = new MongoClient(mongoConfig.uri, mongoConfig.options);
      await this.client.connect();
      
      // Ping to verify connection
      await this.client.db('admin').command({ ping: 1 });
      
      this.db = this.client.db(mongoConfig.dbName);
      this.isConnected = true;

      logger.info('✅ MongoDB connected successfully', {
        dbName: mongoConfig.dbName,
        collections: Object.keys(mongoConfig.collections)
      });

      return this.db;
    } catch (error) {
      logger.error('❌ MongoDB connection failed', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Get database instance
   */
  getDb() {
    if (!this.isConnected || !this.db) {
      throw new Error('MongoDB not connected. Call connect() first.');
    }
    return this.db;
  }

  /**
   * Get collection by name
   */
  getCollection(collectionName) {
    const db = this.getDb();
    return db.collection(collectionName);
  }

  /**
   * Close connection
   */
  async close() {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      this.db = null;
      this.client = null;
      logger.info('MongoDB connection closed');
    }
  }

  /**
   * Check if connected
   */
  isConnectionActive() {
    return this.isConnected;
  }
}

// Singleton instance
const mongoConnection = new MongoDBConnection();

module.exports = mongoConnection;
