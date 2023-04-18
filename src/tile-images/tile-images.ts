import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { compositeImages, createBgImg, createDirIfNotExisted } from '../tools'

const imageDir = '/home/muniz/projects/six-n-bus/downloads/menino-empurrado-na-piscina-1024x576'
const outDir = imageDir
const tileSize = 480
const type = 'raw' // raw, grayscale, mirror, blur

export const tileImages = async () => {
  try {
    await createDirIfNotExisted(imageDir, type)

    const imagesNames = fs.readdirSync(imageDir).filter((a) => a.endsWith('.jpg'))
    for (const imageName of imagesNames) {
      console.log(imageName)

      let imagePath = path.join(imageDir, imageName)
      const newBgImgPath = await addBGIfNecessary(imagePath, 480)
      if (newBgImgPath) imagePath = newBgImgPath

      const metadata = await sharp(imagePath).metadata()
      const extractList = getExtractList(metadata)
      await createNewTileFile(extractList, imagePath, imageName.replace('.jpg', ''))

      if (newBgImgPath) fs.rmSync(newBgImgPath)
    }
  } catch (err: any) {
    console.log(err.message)
  }
}

const addBGIfNecessary = async (imagePath: string, size: number) => {
  try {
    const metadata = await sharp(imagePath).metadata()

    if (!metadata.width || !metadata.height) throw new Error('deu ruim!!!')
    const { width, height } = metadata

    if (width < size || height < size) {
      const bg = await createBgImg({
        height: height < size ? size : height,
        width: width < size ? size : width
      })
      const bgImgPath = await compositeImages(bg, imagePath)
      return bgImgPath
    }
  } catch (err) {
    console.log(err)
    throw new Error('deu ruimmm')
  }
}

const getExtractList = (metadata: sharp.Metadata) => {
  if (!metadata.width || !metadata.height) return new Error('deu ruim!!!')
  const { width, height } = metadata

  const xProportion = width / tileSize
  const yProportion = height / tileSize

  const xTiles = Math.floor(xProportion)
  const yTiles = Math.floor(yProportion)

  const extractList: sharp.Region[] = []

  pushMainTilesIntoExtractList(xTiles, yTiles, extractList)
  pushMainInsideTilesIntoExtractList(width, height, xTiles, yTiles, extractList)

  const extraXTileNeeded = xTiles != xProportion
  const extraYTileNeeded = yTiles != yProportion

  if (extraXTileNeeded) {
    pushRightTilesIntoExtractList(width, yTiles, extractList)
    pushRightInsideTilesIntoExtractList(width, height, yTiles, extractList)
  }

  if (extraYTileNeeded) {
    pushBottomTilesIntoExtractList(height, xTiles, extractList)
    pushBottomInsideTilesIntoExtractList(width, height, xTiles, extractList)
  }

  if (extraXTileNeeded && extraYTileNeeded) {
    pushCornerTilesIntoExtractList(width, height, extractList)
    pushCornerInsideTilesIntoExtractList(width, height, extractList)
  }
  return extractList
}

const createNewTileFile = async (extractList: any, imagePath: string, imageNameWithoutExt: string) => {
  try {
    for (let i = 0; i < extractList.length; i++) {
      await sharp(imagePath)
        .toFormat('jpeg', { mozjpeg: true })
        // .png({ quality: 100 })
        .extract(extractList[i])
        .toFile(path.join(outDir, type, `${imageNameWithoutExt}-${tileSize}px-${type}_${i}.jpg`))
    }
  } catch (err) {
    console.log(err)
  }
}

const pushMainTilesIntoExtractList = (xTiles: number, yTiles: number, extractList: sharp.Region[]) => {
  for (let y = 0; y < yTiles; y++) {
    for (let x = 0; x < xTiles; x++) {
      const left = x * tileSize
      const top = y * tileSize
      extractList.push({ width: tileSize, height: tileSize, left, top })
    }
  }
}

const pushMainInsideTilesIntoExtractList = (width: number, height: number, xTiles: number, yTiles: number, extractList: sharp.Region[]) => {
  for (let y = 0; y < yTiles - 1; y++) {
    for (let x = 0; x < xTiles - 1; x++) {
      const left = tileSize * (x + 0.5)
      const top = tileSize * (y + 0.5)
      if (left + tileSize <= width && top + tileSize <= height) extractList.push({ width: tileSize, height: tileSize, left, top })
    }
  }
}

const pushRightTilesIntoExtractList = (width: number, yTiles: number, extractList: sharp.Region[]) => {
  for (let y = 0; y < yTiles; y++) {
    const left = width - tileSize
    const top = y * tileSize
    extractList.push({ width: tileSize, height: tileSize, left, top })
  }
}

const pushRightInsideTilesIntoExtractList = (width: number, height: number, yTiles: number, extractList: sharp.Region[]) => {
  for (let y = 0; y < yTiles - 1; y++) {
    const left = width - tileSize * 1.5
    const top = tileSize * (y + 0.5)
    if (left >= 0 && top + tileSize <= height) extractList.push({ width: tileSize, height: tileSize, left, top })
  }
}

const pushBottomTilesIntoExtractList = (height: number, xTiles: number, extractList: sharp.Region[]) => {
  for (let x = 0; x < xTiles; x++) {
    const left = x * tileSize
    const top = height - tileSize
    extractList.push({ width: tileSize, height: tileSize, left, top })
  }
}

const pushBottomInsideTilesIntoExtractList = (width: number, height: number, xTiles: number, extractList: sharp.Region[]) => {
  for (let x = 0; x < xTiles - 1; x++) {
    const left = (x + 0.5) * tileSize
    const top = height - tileSize * 1.5
    if (top >= 0 && left + tileSize <= width) extractList.push({ width: tileSize, height: tileSize, left, top })
  }
}

const pushCornerTilesIntoExtractList = (width: number, height: number, extractList: sharp.Region[]) => {
  const left = width - tileSize
  const top = height - tileSize
  extractList.push({ width: tileSize, height: tileSize, left, top })
}

const pushCornerInsideTilesIntoExtractList = (width: number, height: number, extractList: sharp.Region[]) => {
  const left = width - tileSize * 1.5
  const top = height - tileSize * 1.5
  if (left >= 0 && top >= 0) extractList.push({ width: tileSize, height: tileSize, left, top })
}

tileImages()
