const Hero = require("../models/hero");
const Portrait = require("../models/portrait");
const formidable = require("formidable");
const _ = require("lodash");
const { upload } = require("../controllers/media");

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

    let toInsert = new Portrait();

    // lodash files-toInsert
    toInsert = _.merge(toInsert, fields);

    //slugify `name-location
    toInsert.slug = slugify(`${fields.name}-${fields.location}`).toLowerCase();

    // check files
    if (!_.isEmpty(files)) {
      //upload image
      if (files.image) {
        try {
          const imageInfo = await upload(files.image, "portrait/image");
          toInsert.image = imageInfo.info._id;
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
          const logoInfo = await upload(files.logo, "portrait/logo");
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
          message: "Unable to add portrait card.",
        });
      } else {
        await result
          .populate("logo", "_id key bucket")
          .populate("image", "_id key bucket")
          .execPopulate();
        res.status(200).json({
          status: "200",
          message: "Portrait added successfully",
          data: result,
        });
      }
    });
  });
};

exports.read = async (req, res) => {};

exports.listByLocation = async (req, res) => {
  const { location } = req.params;

  const portraits = await Portrait.find({
    location: location,
    deletedAt: null,
  })
    .populate("image", "key bucket")
    .populate("logo", "key bucket")
    .exec();

  res.json({ status: "200", message: "Success", data: portraits });
};

exports.list = async (req, res) => {};

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
    let toUpdate = await Portrait.findOne({
      slug: fields.slug,
    }).exec();

    if (toUpdate) {
      toUpdate = _.merge(toUpdate, fields);

      if (!_.isEmpty(files)) {
        if (files.image) {
          try {
            const imageInfo = await upload(files.image, "portrait/image");
            toUpdate.image = imageInfo.info._id;
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
            const logoInfo = await upload(files.logo, "portrait/logo");
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
              "Portrait update failed, please try again or contact administrator",
          });
        } else {
          await result
            .populate("image", "_id key bucket")
            .populate("logo", "_id key bucket")
            .execPopulate();

          res.json({
            status: "200",
            message: "Portrait edited Successfully",
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
  const portrait = await Portrait.findOne({ slug }).exec();

  if (portrait) {
    portrait.deletedAt = dateNow;
    portrait.save((err, result) => {
      if (err) {
        res.status(400).json({
          status: "400",
          message:
            "There was a problem deleting the chosen portrait. Please try again later or contact the administrator",
        });
      } else {
        res.json({
          status: "200",
          message: "Portrait deleted succesfully",
        });
      }
    });
  } else {
    res.status(400).json({
      status: "404",
      message: "Portrait you are trying to delete doesn't exist",
    });
  }
};
