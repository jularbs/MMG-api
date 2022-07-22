const _ = require("lodash");
const Metric = require("../models/metric");
const FAQ = require("../models/faq");
const slugify = require("slugify");

exports.create = async (req, res) => {
  let toInsert = new FAQ();
  toInsert = _.merge(toInsert, req.body);
  toInsert.slug = slugify(
    `${req.body.englishQuestion}-${req.body.location}`
  ).toLowerCase();

  const isExisting = await FAQ.findOne({
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
        message: "Unable to add new FAQ.",
      });
    } else {
      res.status(200).json({
        status: "200",
        message: "FAQ added successfully",
        data: result,
      });
    }
  });
};

exports.read = async (req, res) => {};

exports.list = async (req, res) => {
  const faqs = await FAQ.find({
    deletedAt: null,
  })
    .sort({ order: 1 })
    .exec();

  res.json({ status: "200", message: "Success", data: faqs });
};

exports.listByLocation = async (req, res) => {
  const faqs = await FAQ.find({
    location: req.params.location,
    deletedAt: null,
  })
    .sort({ order: 1 })
    .exec();

  res.json({ status: "200", message: "Success", data: faqs });
};

exports.update = async (req, res) => {
  let fields = req.body;

  let toUpdate = await FAQ.findOne({
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
            "FAQ update failed, please try again or contact administrator",
        });
      } else {
        res.json({
          status: "200",
          message: "FAQ edited Successfully",
          data: result,
        });
      }
    });
  } else {
    //Send response that there is nothing to edit
    res.status(400).json({
      status: "404",
      message:
        "FAQ to edit not existing. Please try again or contact administrator",
    });
  }
};

exports.remove = async (req, res) => {
  const { slug } = req.params;

  const dateNow = Date.now();
  const faq = await FAQ.findOne({ slug }).exec();

  if (faq) {
    faq.deletedAt = dateNow;
    faq.save((err, result) => {
      if (err) {
        res.status(400).json({
          status: "400",
          message:
            "There was a problem deleting the chosen faq. Please try again later or contact the administrator",
        });
      } else {
        res.json({
          status: "200",
          message: "FAQ deleted succesfully",
        });
      }
    });
  } else {
    res.status(400).json({
      status: "404",
      message: "FAQ you are trying to delete doesn't exist",
    });
  }
};
