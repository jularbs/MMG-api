const formidable = require("formidable");
const _ = require("lodash");
const { upload } = require("../controllers/media");

const BasicPost = require("../models/basicPost");
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

    let toInsert = new BasicPost();

    // lodash files-toInsert
    toInsert = _.merge(toInsert, fields);

    //slugify `name-location-group
    toInsert.slug = slugify(fields.title).toLowerCase();

    //check if slug already exist

    const isExisting = await BasicPost.findOne({
      slug: toInsert.slug,
    }).exec();

    if (isExisting) {
      const rand = Math.floor(Date.now() / 1000);
      toInsert.slug = `${toInsert.slug}-${rand}`;
    }

    // check files
    if (!_.isEmpty(files)) {
      //upload logo
      if (files.displayImage) {
        try {
          const displayImageInfo = await upload(
            files.displayImage,
            "basic-post"
          );
          toInsert.displayImage = displayImageInfo.info._id;
        } catch (e) {
          return res.status(400).json({
            status: "400",
            message: "Unable to create basic. Image upload failed",
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
          message: "Unable to add basic post.",
        });
      } else {
        await result.populate("displayImage", "_id key bucket").execPopulate();
        res.status(200).json({
          status: "200",
          message: "Basic post added successfully",
          data: result,
        });
      }
    });
  });
};

exports.read = async (req, res) => {};

exports.list = async (req, res) => {
  const basicPosts = await BasicPost.find({
    deletedAt: null,
  })
    .populate("displayImage", "key bucket")
    .sort({ order: 1 })
    .exec();

  res.json({ status: "200", message: "Success", data: basicPosts });
};

exports.listByLocation = async (req, res) => {
  const basicPosts = await BasicPost.find({
    location: req.params.location,
    deletedAt: null,
  })
    .populate("displayImage", "key bucket")
    .sort({ order: 1 })
    .exec();

  res.json({ status: "200", message: "Success", data: basicPosts });
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
    let toUpdate = await BasicPost.findOne({
      slug: fields.slug,
    }).exec();

    if (toUpdate) {
      toUpdate = _.merge(toUpdate, fields);

      if (!_.isEmpty(files)) {
        if (files.displayImage) {
          try {
            const displayImageInfo = await upload(
              files.displayImage,
              "basic-post"
            );
            toUpdate.displayImage = displayImageInfo.info._id;
          } catch (e) {
            return res.status(400).json({
              status: "400",
              message:
                "Failed on display image upload, please try again or contact administrator",
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
              "Basic post update failed, please try again or contact administrator",
          });
        } else {
          await result
            .populate("displayImage", "_id key bucket")
            .execPopulate();

          res.json({
            status: "200",
            message: "Basic post edited Successfully",
            data: result,
          });
        }
      });
    } else {
      //Send response that there is nothing to edit
      res.status(400).json({
        status: "404",
        message:
          "Basic post to edit not existing. Please try again or contact administrator",
      });
    }
  });
};

exports.remove = async (req, res) => {
  const { slug } = req.params;

  const dateNow = Date.now();
  const basicPost = await BasicPost.findOne({ slug }).exec();

  if (basicPost) {
    basicPost.deletedAt = dateNow;
    basicPost.save((err, result) => {
      if (err) {
        res.status(400).json({
          status: "400",
          message:
            "There was a problem deleting the chosen basic post. Please try again later or contact the administrator",
        });
      } else {
        res.json({
          status: "200",
          message: "Basic post deleted succesfully",
        });
      }
    });
  } else {
    res.status(400).json({
      status: "404",
      message: "Basic post you are trying to delete doesn't exist",
    });
  }
};
