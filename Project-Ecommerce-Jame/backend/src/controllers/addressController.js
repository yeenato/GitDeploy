const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const asyncHandler = require('express-async-handler');

// @desc    Get all addresses for logged-in user
// @route   GET /api/addresses
// @access  Private
const getAddresses = asyncHandler(async (req, res) => {
    const addresses = await prisma.address.findMany({
        where: { userId: req.user.id },
        orderBy: { isDefault: 'desc' }, // Default address first
    });
    res.json(addresses);
});

// @desc    Get single address
// @route   GET /api/addresses/:id
// @access  Private
const getAddressById = asyncHandler(async (req, res) => {
    const address = await prisma.address.findFirst({
        where: {
            id: parseInt(req.params.id),
            userId: req.user.id,
        },
    });

    if (address) {
        res.json(address);
    } else {
        res.status(404);
        throw new Error('Address not found');
    }
});

// @desc    Create new address
// @route   POST /api/addresses
// @access  Private
const createAddress = asyncHandler(async (req, res) => {
    const {
        fullName,
        phoneNumber,
        addressLine1,
        addressLine2,
        subdistrict,
        district,
        province,
        zipCode,
        isDefault,
    } = req.body;

    // If isDefault is true, unset other default addresses
    if (isDefault) {
        await prisma.address.updateMany({
            where: { userId: req.user.id, isDefault: true },
            data: { isDefault: false },
        });
    }

    // Check if this is the first address, if so make it default
    const addressCount = await prisma.address.count({
        where: { userId: req.user.id }
    });
    
    const shouldBeDefault = isDefault || addressCount === 0;

    const address = await prisma.address.create({
        data: {
            userId: req.user.id,
            fullName,
            phoneNumber,
            addressLine1,
            addressLine2,
            subdistrict,
            district,
            province,
            zipCode,
            isDefault: shouldBeDefault,
        },
    });

    res.status(201).json(address);
});

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
    const {
        fullName,
        phoneNumber,
        addressLine1,
        addressLine2,
        subdistrict,
        district,
        province,
        zipCode,
        isDefault,
    } = req.body;

    const address = await prisma.address.findUnique({
        where: { id: parseInt(req.params.id) },
    });

    if (!address) {
        res.status(404);
        throw new Error('Address not found');
    }

    if (address.userId !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    // If setting as default, unset others
    if (isDefault) {
        await prisma.address.updateMany({
            where: {
                userId: req.user.id,
                id: { not: parseInt(req.params.id) },
            },
            data: { isDefault: false },
        });
    }

    const updatedAddress = await prisma.address.update({
        where: { id: parseInt(req.params.id) },
        data: {
            fullName,
            phoneNumber,
            addressLine1,
            addressLine2,
            subdistrict,
            district,
            province,
            zipCode,
            isDefault,
        },
    });

    res.json(updatedAddress);
});

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
    const address = await prisma.address.findUnique({
        where: { id: parseInt(req.params.id) },
    });

    if (!address) {
        res.status(404);
        throw new Error('Address not found');
    }

    if (address.userId !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await prisma.address.delete({
        where: { id: parseInt(req.params.id) },
    });

    res.json({ message: 'Address removed' });
});

module.exports = {
    getAddresses,
    getAddressById,
    createAddress,
    updateAddress,
    deleteAddress,
};
