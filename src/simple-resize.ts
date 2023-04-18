import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { createDirIfNotExisted } from './tools'

const imageDir = '/home/muniz/projects/six-n-bus/downloads/yolov8/obj'
const outDir = path.join(imageDir, 'resized')
const outSize = 480

const simpleResize = async () => {
  await createDirIfNotExisted(outDir, '')
  const imagesNames = fs.readdirSync(imageDir).filter((a) => a.endsWith('.jpg'))
  for (let name of imagesNames) {
    await toFileResizeImage(name)
  }
}

const toFileResizeImage = async (imageName: string) => {
  const imagePath = path.join(imageDir, imageName)
  try {
    await sharp(imagePath)
      // .toFormat('jpeg', { mozjpeg: true, quality: 100 })
      .resize({ height: outSize, width: outSize })
      .toFile(path.join(outDir, imageName))
  }catch (err) {
    console.log(err)
  }
}

try {
  simpleResize()
} catch (err) {
  console.log(err)
}
