import fs from 'fs'
import jsontoxml from 'jsontoxml'
import path from 'path'
import sharp from 'sharp'
import { xmlToJson } from './get-annotations-from-bg-imgs/getAnnotationsFromBlackBg'

export const getDimensions = async (imageName: string, dirPath: string, imgExtension: string) => {
  const imagePath = path.join(dirPath, imageName) + imgExtension 
  const { height, width } = await sharp(imagePath).metadata()
  if (!height || !width) throw new Error('bla') 
  return { height, width }
}

export const convertToJsonAnnotation = (dirPath: string, imgName: string, x: number, y: number, width: number, height: number, side: number) => {
  const xmlPath = path.join(dirPath, imgName) + '.xml'
  const jsonAnnotation = xmlToJson(xmlPath)

  jsonAnnotation.annotation.size.width = side
  jsonAnnotation.annotation.size.height = side

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
 
