import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { standardRateLimit } from '../middleware/rate-limit.middleware.js';
import { sendVerificationStatusEmail } from '../services/email.service.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

/**
 * @route   GET /api/admin/pending-doctors
 * @desc    Get all pending doctor verifications
 * @access  Private (Admin only)
 */
router.get('/pending-doctors', standardRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await query(
      `SELECT 
        d.id, d.user_id, d.specialization, d.license_number, d.years_of_experience,
        d.medical_council_registration, d.certificate_url, d.government_id_url,
        d.government_id_type, d.verification_notes, d.created_at,
        u.name, u.email, u.phone, u.created_at as user_created_at
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       WHERE d.status = 'PENDING'
       ORDER BY d.created_at ASC
       LIMIT $1 OFFSET $2`,
      [parseInt(limit), offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) FROM doctors WHERE status = $1',
      ['PENDING']
    );

    res.json({
      success: true,
      data: {
        doctors: result.rows,
        pagination: {
          total: parseInt(countResult.rows[0].count),
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get pending doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending doctors',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @route   GET /api/admin/pending-pharmacies
 * @desc    Get all pending pharmacy verifications
 * @access  Private (Admin only)
 */
router.get('/pending-pharmacies', standardRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await query(
      `SELECT 
        p.id, p.user_id, p.pharmacy_name, p.owner_name, p.address, p.city, p.state,
        p.pin_code, p.pharmacy_registration_number, p.gst_number,
        p.drug_license_certificate_url, p.verification_notes, p.created_at,
        u.name, u.email, u.phone, u.created_at as user_created_at
       FROM pharmacies p
       JOIN users u ON p.user_id = u.id
       WHERE p.status = 'PENDING'
       ORDER BY p.created_at ASC
       LIMIT $1 OFFSET $2`,
      [parseInt(limit), offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) FROM pharmacies WHERE status = $1',
      ['PENDING']
    );

    res.json({
      success: true,
      data: {
        pharmacies: result.rows,
        pagination: {
          total: parseInt(countResult.rows[0].count),
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get pending pharmacies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending pharmacies',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @route   GET /api/admin/doctor/:id
 * @desc    Get doctor details by ID
 * @access  Private (Admin only)
 */
router.get('/doctor/:id', standardRateLimit, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        d.*, u.name, u.email, u.phone, u.created_at as user_created_at
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       WHERE d.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @route   GET /api/admin/pharmacy/:id
 * @desc    Get pharmacy details by ID
 * @access  Private (Admin only)
 */
router.get('/pharmacy/:id', standardRateLimit, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        p.*, u.name, u.email, u.phone, u.created_at as user_created_at
       FROM pharmacies p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get pharmacy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pharmacy details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @route   POST /api/admin/approve-doctor/:id
 * @desc    Approve doctor verification
 * @access  Private (Admin only)
 */
router.post('/approve-doctor/:id', standardRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const adminId = req.user.id;

    // Get doctor details
    const doctorResult = await query(
      'SELECT d.*, u.email, u.name FROM doctors d JOIN users u ON d.user_id = u.id WHERE d.id = $1',
      [id]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    const doctor = doctorResult.rows[0];

    if (doctor.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Doctor is already ${doctor.status}`,
      });
    }

    // Update doctor status
    await query(
      `UPDATE doctors 
       SET verified = TRUE, status = 'APPROVED', verified_by = $1, verified_at = CURRENT_TIMESTAMP,
           verification_notes = $2
       WHERE id = $3`,
      [adminId, notes || null, id]
    );

    // Update user status
    await query(
      'UPDATE users SET verified = TRUE, status = $1 WHERE id = $2',
      ['APPROVED', doctor.user_id]
    );

    // Log admin action
    await query(
      `INSERT INTO admin_actions (id, admin_id, action_type, target_type, target_id, previous_status, new_status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [uuidv4(), adminId, 'APPROVE_DOCTOR', 'DOCTOR', id, 'PENDING', 'APPROVED', notes || null]
    );

    // Send verification status email
    try {
      await sendVerificationStatusEmail(doctor.email, 'APPROVED', 'DOCTOR', notes);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    res.json({
      success: true,
      message: 'Doctor approved successfully',
    });
  } catch (error) {
    console.error('Approve doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve doctor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @route   POST /api/admin/reject-doctor/:id
 * @desc    Reject doctor verification
 * @access  Private (Admin only)
 */
router.post('/reject-doctor/:id', standardRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const adminId = req.user.id;

    if (!notes) {
      return res.status(400).json({
        success: false,
        message: 'Rejection notes are required',
      });
    }

    // Get doctor details
    const doctorResult = await query(
      'SELECT d.*, u.email, u.name FROM doctors d JOIN users u ON d.user_id = u.id WHERE d.id = $1',
      [id]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    const doctor = doctorResult.rows[0];

    if (doctor.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Doctor is already ${doctor.status}`,
      });
    }

    // Update doctor status
    await query(
      `UPDATE doctors 
       SET verified = FALSE, status = 'REJECTED', verified_by = $1, verified_at = CURRENT_TIMESTAMP,
           verification_notes = $2
       WHERE id = $3`,
      [adminId, notes, id]
    );

    // Update user status
    await query(
      'UPDATE users SET verified = FALSE, status = $1 WHERE id = $2',
      ['REJECTED', doctor.user_id]
    );

    // Log admin action
    await query(
      `INSERT INTO admin_actions (id, admin_id, action_type, target_type, target_id, previous_status, new_status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [uuidv4(), adminId, 'REJECT_DOCTOR', 'DOCTOR', id, 'PENDING', 'REJECTED', notes]
    );

    // Send verification status email
    try {
      await sendVerificationStatusEmail(doctor.email, 'REJECTED', 'DOCTOR', notes);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    res.json({
      success: true,
      message: 'Doctor rejected successfully',
    });
  } catch (error) {
    console.error('Reject doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject doctor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @route   POST /api/admin/approve-pharmacy/:id
 * @desc    Approve pharmacy verification
 * @access  Private (Admin only)
 */
router.post('/approve-pharmacy/:id', standardRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const adminId = req.user.id;

    // Get pharmacy details
    const pharmacyResult = await query(
      'SELECT p.*, u.email, u.name FROM pharmacies p JOIN users u ON p.user_id = u.id WHERE p.id = $1',
      [id]
    );

    if (pharmacyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found',
      });
    }

    const pharmacy = pharmacyResult.rows[0];

    if (pharmacy.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Pharmacy is already ${pharmacy.status}`,
      });
    }

    // Update pharmacy status
    await query(
      `UPDATE pharmacies 
       SET verified = TRUE, status = 'APPROVED', verified_by = $1, verified_at = CURRENT_TIMESTAMP,
           verification_notes = $2
       WHERE id = $3`,
      [adminId, notes || null, id]
    );

    // Update user status
    await query(
      'UPDATE users SET verified = TRUE, status = $1 WHERE id = $2',
      ['APPROVED', pharmacy.user_id]
    );

    // Log admin action
    await query(
      `INSERT INTO admin_actions (id, admin_id, action_type, target_type, target_id, previous_status, new_status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [uuidv4(), adminId, 'APPROVE_PHARMACY', 'PHARMACY', id, 'PENDING', 'APPROVED', notes || null]
    );

    // Send verification status email
    try {
      await sendVerificationStatusEmail(pharmacy.email, 'APPROVED', 'PHARMACY', notes);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    res.json({
      success: true,
      message: 'Pharmacy approved successfully',
    });
  } catch (error) {
    console.error('Approve pharmacy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve pharmacy',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @route   POST /api/admin/reject-pharmacy/:id
 * @desc    Reject pharmacy verification
 * @access  Private (Admin only)
 */
router.post('/reject-pharmacy/:id', standardRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const adminId = req.user.id;

    if (!notes) {
      return res.status(400).json({
        success: false,
        message: 'Rejection notes are required',
      });
    }

    // Get pharmacy details
    const pharmacyResult = await query(
      'SELECT p.*, u.email, u.name FROM pharmacies p JOIN users u ON p.user_id = u.id WHERE p.id = $1',
      [id]
    );

    if (pharmacyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found',
      });
    }

    const pharmacy = pharmacyResult.rows[0];

    if (pharmacy.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Pharmacy is already ${pharmacy.status}`,
      });
    }

    // Update pharmacy status
    await query(
      `UPDATE pharmacies 
       SET verified = FALSE, status = 'REJECTED', verified_by = $1, verified_at = CURRENT_TIMESTAMP,
           verification_notes = $2
       WHERE id = $3`,
      [adminId, notes, id]
    );

    // Update user status
    await query(
      'UPDATE users SET verified = FALSE, status = $1 WHERE id = $2',
      ['REJECTED', pharmacy.user_id]
    );

    // Log admin action
    await query(
      `INSERT INTO admin_actions (id, admin_id, action_type, target_type, target_id, previous_status, new_status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [uuidv4(), adminId, 'REJECT_PHARMACY', 'PHARMACY', id, 'PENDING', 'REJECTED', notes]
    );

    // Send verification status email
    try {
      await sendVerificationStatusEmail(pharmacy.email, 'REJECTED', 'PHARMACY', notes);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    res.json({
      success: true,
      message: 'Pharmacy rejected successfully',
    });
  } catch (error) {
    console.error('Reject pharmacy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject pharmacy',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @route   GET /api/admin/actions
 * @desc    Get admin action logs
 * @access  Private (Admin only)
 */
router.get('/actions', standardRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 50, actionType, targetType } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let queryText = `
      SELECT aa.*, u.name as admin_name, u.email as admin_email
      FROM admin_actions aa
      JOIN users u ON aa.admin_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (actionType) {
      queryText += ` AND aa.action_type = $${paramCount}`;
      params.push(actionType);
      paramCount++;
    }

    if (targetType) {
      queryText += ` AND aa.target_type = $${paramCount}`;
      params.push(targetType);
      paramCount++;
    }

    queryText += ` ORDER BY aa.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), offset);

    const result = await query(queryText, params);

    const countResult = await query(
      'SELECT COUNT(*) FROM admin_actions',
      []
    );

    res.json({
      success: true,
      data: {
        actions: result.rows,
        pagination: {
          total: parseInt(countResult.rows[0].count),
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get admin actions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin actions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;

