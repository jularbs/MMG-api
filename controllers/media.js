//TODOS: Check overwite with key in media db before uploading then send warning

const Media = require("../models/media");
const formidable = require("formidable");
const _ = require("lodash");

const { uploadTos3withKey, getObjectFromS3 } = require("../helpers/s3uploader");

exports.create = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(400).json({
        status: "400",
        message: "Error in form",
      });
    }

    if (!_.isEmpty(files)) {
      const { file } = files;

      var date = new Date();
      var month = date.getUTCMonth() + 1; //months from 1-12
      var year = date.getUTCFullYear();

      try {
        const info = await uploadTos3withKey(file, `media/${year}/${month}`);
        let media = new Media();
        media.bucket = info.bucket;
        media.key = info.key;

        media.save((err, result) => {
          if (err) {
            console.log("Error: ", err);
            res.status(400).json({
              status: "400",
              message:
                "Error saving image info to database. Please contact administrator.",
            });
          }
          res.json({
            status: "200",
            message: "Files uploaded successfully",
            data: result,
          });
        });
      } catch (e) {
        console.log("Error: ", e);
        res.status(400).json({
          status: "400",
          message: "Error uploading on S3. Please contact administrator.",
        });
      }
    } else {
      res
        .status(400)
        .json({ status: "400", message: "No files found in request." });
    }
  });
};

exports.upload = async (file, path) => {
  return new Promise(async (resolve, reject) => {
    try {
      var date = new Date();
      var month = date.getUTCMonth() + 1; //months from 1-12
      var year = date.getUTCFullYear();

      const info = await uploadTos3withKey(file, `${path}/${year}/${month}`);
      let media = new Media();
      media.bucket = info.bucket;
      media.key = info.key;

      media.save((err, result) => {
        if (err) {
          console.log("Error: ", err);
          reject({
            status: "400",
            message:
              "Error saving image info to database. Please contact administrator.",
          });
        } else {
          resolve({
            status: "200",
            message: "Files uploaded successfully",
            info: result,
          });
        }
      });
    } catch (e) {
      console.log("Error: ", e);
      reject({
        status: "400",
        message: "Error uploading on S3. Please contact administrator.",
      });
    }
  });
};

exports.list = (req, res) => {};

exports.read = (req, res) => {};

exports.display = async (req, res) => {
  const { key, bucket } = req.query;

  try {
    const data = await getObjectFromS3(key, bucket);
    if (data) {
      res.setHeader("Content-Type", data.ContentType);
      res.send(data.Body);
    }
  } catch (e) {
    res.status(400).json({ e });
  }
};
