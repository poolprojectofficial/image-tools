import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { XMLParser, XMLBuilder, XMLValidator } from 'fast-xml-parser'
import jsontoxml from 'jsontoxml'
import { xmlToJson } from '../get-annotations-from-bg-imgs/getAnnotationsFromBlackBg'
import { convertToJsonAnnotation, createNewXmlFile, getDimensions } from '../tools'

const dirPath = 'src/get-annotations-from-bg-imgs/data/small' 
const side = 128
const resultDirName = `${side}x${side}-black`
const imgExtension = '.jpg'
let blackBgImage: Buffer
const gravityElements = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest', 'centre']

export const composite = async () => {
  await updateBlackBgImageVar()
  const images = await getImageNames()
  await createDirIfNotExisted()

  for (const imageNameAndExt of images) {
    const randomIndex = Math.floor(Math.random() * 9)
    const gravityElement = gravityElements[randomIndex]

    await createNewCompositeImage(imageNameAndExt, gravityElement)

    const imageName = imageNameAndExt.replace(imgExtension, '')
    await createNewAnnotation(gravityElement, imageName)
  }
}

const calculateX = (gravityElement: string, width: number) => {
  if (gravityElement == 'northeast' || gravityElement == 'east' || gravityElement == 'southeast') { 
    return side - width
  }
  if (gravityElement == 'north' || gravityElement == 'centre' || gravityElement == 'south') {
    return Math.floor((side - width) / 2) 
  }
  return 0
}

const calculateY = (gravityElement: string, height: number) => {
  if (gravityElement == 'southeast' || gravityElement == 'south' || gravityElement == 'southwest') {
    return side - height
  }
  if (gravityElement == 'east' || gravityElement == 'centre' || gravityElement == 'west') {
    return Math.floor((side - height) / 2)
  }
  return 0 
} 

const createNewAnnotation = async (gravityElement: string, image: string) => {
  const { height, width } = await getDimensions(image, dirPath, imgExtension)
  const x = calculateX(gravityElement, width) 
  const y = calculateY(gravityElement, height)
 
  const jsonAnnotation = convertToJsonAnnotation(dirPath, image, x, y, width, height, side)
  const xmlDirPath = path.join(dirPath, resultDirName)
  await createNewXmlFile(jsonAnnotation, image, xmlDirPath)

}

const createDirIfNotExisted = async () => {
  const dirPathAndName = path.join(dirPath, resultDirName)
  const dirExists = fs.existsSync(dirPathAndName)
  if (!dirExists) fs.mkdirSync(dirPathAndName)
}

const getImageNames = async () => {
  return fs.readdirSync(dirPath, { encoding: 'utf-8' }).filter((a) => a.includes(imgExtension))
}

const updateBlackBgImageVar = async (): Promise<void> => {
  blackBgImage = await sharp({
    create: {
      width: side,
      height: side,
      channels: 3,
      background: { r: 0, g: 0, b: 0 }
    }
  })
    .png({ quality: 100 })
    .toBuffer()
}

const createNewCompositeImage = async (imageName: string, gravityElement: string) => {
  try {
    await sharp(blackBgImage)
      .composite([
        {
          input: path.join(dirPath, imageName),
          gravity: gravityElement
        }
      ])
      // .withMetadata()
      .png({ quality: 100 })
      .toFile(path.join(dirPath, resultDirName, `${imageName}`))
  } catch (err) {
    console.log(imageName, err)
  }
}
