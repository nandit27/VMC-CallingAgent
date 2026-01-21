// Complaint management routes - API endpoints for complaint CRUD operations

const express = require('express');
const router = express.Router();
const complaintService = require('../modules/complaint-management/service');
const logger = require('../utils/logger');

/**
 * GET /api/complaints
 * Get all complaints (with optional filters)
 */
router.get('/', async (req, res, next) => {
  try {
    const { urgency, status, wardNumber, zone, isDuplicate } = req.query;
    
    const filters = {};
    if (urgency) filters.urgency = urgency;
    if (status) filters.status = status;
    if (wardNumber) filters.wardNumber = wardNumber;
    if (zone) filters.zone = zone;
    if (isDuplicate !== undefined) filters.isDuplicate = isDuplicate === 'true';

    const complaints = await complaintService.getAllComplaints(filters);
    
    res.json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/complaints/:complaintId
 * Get complaint by ID
 */
router.get('/:complaintId', async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    
    const complaint = await complaintService.getComplaintById(complaintId);
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: 'Complaint not found'
      });
    }
    
    res.json({
      success: true,
      complaint
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/complaints/:complaintId/status
 * Update complaint status
 */
router.patch('/:complaintId/status', async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const { status, assignedTo } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }
    
    const result = await complaintService.updateComplaintStatus(
      complaintId,
      status,
      assignedTo
    );
    
    res.json({
      success: true,
      message: 'Status updated successfully',
      result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/complaints/stats/summary
 * Get complaint statistics
 */
router.get('/stats/summary', async (req, res, next) => {
  try {
    const complaints = await complaintService.getAllComplaints();
    
    const stats = {
      total: complaints.length,
      byUrgency: {
        urgent: complaints.filter(c => c.urgency === 'urgent').length,
        high: complaints.filter(c => c.urgency === 'high').length,
        medium: complaints.filter(c => c.urgency === 'medium').length,
        low: complaints.filter(c => c.urgency === 'low').length
      },
      byStatus: {
        new: complaints.filter(c => c.status === 'new').length,
        assigned: complaints.filter(c => c.status === 'assigned').length,
        'in-progress': complaints.filter(c => c.status === 'in-progress').length,
        resolved: complaints.filter(c => c.status === 'resolved').length,
        closed: complaints.filter(c => c.status === 'closed').length
      },
      duplicates: complaints.filter(c => c.isDuplicate).length,
      byCategory: complaints.reduce((acc, c) => {
        acc[c.category] = (acc[c.category] || 0) + 1;
        return acc;
      }, {})
    };
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
