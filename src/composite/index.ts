import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const dirPath = '/home/muniz/Downloads/image-small'
const dirImagesExtension = '.jpg'
const blackImageFileName = '128x128-black.jpg'
const blackImageFileNameWithoutExtension = blackImageFileName.split('.')[0]

export const composite = async () => {
  const images = fs.readdirSync(dirPath, { encoding: 'utf-8' }).filter((a) => a.includes(dirImagesExtension))
  const resultDirExists = fs.existsSync(path.join(dirPath, blackImageFileName.split('.')[0]))

  if (!resultDirExists) fs.mkdirSync(path.join(dirPath, blackImageFileNameWithoutExtension))

  for (const image of images) {
    await createNewCompositeImage(image)
  }
}

const createNewCompositeImage = async (imageName: string) => {
  try {
    await sharp(path.join('src/composite', blackImageFileName))
      .composite([{ input: path.join(dirPath, imageName), blend: 'over' }])
      .toFile(path.join(dirPath, blackImageFileNameWithoutExtension, `${imageName}`))
  } catch (err) {
    console.log(imageName, err)
  }
}
