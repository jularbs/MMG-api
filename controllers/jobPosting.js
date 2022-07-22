const _ = require("lodash");

const JobPosting = require("../models/jobPosting");
const slugify = require("slugify");

exports.create = async (req, res) => {
  let toInsert = new JobPosting();
  toInsert = _.merge(toInsert, req.body);
  toInsert.slug = slugify(
    `${req.body.position}-${req.body.company}`
  ).toLowerCase();

  const isExisting = await JobPosting.findOne({
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
        message: "Unable to add new job posting.",
      });
    } else {
      res.status(200).json({
        status: "200",
        message: "Job posting added successfully",
        data: result,
      });
    }
  });
};

exports.read = async (req, res) => {};

exports.list = async (req, res) => {
  const jobPostings = await JobPosting.find({
    deletedAt: null,
  })
    .sort({ order: 1 })
    .exec();

  res.json({ status: "200", message: "Success", data: jobPostings });
};

exports.update = async (req, res) => {
  let fields = req.body;

  let toUpdate = await JobPosting.findOne({
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
            "Job posting update failed, please try again or contact administrator",
        });
      } else {
        res.json({
          status: "200",
          message: "Job posting edited Successfully",
          data: result,
        });
      }
    });
  } else {
    //Send response that there is nothing to edit
    res.status(400).json({
      status: "404",
      message:
        "Job posting to edit not existing. Please try again or contact administrator",
    });
  }
};

exports.remove = async (req, res) => {
  const { slug } = req.params;

  const dateNow = Date.now();
  const category = await JobPosting.findOne({ slug }).exec();

  if (category) {
    category.deletedAt = dateNow;
    category.save((err, result) => {
      if (err) {
        res.status(400).json({
          status: "400",
          message:
            "There was a problem deleting the chosen job posting. Please try again later or contact the administrator",
        });
      } else {
        res.json({
          status: "200",
          message: "Job posting deleted succesfully",
        });
      }
    });
  } else {
    res.status(400).json({
      status: "404",
      message: "Job posting you are trying to delete doesn't exist",
    });
  }
};
