// Complaint repository - handles all database operations for complaints

const mongoConnection = require('./connection');
const mongoConfig = require('../config/mongodb');
const logger = require('../utils/logger');
const { ObjectId } = require('mongodb');

class ComplaintRepository {
  constructor() {
    this.collectionName = mongoConfig.collections.complaints;
  }

  /**
   * Get complaints collection
   */
  getCollection() {
    return mongoConnection.getCollection(this.collectionName);
  }

  /**
   * Create a new complaint
   */
  async create(complaintData) {
    try {
      const collection = this.getCollection();
      
      const document = {
        ...complaintData,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: complaintData.status || 'pending'
      };

      const result = await collection.insertOne(document);
      
      logger.info('✅ Complaint saved to database', {
        complaintId: complaintData.complaintId,
        mongoId: result.insertedId
      });

      return {
        _id: result.insertedId,
        ...document
      };
    } catch (error) {
      logger.error('❌ Failed to save complaint', {
        complaintId: complaintData.complaintId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Find complaint by ID
   */
  async findById(id) {
    try {
      const collection = this.getCollection();
      const query = ObjectId.isValid(id) 
        ? { _id: new ObjectId(id) }
        : { complaintId: id };
      
      return await collection.findOne(query);
    } catch (error) {
      logger.error('Failed to find complaint by ID', {
        id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Find complaints by phone number
   */
  async findByPhoneNumber(phoneNumber, limit = 10) {
    try {
      const collection = this.getCollection();
      return await collection
        .find({ phoneNumber })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
    } catch (error) {
      logger.error('Failed to find complaints by phone number', {
        phoneNumber,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Find recent complaints by category and location (for duplicate detection)
   */
  async findRecentSimilar(category, wardNumber, hours = 24) {
    try {
      const collection = this.getCollection();
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

      return await collection
        .find({
          category,
          'location.wardNumber': wardNumber,
          createdAt: { $gte: cutoffTime }
        })
        .sort({ createdAt: -1 })
        .toArray();
    } catch (error) {
      logger.error('Failed to find similar complaints', {
        category,
        wardNumber,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Update complaint status
   */
  async updateStatus(complaintId, status, updates = {}) {
    try {
      const collection = this.getCollection();
      const result = await collection.updateOne(
        { complaintId },
        {
          $set: {
            status,
            ...updates,
            updatedAt: new Date()
          }
        }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      logger.error('Failed to update complaint status', {
        complaintId,
        status,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get complaints statistics
   */
  async getStats(filters = {}) {
    try {
      const collection = this.getCollection();
      
      const pipeline = [
        { $match: filters },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            byCategory: {
              $push: '$category'
            },
            byWard: {
              $push: '$location.wardNumber'
            }
          }
        }
      ];

      const result = await collection.aggregate(pipeline).toArray();
      return result[0] || { total: 0 };
    } catch (error) {
      logger.error('Failed to get complaint stats', {
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = new ComplaintRepository();
