const User = require('../models/User');
const UserPermission = require('../models/UserPermission');
const asyncHandler = require('../middleware/asyncHandler');
const { successResponse } = require('../utils/responseHandler');
const {
  ValidationError,
  ConflictError,
  NotFoundError
} = require('../utils/customErrors');

// All sidebar permission IDs — returned as true for admin roles
const ALL_PERMISSION_IDS = [
  'inv-products','inv-prod-create','inv-prod-deals','inv-prod-expired',
  'inv-prod-lowstock','inv-categories','inv-subcategories','inv-brands',
  'inv-units','inv-attributes','inv-barcode',
  'stock-manage','stock-adjustment','stock-transfer',
  'sales-list','sales-invoices','sales-return',
  'orders-user',
  'promo-banners',
  'purchases-list','purchases-orders','purchases-return',
  'peoples-customers','peoples-billers','peoples-suppliers',
  'peoples-stores','peoples-warehouses',
  'b2b-overview','b2b-wizard','b2b-categories','b2b-subcategories',
  'b2b-subsubcategories','b2b-products','b2b-prod-add',
  'b2b-prod-multivendor','b2b-vendors'
];

const ADMIN_ROLES = ['superadmin', 'admin', 'manager'];

const SIDEBAR_SECTION_META = [
  { id: 'main',            title: 'Main',               subtitle: 'Core workspace' },
  { id: 'inventory',       title: 'Inventory',          subtitle: 'Products and catalog' },
  { id: 'stock',           title: 'Stock',              subtitle: 'Adjustments and transfer' },
  { id: 'sales',           title: 'Sales',              subtitle: 'Invoices and returns' },
  { id: 'orders',          title: 'Orders',             subtitle: 'User order management' },
  { id: 'promo',           title: 'Promo',              subtitle: 'Banners and campaigns' },
  { id: 'purchases',       title: 'Purchases',          subtitle: 'Procurement flow' },
  { id: 'finance',         title: 'Finance & Accounts', subtitle: 'Accounting overview' },
  { id: 'peoples',         title: 'Peoples',            subtitle: 'Customers and suppliers' },
  { id: 'hrm',             title: 'HRM',                subtitle: 'Employee structure' },
  { id: 'role-management', title: 'Role Management',    subtitle: 'Access and governance' },
  { id: 'b2b-management',  title: 'B2B Management',     subtitle: 'Categories, products, vendors' }
];

// ─── Serialise a User doc to a safe plain object ─────────────────────────────
const serialise = (u) => ({
  id:        u._id,
  firstName: u.firstName,
  lastName:  u.lastName,
  fullName:  u.fullName,          // virtual: `${firstName} ${lastName}`
  email:     u.email,
  phone:     u.phone  || null,
  role:      u.role,
  isActive:  u.isActive,
  lastLogin: u.lastLogin || null,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});

// ─── GET /api/users ───────────────────────────────────────────────────────────
const getUsers = asyncHandler(async (req, res) => {
  const page   = Math.max(parseInt(req.query.page)  || 1, 1);
  const limit  = Math.min(parseInt(req.query.limit) || 50, 200);
  const search = req.query.search?.trim();
  const role   = req.query.role;

  const filter = {};

  if (search) {
    const re = new RegExp(search, 'i');
    filter.$or = [
      { firstName: re },
      { lastName:  re },
      { email:     re }
    ];
  }

  if (role) filter.role = role;

  const [users, totalItems] = await Promise.all([
    User.find(filter)
      .select('firstName lastName email phone role isActive lastLogin createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean({ virtuals: true }),   // include fullName virtual
    User.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  successResponse(res, 200, 'Users fetched successfully', {
    users: users.map(serialise),
    pagination: { currentPage: page, totalPages, totalItems, limit }
  });
});

// ─── GET /api/users/:id ───────────────────────────────────────────────────────
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('firstName lastName email phone role isActive lastLogin createdAt updatedAt')
    .lean({ virtuals: true });

  if (!user) throw new NotFoundError('User not found');

  successResponse(res, 200, 'User fetched successfully', { user: serialise(user) });
});

// ─── POST /api/users ──────────────────────────────────────────────────────────
const createUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, fullName, email, password, role, phone } = req.body;

  // Accept either firstName/lastName OR fullName
  let fName = firstName?.trim();
  let lName = (lastName ?? '').trim();

  if (!fName && fullName) {
    const parts = fullName.trim().split(/\s+/);
    fName = parts[0];
    lName = parts.slice(1).join(' ');
  }

  if (!fName)     throw new ValidationError('First name is required');
  if (!email)     throw new ValidationError('Email is required');
  if (!password)  throw new ValidationError('Password is required');

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing)   throw new ConflictError('Email already registered');

  const user = await User.create({
    firstName: fName,
    lastName:  lName,
    email:     email.toLowerCase(),
    password,
    role:      role || 'enduser',
    phone:     phone || undefined
  });

  // Re-fetch with virtuals (password excluded by default select: false)
  const doc = await User.findById(user._id)
    .select('firstName lastName email phone role isActive lastLogin createdAt updatedAt')
    .lean({ virtuals: true });

  successResponse(res, 201, 'User created successfully', { user: serialise(doc) });
});

// ─── PATCH /api/users/:id ─────────────────────────────────────────────────────
const updateUser = asyncHandler(async (req, res) => {
  const allowed = ['isActive', 'role', 'phone', 'firstName', 'lastName'];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('firstName lastName email phone role isActive lastLogin createdAt updatedAt')
   .lean({ virtuals: true });

  if (!user) throw new NotFoundError('User not found');

  successResponse(res, 200, 'User updated successfully', { user: serialise(user) });
});

// ─── DELETE /api/users/:id ────────────────────────────────────────────────────
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new NotFoundError('User not found');

  successResponse(res, 200, 'User deleted successfully');
});

// ─── GET /api/users/:id/permissions ──────────────────────────────────────────
const getPermissions = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('role').lean();
  if (!user) throw new NotFoundError('User not found');

  const includeStructure = req.query.includeStructure === 'true' || req.query.includeStructure === '1';

  let data = {};

  // Admin roles get every permission as true — no DB lookup needed
  if (ADMIN_ROLES.includes(user.role)) {
    ALL_PERMISSION_IDS.forEach(id => { data[id] = true; });
  } else {
    // Non-admin: load saved permissions from DB
    const record = await UserPermission.findOne({ userId: req.params.id }).lean();
    // .lean() converts a Mongoose Map to a plain object; guard for both cases
    const saved = record?.permissions instanceof Map
      ? Object.fromEntries(record.permissions)
      : (record?.permissions ?? {});

    // Fill missing keys with false so the frontend always gets a complete map
    ALL_PERMISSION_IDS.forEach(id => { data[id] = saved[id] === true; });
  }

  if (includeStructure) {
    return successResponse(res, 200, 'Permissions fetched successfully', {
      permissions: data,
      sections: SIDEBAR_SECTION_META
    });
  }

  successResponse(res, 200, 'Permissions fetched successfully', data);
});

// ─── PUT /api/users/:id/permissions ──────────────────────────────────────────
const savePermissions = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('role').lean();
  if (!user) throw new NotFoundError('User not found');

  const incoming = req.body?.permissions;
  if (!incoming || typeof incoming !== 'object') {
    throw new ValidationError('permissions object is required');
  }

  // Only allow known permission IDs
  const cleaned = {};
  ALL_PERMISSION_IDS.forEach(id => {
    cleaned[id] = incoming[id] === true;
  });

  await UserPermission.findOneAndUpdate(
    { userId: req.params.id },
    { $set: { permissions: cleaned } },
    { upsert: true, new: true }
  );

  successResponse(res, 200, 'Permissions saved successfully', cleaned);
});

// ─── GET /api/users/:id/permissions-structure ──────────────────────────────
const getPermissionStructure = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('role').lean();
  if (!user) throw new NotFoundError('User not found');

  successResponse(res, 200, 'Permission structure fetched successfully', {
    sections: SIDEBAR_SECTION_META
  });
});

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getPermissions,
  savePermissions,
  getPermissionStructure
};
