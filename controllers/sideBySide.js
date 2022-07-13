const SideBySide = require("../models/sideBySide");
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

    let toInsert = new SideBySide();

    // lodash files-toInsert
    toInsert = _.merge(toInsert, fields);

    //slugify `name-location-group
    toInsert.slug = slugify(`${fields.title}_${fields.location}`).toLowerCase();

    const isExisting = await SideBySide.findOne({
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
            "side-by-side/background"
          );
          toInsert.background = imageInfo.info._id;
        } catch (e) {
          return res.status(400).json({
            status: "400",
            message:
              "Unable to create Side by Side component. Image upload failed",
          });
        }
      }

      //upload logo
      if (files.logo) {
        try {
          const logoInfo = await upload(files.logo, "side-by-side/logo");
          toInsert.logo = logoInfo.info._id;
        } catch (e) {
          return res.status(400).json({
            status: "400",
            message:
              "Unable to create Side by Side component. Image upload failed",
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
          .populate("background", "_id key bucket")
          .execPopulate();
        res.status(200).json({
          status: "200",
          message: "Side by side added successfully",
          data: result,
        });
      }
    });
  });
};

exports.read = async (req, res) => {};

exports.listByLocation = async (req, res) => {
  const { location } = req.params;

  const sideBySides = await SideBySide.find({
    location: location,
    deletedAt: null,
  })
    .populate("background", "key bucket")
    .populate("logo", "key bucket")
    .exec();

  res.json({ status: "200", message: "Success", data: sideBySides });
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
    let toUpdate = await SideBySide.findOne({
      slug: fields.slug,
    }).exec();

    if (toUpdate) {
      toUpdate = _.merge(toUpdate, fields);

      if (!_.isEmpty(files)) {
        if (files.background) {
          try {
            const imageInfo = await upload(files.background, "side-by-side/background");
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
            const logoInfo = await upload(files.logo, "side-by-side/logo");
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
          console.log(err)
          res.status(400).json({
            status: "400",
            message:
              "Side by side update failed, please try again or contact administrator",
          });
        } else {
          await result
            .populate("background", "_id key bucket")
            .populate("logo", "_id key bucket")
            .execPopulate();

          res.json({
            status: "200",
            message: "Side by side edited Successfully",
            data: result,
          });
        }
      });
    } else {
      //Send response that there is nothing to edit
      res.status(400).json({
        status: "404",
        message:
          "Side by side to edit not existing. Please try again or contact administrator",
      });
    }
  });
};

exports.remove = async (req, res) => {
  const { slug } = req.params;

  const dateNow = Date.now();
  const sideBySide = await SideBySide.findOne({ slug }).exec();

  if (sideBySide) {
    sideBySide.deletedAt = dateNow;
    sideBySide.save((err, result) => {
      if (err) {
        res.status(400).json({
          status: "400",
          message:
            "There was a problem deleting the chosen data. Please try again later or contact the administrator",
        });
      } else {
        res.json({
          status: "200",
          message: "Side by side deleted succesfully",
        });
      }
    });
  } else {
    res.status(400).json({
      status: "404",
      message: "Side by side you are trying to delete doesn't exist",
    });
  }
};
