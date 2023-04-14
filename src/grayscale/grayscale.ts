import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { createDirIfNotExisted } from '../tools'

const dirPath = '/home/muniz/projects/six&bus/downloads/babies-standard-less-than-64'
const side = 64
const resultDirName = `${side}x${side}-grayscale`
const imgExtension = '.jpg'
let bgImage: Buffer

export const grayscale = async () => {
  const images = fs.readdirSync(dirPath, { encoding: 'utf-8' }).filter((a) => a.includes(imgExtension))
  await createDirIfNotExisted(dirPath, resultDirName)

  for (let image of images) {
    const imagePath = path.join(dirPath, image)
    const outputImg = await sharp(imagePath)
      .png({ quality: 100 })
      .greyscale()
      .toFile(path.join(dirPath, resultDirName, `${image}`))
  }
}


