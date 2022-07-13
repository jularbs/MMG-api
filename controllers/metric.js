const formidable = require("formidable");
const _ = require("lodash");
const { upload } = require("../controllers/media");
const SimpleBusiness = require("../models/simpleBusiness");

const Metric = require("../models/metric");

const slugify = require("slugify");

exports.create = async (req, res) => {
  let toInsert = new Metric();
  toInsert = _.merge(toInsert, req.body);
  toInsert.slug = slugify(req.body.label).toLowerCase();

  const isExisting = await Metric.findOne({
    slug: toInsert.slug,
  }).exec();

  if (isExisting) {
    const rand = Math.floor(Date.now() / 1000);
    toInsert.slug = `${toInsert.slug}-${rand}`;
  }

  toInsert.save(async (err, result) => {
    if (err) {
      console.log(err);
      res.status(400).json({
        status: "400",
        message: "Unable to add new metric.",
      });
    } else {
      res.status(200).json({
        status: "200",
        message: "Metric added successfully",
        data: result,
      });
    }
  });
};

exports.read = async (req, res) => {};

exports.list = async (req, res) => {
  const metrics = await Metric.find({
    deletedAt: null,
  })
    .sort({ order: 1 })
    .exec();

  res.json({ status: "200", message: "Success", data: metrics });
};

exports.update = async (req, res) => {
  let fields = req.body;

  let toUpdate = await Metric.findOne({
    slug: fields.slug,
    deletedAt: null,
  }).exec();

  if (toUpdate) {
    toUpdate = _.merge(toUpdate, fields);

    toUpdate.save(async (err, result) => {
      if (err) {
        res.status(400).json({
          status: "400",
          message:
            "Metric update failed, please try again or contact administrator",
        });
      } else {
        res.json({
          status: "200",
          message: "Metric edited Successfully",
          data: result,
        });
      }
    });
  } else {
    //Send response that there is nothing to edit
    res.status(400).json({
      status: "404",
      message:
        "Metric to edit not existing. Please try again or contact administrator",
    });
  }
};

exports.remove = async (req, res) => {
  const { slug } = req.params;

  const dateNow = Date.now();
  const metric = await Metric.findOne({ slug }).exec();

  if (metric) {
    metric.deletedAt = dateNow;
    metric.save((err, result) => {
      if (err) {
        res.status(400).json({
          status: "400",
          message:
            "There was a problem deleting the chosen metric. Please try again later or contact the administrator",
        });
      } else {
        res.json({
          status: "200",
          message: "Metric deleted succesfully",
        });
      }
    });
  } else {
    res.status(400).json({
      status: "404",
      message: "Metric you are trying to delete doesn't exist",
    });
  }
};
