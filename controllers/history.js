const SideBySide = require("../models/sideBySide");
const formidable = require("formidable");
const _ = require("lodash");
const { upload } = require("../controllers/media");

const History = require("../models/history");
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

    let toInsert = new History();

    // lodash files-toInsert
    toInsert = _.merge(toInsert, fields);

    //slugify `name-location-group
    toInsert.slug = slugify(`${fields.label}-${fields.title}`).toLowerCase();

    const isExisting = await History.findOne({
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
            "history/background"
          );
          toInsert.background = imageInfo.info._id;
        } catch (e) {
          return res.status(400).json({
            status: "400",
            message: "Unable to create history component. Image upload failed",
          });
        }
      }

      //upload logo
      if (files.image) {
        try {
          const imageInfo = await upload(files.image, "history/image");
          toInsert.image = imageInfo.info._id;
        } catch (e) {
          return res.status(400).json({
            status: "400",
            message: "Unable to create history component. Image upload failed",
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
          message: "Unable to history data.",
        });
      } else {
        await result
          .populate("image", "_id key bucket")
          .populate("background", "_id key bucket")
          .execPopulate();
        res.status(200).json({
          status: "200",
          message: "History data added successfully",
          data: result,
        });
      }
    });
  });
};

exports.read = async (req, res) => {};

exports.listByLocation = async (req, res) => {};

exports.list = async (req, res) => {
  const histories = await History.find({
    deletedAt: null,
  })
    .populate("background", "key bucket")
    .populate("image", "key bucket")
    .exec();

  res.json({ status: "200", message: "Success", data: histories });
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
    let toUpdate = await History.findOne({
      slug: fields.slug,
    }).exec();

    if (toUpdate) {
      toUpdate = _.merge(toUpdate, fields);

      if (!_.isEmpty(files)) {
        if (files.background) {
          try {
            const imageInfo = await upload(
              files.background,
              "history/background"
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

        if (files.image) {
          try {
            const imageInfo = await upload(files.image, "history/image");
            toUpdate.image = imageInfo.info._id;
          } catch (e) {
            console.log("Error: ", e);
            return res.status(400).json({
              status: "400",
              message:
                "Failed on image upload, please try again or contact administrator",
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
              "History data update failed, please try again or contact administrator",
          });
        } else {
          await result
            .populate("background", "_id key bucket")
            .populate("image", "_id key bucket")
            .execPopulate();

          res.json({
            status: "200",
            message: "History data edited Successfully",
            data: result,
          });
        }
      });
    } else {
      //Send response that there is nothing to edit
      res.status(400).json({
        status: "404",
        message:
          "History data to edit not existing. Please try again or contact administrator",
      });
    }
  });
};

exports.remove = async (req, res) => {
  const { slug } = req.params;

  const dateNow = Date.now();
  const history = await History.findOne({ slug }).exec();

  if (history) {
    history.deletedAt = dateNow;
    history.save((err, result) => {
      if (err) {
        res.status(400).json({
          status: "400",
          message:
            "There was a problem deleting the chosen data. Please try again later or contact the administrator",
        });
      } else {
        res.json({
          status: "200",
          message: "History data deleted succesfully",
        });
      }
    });
  } else {
    res.status(400).json({
      status: "404",
      message: "History data you are trying to delete doesn't exist",
    });
  }
};
