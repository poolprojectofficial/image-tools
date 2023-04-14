import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { convertToJsonAnnotation, createDirIfNotExisted, createNewXmlFile, getDimensions } from '../tools'

const dirPath = '/home/muniz/projects/six&bus/downloads/babies-standard-less-than-64'
const side = 64
const resultDirName = `${side}x${side}-black`
const imgExtension = '.jpg'
let bgImage: Buffer
const gravityElements = ['centre']
// const gravityElements = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest', 'centre']
let log: string

export const composite = async () => {
  await setBlackBgImageVar()
  const images = await getImageNames()
  await createDirIfNotExisted(dirPath, resultDirName)

  for (const imageNameAndExt of images) {
    const randomIndex = Math.floor(Math.random() * gravityElements.length)
    const gravityElement = gravityElements[randomIndex]

    try {
      const imageName = imageNameAndExt.replace(imgExtension, '')
      log = `=========== ${imageName} =========== ${gravityElement}`

      await createNewCompositeImage(imageNameAndExt, gravityElement)
      try {
        await createNewAnnotation(gravityElement, imageName)
      } catch (err: any) {
        fs.rmSync(path.join(dirPath, resultDirName, `${imageName}`) + imgExtension)
        console.log(log)
        console.log(err.message)
      }
    } catch (err: any) {
      console.log(log)
      console.log(err.message)
    }
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

const createNewAnnotation = async (gravityElement: string, imgName: string) => {
  const { height, width } = await getDimensions(imgName, dirPath, imgExtension)
  const x = calculateX(gravityElement, width)
  const y = calculateY(gravityElement, height)

  const jsonAnnotation = convertToJsonAnnotation({ dirPath, imgName, x, y, side })
  const xmlDirPath = path.join(dirPath, resultDirName)
  await createNewXmlFile(jsonAnnotation, imgName, xmlDirPath)
}


// const createDirIfNotExisted = async () => {
//   const dirPathAndName = path.join(dirPath, resultDirName)
//   const dirExists = fs.existsSync(dirPathAndName)
//   if (!dirExists) fs.mkdirSync(dirPathAndName)
// }

const getImageNames = async () => {
  return fs.readdirSync(dirPath, { encoding: 'utf-8' }).filter((a) => a.includes(imgExtension))
}

const setBlackBgImageVar = async (): Promise<void> => {
  bgImage = await sharp({
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


const setBlurBgImageVar = async (): Promise<void> => {
  bgImage = await sharp()
    .png({ quality: 100 })
    .toBuffer()
}

const createNewCompositeImage = async (imageName: string, gravityElement: string) => {
  await sharp(bgImage)
    .composite([
      {
        input: path.join(dirPath, imageName),
        gravity: gravityElement
      }
    ])
    // .withMetadata()
    .png({ quality: 100 })
    .toFile(path.join(dirPath, resultDirName, `${imageName}`))
}
