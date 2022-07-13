const formidable = require("formidable");
const _ = require("lodash");
const { upload } = require("../controllers/media");

const CompanyShowcase = require("../models/companyShowcase");
const LogoShowcase = require("../models/logoShowcase");
const slugify = require("slugify");

exports.create = async (req, res) => {
  //get incoming form
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.log(err);
      res.status(400).json({
        status: "400",
        message: "Unable to parse data. Please contact web administrator.",
      });
    }

    let toInsert = new CompanyShowcase();

    // lodash files-toInsert
    toInsert = _.merge(toInsert, fields);

    //slugify `name-location-group
    toInsert.slug = slugify(fields.name).toLowerCase();

    //check if slug already exist

    const isExisting = await CompanyShowcase.findOne({
      slug: toInsert.slug,
    }).exec();

    if (isExisting) {
      const rand = Math.floor(Date.now() / 1000);
      toInsert.slug = `${toInsert.slug}-${rand}`;
    }

    // check files
    if (!_.isEmpty(files)) {
      //upload logo
      if (files.logo) {
        try {
          const logoInfo = await upload(files.logo, "company-showcase");
          toInsert.logo = logoInfo.info._id;
        } catch (e) {
          return res.status(400).json({
            status: "400",
            message: "Unable to create company showcase. Image upload failed",
          });
        }
      }
    }

    //save
    toInsert.save(async (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).json({
          status: "400",
          message: "Unable to add company showcase.",
        });
      } else {
        await result.populate("logo", "_id key bucket").execPopulate();
        res.status(200).json({
          status: "200",
          message: "Company showcase added successfully",
          data: result,
        });
      }
    });
  });
};

exports.read = async (req, res) => {};

exports.list = async (req, res) => {
  const logos = await LogoShowcase.find({
    deletedAt: null,
  })
    .populate("logo", "key bucket")
    .sort({ order: 1 })
    .exec();

  res.json({ status: "200", message: "Success", data: logos });
};

exports.listByLocation = async (req, res) => {
  const companies = await CompanyShowcase.find({
    location: req.params.location,
    deletedAt: null,
  })
    .populate("logo", "key bucket")
    .sort({ order: 1 })
    .exec();

  res.json({ status: "200", message: "Success", data: companies });
};

exports.update = async (req, res) => {
  //get incoming form
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(400).json({
        status: "400",
        message: "Unable to parse data. Please contact web administrator.",
      });
    }

    //check if hero is existing by location and type
    let toUpdate = await CompanyShowcase.findOne({
      slug: fields.slug,
    }).exec();

    if (toUpdate) {
      toUpdate = _.merge(toUpdate, fields);

      if (!_.isEmpty(files)) {
        if (files.logo) {
          try {
            const logoInfo = await upload(files.logo, "company-showcase");
            toUpdate.logo = logoInfo.info._id;
          } catch (e) {
            console.log("Error: ", e);
            return res.status(400).json({
              status: "400",
              message:
                "Failed on logo upload, please try again or contact administrator",
            });
          }
        }
      }

      toUpdate.save(async (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).json({
            status: "400",
            message:
              "Company showcase update failed, please try again or contact administrator",
          });
        } else {
          await result.populate("logo", "_id key bucket").execPopulate();

          res.json({
            status: "200",
            message: "Company showcase edited Successfully",
            data: result,
          });
        }
      });
    } else {
      //Send response that there is nothing to edit
      res.status(400).json({
        status: "404",
        message:
          "Company showcase to edit not existing. Please try again or contact administrator",
      });
    }
  });
};

exports.remove = async (req, res) => {
  const { slug } = req.params;

  const dateNow = Date.now();
  const companyShowcase = await CompanyShowcase.findOne({ slug }).exec();

  if (companyShowcase) {
    companyShowcase.deletedAt = dateNow;
    companyShowcase.save((err, result) => {
      if (err) {
        res.status(400).json({
          status: "400",
          message:
            "There was a problem deleting the chosen logo showcase. Please try again later or contact the administrator",
        });
      } else {
        res.json({
          status: "200",
          message: "Company showcase deleted succesfully",
        });
      }
    });
  } else {
    res.status(400).json({
      status: "404",
      message: "Company showcase you are trying to delete doesn't exist",
    });
  }
};
