const formidable = require("formidable");
const _ = require("lodash");
const { upload } = require("../controllers/media");

const FileIR = require("../models/fileIR");
const CategoryIR = require("../models/categoryIR");

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

    let toInsert = new FileIR();

    // lodash files-toInsert
    toInsert = _.merge(toInsert, fields);

    // find category
    const category = await CategoryIR.findOne({ _id: fields.category }).exec();

    if (category) {
      // check files
      if (!_.isEmpty(files)) {
        //upload logo
        if (files.file) {
          try {
            const fileInfo = await upload(
              files.file,
              `investor-relation/${category.slug}`
            );
            toInsert.file = fileInfo.info._id;
          } catch (e) {
            return res.status(400).json({
              status: "400",
              message: "Unable to upload file. File upload failed",
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
            message: "Unable to add file.",
          });
        } else {
          await result.populate("file", "_id key bucket").execPopulate();
          res.status(200).json({
            status: "200",
            message: "File added successfully",
            data: result,
          });
        }
      });
    } else {
      res.status(400).json({
        status: "400",
        message: "Unable to add file. Category not found",
      });
    }
  });
};

exports.read = async (req, res) => {};

exports.list = async (req, res) => {
  const logos = await FileIR.find({
    deletedAt: null,
  })
    .populate("file", "key bucket")
    .sort({ order: 1 })
    .exec();

  res.json({ status: "200", message: "Success", data: logos });
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
    let toUpdate = await FileIR.findOne({
      id: fields._id,
    }).exec();

    if (toUpdate) {
      toUpdate = _.merge(toUpdate, fields);

      const category = await CategoryIR.findOne({
        _id: fields.category,
      }).exec();

      if (category) {
      } else {
        if (!_.isEmpty(files)) {
          if (files.file) {
            try {
              const fileInfo = await upload(
                files.file,
                `investor-relations/${category.slug}`
              );
              toUpdate.file = fileInfo.info._id;
            } catch (e) {
              return res.status(400).json({
                status: "400",
                message:
                  "Failed on file upload, please try again or contact administrator",
              });
            }
          }
        }

        toUpdate.save(async (err, result) => {
          if (err) {
            res.status(400).json({
              status: "400",
              message:
                "File update failed, please try again or contact administrator",
            });
          } else {
            await result.populate("file", "_id key bucket").execPopulate();

            res.json({
              status: "200",
              message: "File edited Successfully",
              data: result,
            });
          }
        });
      }
    } else {
      //Send response that there is nothing to edit
      res.status(400).json({
        status: "404",
        message:
          "File to edit not existing. Please try again or contact administrator",
      });
    }
  });
};

exports.remove = async (req, res) => {
  const { id } = req.params;

  const dateNow = Date.now();
  const fileData = await FileIR.findOne({ _id: id }).exec();

  if (fileData) {
    fileData.deletedAt = dateNow;
    fileData.save((err, result) => {
      if (err) {
        res.status(400).json({
          status: "400",
          message:
            "There was a problem deleting the chosen file. Please try again later or contact the administrator",
        });
      } else {
        res.json({
          status: "200",
          message: "File deleted succesfully",
        });
      }
    });
  } else {
    res.status(400).json({
      status: "404",
      message: "File you are trying to delete doesn't exist",
    });
  }
};

exports.listFilesByCategory = async (req, res) => {
  categoryId = req.params.id;
  const logos = await FileIR.find({
    category: categoryId,
    deletedAt: null,
  })
    .populate("file", "key bucket")
    .sort({ createdAt: -1 })
    .exec();

  res.json({ status: "200", message: "Success", data: logos });
};
