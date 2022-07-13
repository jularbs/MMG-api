const formidable = require("formidable");
const _ = require("lodash");

const Metric = require("../models/metric");
const CategoryIR = require("../models/categoryIR");

const slugify = require("slugify");

exports.create = async (req, res) => {
  let toInsert = new CategoryIR();
  console.log("REQ: ", req.body);
  toInsert = _.merge(toInsert, req.body);
  toInsert.slug = slugify(req.body.label).toLowerCase();

  // if (toInsert.parent == null) {
  //   toInsert.parent = null;
  // }

  const isExisting = await CategoryIR.findOne({
    slug: toInsert.slug,
  }).exec();

  if (isExisting) {
    const rand = Math.floor(Date.now() / 1000);
    toInsert.slug = `${toInsert.slug}-${rand}`;
  }

  toInsert.save(async (err, result) => {
    if (err) {
      // console.log(err);
      res.status(400).json({
        status: "400",
        message: "Unable to add new category.",
      });
    } else {
      res.status(200).json({
        status: "200",
        message: "Category added successfully",
        data: result,
      });
    }
  });
};

exports.read = async (req, res) => {};

exports.list = async (req, res) => {
  const categories = await CategoryIR.find({
    deletedAt: null,
  })
    .sort({ order: 1 })
    .exec();

  res.json({ status: "200", message: "Success", data: categories });
};

exports.update = async (req, res) => {
  let fields = req.body;

  console.log("REQUEST: ", req.body);
  let toUpdate = await CategoryIR.findOne({
    slug: fields.slug,
    deletedAt: null,
  }).exec();

  if (toUpdate) {
    toUpdate = _.merge(toUpdate, fields);

    console.log("UPDATE: ", toUpdate);
    if (fields.parent == "") {
      toUpdate.parent = null;
    }

    toUpdate.save(async (err, result) => {
      if (err) {
        res.status(400).json({
          status: "400",
          message:
            "Category update failed, please try again or contact administrator",
        });
      } else {
        res.json({
          status: "200",
          message: "Category edited Successfully",
          data: result,
        });
      }
    });
  } else {
    //Send response that there is nothing to edit
    res.status(400).json({
      status: "404",
      message:
        "Category to edit not existing. Please try again or contact administrator",
    });
  }
};

exports.remove = async (req, res) => {
  const { slug } = req.params;

  const dateNow = Date.now();
  const category = await CategoryIR.findOne({ slug }).exec();

  if (category) {
    category.deletedAt = dateNow;
    category.save((err, result) => {
      if (err) {
        res.status(400).json({
          status: "400",
          message:
            "There was a problem deleting the chosen category. Please try again later or contact the administrator",
        });
      } else {
        res.json({
          status: "200",
          message: "Category deleted succesfully",
        });
      }
    });
  } else {
    res.status(400).json({
      status: "404",
      message: "Category you are trying to delete doesn't exist",
    });
  }
};
