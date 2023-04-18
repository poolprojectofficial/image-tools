import fs from 'fs'
import jsontoxml from 'jsontoxml'
import path from 'path'
import sharp from 'sharp'
import { Color } from 'sharp'
import { xmlToJson } from './get-annotations-from-bg-imgs/getAnnotationsFromBlackBg'

interface ICreateBGImage {
  width?: number
  height?: number
  channels?: sharp.Channels
  background?: sharp.Color
}
interface IconvertToJsonAnnotation {
  dirPath: string
  imgName: string
  x: number
  y: number
  width?: number
  height?: number
  side?: number
}

export const getDimensions = async (imageName: string, dirPath: string, imgExtension: string) => {
  const imagePath = path.join(dirPath, imageName) + imgExtension
  const { height, width } = await sharp(imagePath).metadata()
  if (!height || !width) throw new Error('bla')
  return { height, width }
}

export const createDirIfNotExisted = async (dirPath: string, resultDirName: string) => {
  const dirPathAndName = path.join(dirPath, resultDirName)
  const dirExists = fs.existsSync(dirPathAndName)
  if (!dirExists) fs.mkdirSync(dirPathAndName)
}

export const convertToJsonAnnotation = ({ dirPath, imgName, x, y, width, height, side }: IconvertToJsonAnnotation) => {
  const xmlPath = path.join(dirPath, imgName) + '.xml'
  const jsonAnnotation = xmlToJson(xmlPath)

  jsonAnnotation.annotation.size.width = width ?? side
  jsonAnnotation.annotation.size.height = height ?? side

  const { object } = jsonAnnotation.annotation
  if (object.length) {
    for (let e of object) {
      convertBndBox(e.bndbox, x, y)
    }
  } else {
    convertBndBox(object.bndbox, x, y)
  }
  return jsonAnnotation
}

export const createNewXmlFile = async (jsonAnnotation: any, imgName: string, dirPath: string) => {
  const xmlAnnotation = jsontoxml(jsonAnnotation)
  const smallXmlPath = path.join(dirPath, imgName) + '.xml'
  fs.writeFileSync(smallXmlPath, xmlAnnotation)
}

const convertBndBox = (bndbox: any, x: number, y: number) => {
  bndbox.xmin += x
  bndbox.xmax += x
  bndbox.ymin += y
  bndbox.ymax += y
}

export const createBgImg = async ({
  width = 480,
  height = 480,
  channels = 3,
  background = { r: 0, g: 0, b: 0 }
}: ICreateBGImage): Promise<Buffer> => {
  return sharp({
    create: {
      width: width,
      height: height,
      channels: channels,
      background: background
    }
  })
    .png({ quality: 100 })
    .toBuffer()
}

export const compositeImages = async (bg: Buffer, imgPath: string, gravity = 'center') => {
  const input = imgPath
  const imgDir = imgPath.substring(0, imgPath.lastIndexOf('/'))
  const imgName = imgPath.split('/').reverse()[0].split('.')[0]
  const imgExt = imgPath.split('/').reverse()[0].split('.')[1]

  const { width, height } = await sharp(bg).metadata()
  if (!width || !height) throw new Error('deu ruim!')
  
  const bgImgPath = path.join(imgDir, `${imgName}-bg-${width}x${height}.${imgExt}`)

  await sharp(bg).composite([{ input, gravity }]).png({ quality: 100 }).toFile(bgImgPath)

  return bgImgPath
}
