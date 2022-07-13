const Portrait = require("../models/portrait");
const formidable = require("formidable");
const _ = require("lodash");
const { upload } = require("../controllers/media");
const SimpleBusiness = require("../models/simpleBusiness");

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

    let toInsert = new SimpleBusiness();

    // lodash files-toInsert
    toInsert = _.merge(toInsert, fields);

    //slugify `name-location-group
    toInsert.slug = slugify(fields.name).toLowerCase();

    //check if slug already exist

    const isExisting = await SimpleBusiness.findOne({
      slug: toInsert.slug,
    }).exec();

    if (isExisting) {
      const rand = Math.floor(Date.now() / 1000);
      toInsert.slug = `${toInsert.slug}-${rand}`;
    }

    // check files
    if (!_.isEmpty(files)) {
      //upload image
      if (files.background) {
        try {
          const imageInfo = await upload(
            files.background,
            "simple-business/background"
          );
          toInsert.background = imageInfo.info._id;
        } catch (e) {
          return res.status(400).json({
            status: "400",
            message: "Unable to create Portrait. Image upload failed",
          });
        }
      }

      //upload logo
      if (files.logo) {
        try {
          const logoInfo = await upload(files.logo, "simple-business/logo");
          toInsert.logo = logoInfo.info._id;
        } catch (e) {
          return res.status(400).json({
            status: "400",
            message: "Unable to create Portrait. Image upload failed",
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
          message: "Unable to add simple business card.",
        });
      } else {
        await result
          .populate("logo", "_id key bucket")
          .populate("background", "_id key bucket")
          .execPopulate();
        res.status(200).json({
          status: "200",
          message: "Business added successfully",
          data: result,
        });
      }
    });
  });
};

exports.read = async (req, res) => {};

exports.list = async (req, res) => {
  const businesses = await SimpleBusiness.find({
    deletedAt: null,
  })
    .populate("background", "key bucket")
    .populate("logo", "key bucket")
    .sort({ order: 1})
    .exec();

  res.json({ status: "200", message: "Success", data: businesses });
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
    let toUpdate = await SimpleBusiness.findOne({
      slug: fields.slug,
    }).exec();

    if (toUpdate) {
      toUpdate = _.merge(toUpdate, fields);

      if (!_.isEmpty(files)) {
        if (files.background) {
          try {
            const imageInfo = await upload(
              files.image,
              "simple-business/background"
            );
            toUpdate.background = imageInfo.info._id;
          } catch (e) {
            return res.status(400).json({
              status: "400",
              message:
                "Failed on image upload, please try again or contact administrator",
            });
          }
        }

        if (files.logo) {
          try {
            const logoInfo = await upload(files.logo, "simple-business/logo");
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
          res.status(400).json({
            status: "400",
            message:
              "Business update failed, please try again or contact administrator",
          });
        } else {
          await result
            .populate("background", "_id key bucket")
            .populate("logo", "_id key bucket")
            .execPopulate();

          res.json({
            status: "200",
            message: "Business edited Successfully",
            data: result,
          });
        }
      });
    } else {
      //Send response that there is nothing to edit
      res.status(400).json({
        status: "404",
        message:
          "Portrait to edit not existing. Please try again or contact administrator",
      });
    }
  });
};

exports.remove = async (req, res) => {
  const { slug } = req.params;

  const dateNow = Date.now();
  const business = await SimpleBusiness.findOne({ slug }).exec();

  if (business) {
    business.deletedAt = dateNow;
    business.save((err, result) => {
      if (err) {
        res.status(400).json({
          status: "400",
          message:
            "There was a problem deleting the chosen business. Please try again later or contact the administrator",
        });
      } else {
        res.json({
          status: "200",
          message: "Business deleted succesfully",
        });
      }
    });
  } else {
    res.status(400).json({
      status: "404",
      message: "Business you are trying to delete doesn't exist",
    });
  }
};
