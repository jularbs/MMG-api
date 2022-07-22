const formidable = require("formidable");
const _ = require("lodash");
const { upload } = require("../controllers/media");

const slugify = require("slugify");

const Collaboration = require("../models/collaboration");

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

    let toInsert = new Collaboration();

    // lodash files-toInsert
    toInsert = _.merge(toInsert, fields);

    //slugify `name-location-group
    toInsert.slug = slugify(
      `${fields.company}-${fields.campaign}`
    ).toLowerCase();

    //check if slug already exist

    const isExisting = await Collaboration.findOne({
      slug: toInsert.slug,
    }).exec();

    if (isExisting) {
      const rand = Math.floor(Date.now() / 1000);
      toInsert.slug = `${toInsert.slug}-${rand}`;
    }

    // check files
    if (!_.isEmpty(files)) {
      //upload logo
      if (files.cover) {
        try {
          const coverInfo = await upload(files.cover, "collaboration");
          toInsert.logo = coverInfo.info._id;
        } catch (e) {
          return res.status(400).json({
            status: "400",
            message: "Unable to create collaboration. Image upload failed",
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
          message: "Unable to add collaboration.",
        });
      } else {
        await result.populate("cover", "_id key bucket").execPopulate();
        res.status(200).json({
          status: "200",
          message: "Collaboration added successfully",
          data: result,
        });
      }
    });
  });
};

exports.read = async (req, res) => {};

exports.list = async (req, res) => {
  const logos = await Collaboration.find({
    deletedAt: null,
  })
    .populate("cover", "key bucket")
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
    let toUpdate = await Collaboration.findOne({
      slug: fields.slug,
    }).exec();

    if (toUpdate) {
      toUpdate = _.merge(toUpdate, fields);

      if (!_.isEmpty(files)) {
        if (files.cover) {
          try {
            const coverInfo = await upload(files.cover, "collaboration");
            toUpdate.cover = coverInfo.info._id;
          } catch (e) {
            return res.status(400).json({
              status: "400",
              message:
                "Failed on cover upload, please try again or contact administrator",
            });
          }
        }
      }

      toUpdate.save(async (err, result) => {
        if (err) {
          res.status(400).json({
            status: "400",
            message:
              "Collaboration update failed, please try again or contact administrator",
          });
        } else {
          await result.populate("cover", "_id key bucket").execPopulate();

          res.json({
            status: "200",
            message: "Collaboration edited Successfully",
            data: result,
          });
        }
      });
    } else {
      //Send response that there is nothing to edit
      res.status(400).json({
        status: "404",
        message:
          "Logo showcase to edit not existing. Please try again or contact administrator",
      });
    }
  });
};

exports.remove = async (req, res) => {
  const { slug } = req.params;

  const dateNow = Date.now();
  const collaboration = await Collaboration.findOne({ slug }).exec();

  if (collaboration) {
    collaboration.deletedAt = dateNow;
    collaboration.save((err, result) => {
      if (err) {
        res.status(400).json({
          status: "400",
          message:
            "There was a problem deleting the chosen collaboration. Please try again later or contact the administrator",
        });
      } else {
        res.json({
          status: "200",
          message: "Collaboration deleted succesfully",
        });
      }
    });
  } else {
    res.status(400).json({
      status: "404",
      message: "Collaboration you are trying to delete doesn't exist",
    });
  }
};
