import fs from 'fs'
import path from 'path'
import sharp, { Sharp } from 'sharp'
import { XMLParser, XMLBuilder, XMLValidator } from 'fast-xml-parser'
import jsontoxml from 'jsontoxml'
import { convertToJsonAnnotation, createNewXmlFile, getDimensions } from '../tools'

const imgSide = 128
const dirBlackBgImg = '/home/muniz/projects/six&bus/repos/image-tools/src/annotation-adapter/data'
const dirSmallImg = '/home/muniz/projects/six&bus/repos/image-tools/src/annotation-adapter/data/small'
const imgExtension = '.jpg'

export const getAnnotationsFromBlackBg = async () => {
  const imgNames = await getImgNames()
  console.log(imgNames)

  for (const imgName of imgNames) {
    const jsonAnnotation = await createAnnotation(imgName)
    await createNewXmlFile(jsonAnnotation, imgName, dirSmallImg)
  }
}

const getImgNames = async () => {
  return fs
    .readdirSync(dirBlackBgImg, { encoding: 'utf-8' })
    .filter((a) => a.includes(imgExtension))
    .map((a) => a.replace(imgExtension, ''))
}



const createAnnotation = async (imgName: string) => {
  const { height, width } = await getDimensions(imgName, dirSmallImg, imgExtension)
  const x = Math.floor((imgSide - width) / 2)
  const y = Math.floor((imgSide - height) / 2)

  const jsonAnnotation = convertToJsonAnnotation(dirBlackBgImg, imgName,x, y, width, height, imgSide)
  return jsonAnnotation
}

const getDimensions2 = async (image: Buffer) => {
  try {
    const buffer = await sharp(image.buffer)
    const { height, width } = await buffer.metadata()
    return { height, width }
  } catch (err) {
    console.log(err)
  }
}

export const xmlToJson = (xmlPath: string) => {
  const xml = fs.readFileSync(xmlPath)
  const parser = new XMLParser()
  return parser.parse(xml)
}
