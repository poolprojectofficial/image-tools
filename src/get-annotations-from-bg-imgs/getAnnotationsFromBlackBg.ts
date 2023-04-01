import fs from 'fs'
import path from 'path'
import sharp, { Sharp } from 'sharp'
import { XMLParser, XMLBuilder, XMLValidator } from 'fast-xml-parser'
import jsontoxml from 'jsontoxml'

const imgSide = 128
const dirBlackBgImg = '/home/muniz/projects/six&bus/repos/image-tools/src/annotation-adapter/data'
const dirSmallImg = '/home/muniz/projects/six&bus/repos/image-tools/src/annotation-adapter/data/small'
const imgExtension = '.jpg'

export const getAnnotationsFromBlackBg = async () => {
  const imgNames = await getImgNames()
  console.log(imgNames)

  for (const imgName of imgNames) {
    const jsonAnnotation = await createAnnotation(imgName)
    createNewXmlFile(jsonAnnotation, imgName)
  }
}

const getImgNames = async () => {
  return fs
    .readdirSync(dirBlackBgImg, { encoding: 'utf-8' })
    .filter((a) => a.includes(imgExtension))
    .map((a) => a.replace(imgExtension, ''))
}

const createNewXmlFile = async (annotation: any, imgName: string) => {
  const xmlAnnotation = jsontoxml(annotation)
  const smallXmlPath = path.join(dirSmallImg, imgName) + '.xml'
  fs.writeFileSync(smallXmlPath, xmlAnnotation)
}

const createAnnotation = async (imgName: string) => {
  const smallImgPath = path.join(dirSmallImg, imgName) + imgExtension
  const xmlPath = path.join(dirBlackBgImg, imgName) + '.xml'

  const smallImage = await sharp(smallImgPath).png({ quality: 100 })
  const jsonAnnotation = xmlToJson(xmlPath)

  const { height, width } = await smallImage.metadata()
  if (!height || !width) throw new Error('bla')

  const x = Math.floor((imgSide - width) / 2)
  const y = Math.floor((imgSide - height) / 2)

  jsonAnnotation.annotation.size.width = width
  jsonAnnotation.annotation.size.height = height

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

const convertBndBox = (bndbox: any, x: number, y: number) => {
  bndbox.xmin -= x
  bndbox.xmax -= x
  bndbox.ymin -= y
  bndbox.ymax -= y
}

const getDimensions = async (image: Buffer) => {
  try {
    const buffer = await sharp(image.buffer)
    const { height, width } = await buffer.metadata()
    return { height, width }
  } catch (err) {
    console.log(err)
  }
}

const xmlToJson = (xmlPath: string) => {
  const xml = fs.readFileSync(xmlPath)
  const parser = new XMLParser()
  return parser.parse(xml)
}
