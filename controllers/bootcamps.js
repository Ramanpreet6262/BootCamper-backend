const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

// @desc      Get all Bootcamps
// @route     GET /api/v1/bootcamps
// @access    Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  // try {

  let query;

  let queryStr = JSON.stringify(req.query);

  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  // It is done to add a dollar sign infront of them...

  query = Bootcamp.find(JSON.parse(queryStr));

  // const bootcamps = await Bootcamp.find();
  const bootcamps = await query;

  res
    .status(200)
    .json({ success: true, count: bootcamps.length, data: bootcamps });
  // } catch (err) {
  //   // res.status(400).json({ success: false });
  //   next(err);
  // }

  // We are not using this try catch anymore as this is now done in async middleware
  // to avoid repeating same things again and again....
});

// @desc      Get single Bootcamp
// @route     GET /api/v1/bootcamps/:id
// @access    Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  // try {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    // return res.status(400).json({ success: false });
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
  // } catch (err) {
  //   // res.status(400).json({ success: false });
  //   // next(
  //   //   new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
  //   // );
  //   next(err);
  // }
});

// @desc      Create new Bootcamp
// @route     POST /api/v1/bootcamps
// @access    Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp
  });
});

// @desc      Update Bootcamp
// @route     PUT /api/v1/bootcamps/:id
// @access    Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!bootcamp) {
    // return res.status(400).json({ success: false });
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
});

// @desc      Delete Bootcamp
// @route     DELETE /api/v1/bootcamps/:id
// @access    Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  if (!bootcamp) {
    // return res.status(400).json({ success: false });
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: {} });
});

// @desc      Get bootcamps within a radius
// @route     GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access    Public
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divide dist by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });
});
