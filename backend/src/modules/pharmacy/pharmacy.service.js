/**
 * modules/pharmacy/pharmacy.service.js
 */

import Pharmacy from '../../database/models/Pharmacy.model.js';

export const listAll = async (query = {}) => {
  const filter = {};
  if (query.city) {
    filter['address.city'] = { $regex: query.city, $options: 'i' };
  }
  if (query.name) {
    filter.pharmacyName = { $regex: query.name, $options: 'i' };
  }

  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 20, 50);
  const skip = (page - 1) * limit;

  const [pharmacies, total] = await Promise.all([
    Pharmacy.find(filter)
      .select('pharmacyName address contactInfo operatingHours')
      .skip(skip)
      .limit(limit)
      .sort({ pharmacyName: 1 }),
    Pharmacy.countDocuments(filter),
  ]);

  return { pharmacies, total, page, pages: Math.ceil(total / limit) };
};

export const getProfile = async (userId) => {
  const profile = await Pharmacy.findOne({ userId });
  if (!profile) {
    const error = new Error('Pharmacy profile not found');
    error.status = 404;
    throw error;
  }
  return profile;
};

export const updateProfile = async (userId, updates) => {
  delete updates.userId;
  delete updates.licenseNumber;
  delete updates.inventory; // inventory managed via separate endpoints

  const profile = await Pharmacy.findOneAndUpdate({ userId }, updates, {
    new: true,
    runValidators: true,
  });
  if (!profile) {
    const error = new Error('Pharmacy profile not found');
    error.status = 404;
    throw error;
  }
  return profile;
};

// ── Inventory management ───────────────────────────────────────────────────

export const getInventory = async (userId, query = {}) => {
  const pharmacy = await Pharmacy.findOne({ userId });
  if (!pharmacy) {
    const error = new Error('Pharmacy not found');
    error.status = 404;
    throw error;
  }

  let items = pharmacy.inventory;

  // Optional text search
  if (query.search) {
    const re = new RegExp(query.search, 'i');
    items = items.filter((i) => re.test(i.name) || re.test(i.genericName));
  }

  return items;
};

export const addInventoryItem = async (userId, itemData) => {
  const pharmacy = await Pharmacy.findOne({ userId });
  if (!pharmacy) {
    const error = new Error('Pharmacy not found');
    error.status = 404;
    throw error;
  }

  pharmacy.inventory.push(itemData);
  await pharmacy.save();
  return pharmacy.inventory[pharmacy.inventory.length - 1];
};

export const updateInventoryItem = async (userId, itemId, updates) => {
  const pharmacy = await Pharmacy.findOne({ userId });
  if (!pharmacy) {
    const error = new Error('Pharmacy not found');
    error.status = 404;
    throw error;
  }

  const item = pharmacy.inventory.id(itemId);
  if (!item) {
    const error = new Error('Inventory item not found');
    error.status = 404;
    throw error;
  }

  Object.assign(item, updates);
  await pharmacy.save();
  return item;
};

export const removeInventoryItem = async (userId, itemId) => {
  const pharmacy = await Pharmacy.findOne({ userId });
  if (!pharmacy) {
    const error = new Error('Pharmacy not found');
    error.status = 404;
    throw error;
  }

  const item = pharmacy.inventory.id(itemId);
  if (!item) {
    const error = new Error('Inventory item not found');
    error.status = 404;
    throw error;
  }

  item.deleteOne();
  await pharmacy.save();
};
