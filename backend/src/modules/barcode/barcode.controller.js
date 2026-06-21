const Barcode = require('./barcode.model');
const asyncHandler = require('../../middleware/asyncHandler');
const { successResponse } = require('../../utils/responseHandler');
const { ValidationError, NotFoundError } = require('../../utils/customErrors');

const createBarcode = asyncHandler(async (req, res) => {
  const { name, code, description } = req.body;

  const existingBarcode = await Barcode.findOne({ $or: [{ name }, { code }] });

  if (existingBarcode) {
    throw new ValidationError('Barcode symbology with this name or code already exists');
  }

  const barcode = await Barcode.create({ name, code, description });

  successResponse(res, 201, 'Barcode symbology created successfully', barcode);
});

const getAllBarcodes = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, isActive } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } }
    ];
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const barcodes = await Barcode.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
  const total = await Barcode.countDocuments(query);

  successResponse(res, 200, 'Barcode symbologies retrieved successfully', {
    barcodes,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  });
});

const getBarcodeById = asyncHandler(async (req, res) => {
  const barcode = await Barcode.findById(req.params.id);

  if (!barcode) {
    throw new NotFoundError('Barcode symbology not found');
  }

  successResponse(res, 200, 'Barcode symbology retrieved successfully', barcode);
});

const updateBarcode = asyncHandler(async (req, res) => {
  const { name, code, description, isActive } = req.body;

  const barcode = await Barcode.findById(req.params.id);

  if (!barcode) {
    throw new NotFoundError('Barcode symbology not found');
  }

  if (name || code) {
    const existingBarcode = await Barcode.findOne({
      _id: { $ne: req.params.id },
      $or: [...(name ? [{ name }] : []), ...(code ? [{ code }] : [])]
    });

    if (existingBarcode) {
      throw new ValidationError('Barcode symbology with this name or code already exists');
    }
  }

  if (name) barcode.name = name;
  if (code) barcode.code = code;
  if (description !== undefined) barcode.description = description;
  if (isActive !== undefined) barcode.isActive = isActive;

  await barcode.save();

  successResponse(res, 200, 'Barcode symbology updated successfully', barcode);
});

const deleteBarcode = asyncHandler(async (req, res) => {
  const barcode = await Barcode.findById(req.params.id);

  if (!barcode) {
    throw new NotFoundError('Barcode symbology not found');
  }

  await barcode.deleteOne();

  successResponse(res, 200, 'Barcode symbology deleted successfully', null);
});

module.exports = {
  createBarcode,
  getAllBarcodes,
  getBarcodeById,
  updateBarcode,
  deleteBarcode
};
