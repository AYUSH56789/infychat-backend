// Require the cloudinary library
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require("fs");


 cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret:  process.env.CLOUDINARY_API_SECRET,
 }); 


// upload method ->> uplaod files on the clodinary
 const uploadOnCloudinary = async (localFilePath, cloudinaryFolder, email) => {
  try {
    if (!localFilePath) {
      return "Please provide a valid file path";
    }

    // Extract username from email address (excluding '@gmail.com')
    const username = email.replace(/@gmail\.com$/, '');

    // Upload file to Cloudinary with the username as the public_id
    const resp = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: cloudinaryFolder,
      public_id: username,
    });

    // Delete local file after successful upload
    fs.unlinkSync(localFilePath);

    // Check the response from Cloudinary
    if (resp.secure_url  && resp.public_id) {
      console.log(`Successfully uploaded ${resp.public_id} to Cloudinary`);
      const photoData={publicId:resp.public_id, url:resp.secure_url};
      return photoData; // Return the secure URL
    } else {
      return "Cloudinary response is missing secure_url";
    }
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return `Failed to upload your file on Cloudinary: ${error.message}`;
  }
 }

// Function to delete a resource by its public ID
const deleteFromCloudinary = async (publicId) => {
  try {
      const result = await cloudinary.uploader.destroy(publicId);
      console.log(result);
      return result;
  } catch (error) {
      console.error("Error deleting resource:", error);
      throw error;
  }
};

module.exports = {
  uploadOnCloudinary,
  deleteFromCloudinary,
}
