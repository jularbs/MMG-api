const formidable = require("formidable");
const _ = require("lodash");
const { upload } = require("../controllers/media");

const Option = require("../models/option");
exports.create = async (req, res) => {
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
    let isExisting = await Option.findOne({
      index: fields.index,
    }).exec();

    if (isExisting) {
      isExisting = _.merge(isExisting, fields);

      if (!_.isEmpty(files)) {
        //upload logo
        if (files.media) {
          try {
            const mediaInfo = await upload(files.media, "options");
            isExisting.media = mediaInfo.info._id;
          } catch (e) {
            return res.status(400).json({
              status: "400",
              message: "Unable to create option. Image upload failed",
            });
          }
        }
      }

      isExisting.save(async (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).json({
            status: "400",
            message: "Unable to add/update option.",
          });
        } else {
          await result.populate("media", "_id key bucket").execPopulate();
          res.status(200).json({
            status: "200",
            message: "Option added/updated successfully",
            data: result,
          });
        }
      });
    } else {
      let toInsert = new Option();
      // lodash files-toInsert
      toInsert = _.merge(toInsert, fields);
      if (!_.isEmpty(files)) {
        //upload logo
        if (files.media) {
          try {
            const mediaInfo = await upload(files.media, "options");
            toInsert.media = mediaInfo.info._id;
          } catch (e) {
            return res.status(400).json({
              status: "400",
              message: "Unable to create option. Image upload failed",
            });
          }
        }
      }

      toInsert.save(async (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).json({
            status: "400",
            message: "Unable to add/update option.",
          });
        } else {
          await result.populate("media", "_id key bucket").execPopulate();
          res.status(200).json({
            status: "200",
            message: "Option added/updated successfully",
            data: result,
          });
        }
      });
    }
  });
};

exports.read = async (req, res) => {
  const { index } = req.params;
  const option = await Option.findOne({ index })
    .populate("media", "_id key bucket")
    .exec();

  res.json({
    status: "200",
    message: "Success",
    data: option,
  });
};

exports.remove = async (req, res) => {
  const { index } = req.params;

  const dateNow = Date.now();
  const option = await Option.findOne({ index }).exec();

  if (option) {
    option.deletedAt = dateNow;
    option.save((err, result) => {
      if (err) {
        res.status(400).json({
          status: "400",
          message:
            "There was a problem deleting the chosen option. Please try again later or contact the administrator",
        });
      } else {
        res.json({
          status: "200",
          message: "Option deleted succesfully",
        });
      }
    });
  } else {
    res.status(400).json({
      status: "404",
      message: "Option you are trying to delete doesn't exist",
    });
  }
};
