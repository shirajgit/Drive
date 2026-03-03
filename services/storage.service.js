 const ImageKit = require('@imagekit/nodejs');

const ImageKitClient = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY, 
});

async function uploadFile(file) {
  const result = ImageKitClient.files.upload({
    file,
    fileName : "Shiraj_Drive" + Date.now(),
    folder :"Drive"
  })

  return result
}


module.exports = {uploadFile}