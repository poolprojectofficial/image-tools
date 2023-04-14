import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import os from 'os'
import {createDirIfNotExisted} from '../tools'

const imageDir = '/home/muniz/projects/six-n-bus/downloads/image-tiles-example'
const outDir = '/home/muniz/projects/six-n-bus/downloads'
const tileSize = 512
const type = 'raw' // raw, grayscale, mirror, blur

export const tileImages = async () => {
  try {
    fs.mkdirSync(path.join(outDir, type))
  } catch(err) {
    console.log('dir already created!')
  }
  
  const imagesNames = fs.readdirSync(imageDir)
  for (const imageName of imagesNames) {
    const imagePath = path.join(imageDir, imageName)
    const metadata = await sharp(imagePath).metadata()
    const extractList = getExtractList(metadata)
    await createNewTileFile(extractList, imagePath,imageName.replace('.jpg', ''))
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
  pushMainInsideTilesIntoExtractList(xTiles, yTiles, extractList)

  const extraXTileNeeded = xTiles != xProportion
  const extraYTileNeeded = yTiles != yProportion

  if (extraXTileNeeded) {
    pushRightTilesIntoExtractList(width, yTiles, extractList)
    pushRightInsideTilesIntoExtractList(width, yTiles, extractList)
  }
  
  if (extraYTileNeeded) {
    pushBottomTilesIntoExtractList(height, xTiles, extractList)
    pushBottomInsideTilesIntoExtractList(height, xTiles, extractList)
  }

  if (extraXTileNeeded && extraYTileNeeded) {
    pushCornerTilesIntoExtractList(width, height, xTiles, extractList)
    pushCornerInsideTilesIntoExtractList(width, height ,xTiles, extractList)
  }
  return extractList
}

const createNewTileFile = async (extractList: any, imagePath: string, imageNameWithoutExt: string) => {
  let n = 0

  
  for (let i = 0; i < extractList.length; i++) {
    await sharp(imagePath)
      .toFormat('jpeg', { mozjpeg: true })
      // .png({ quality: 100 })
      .extract(extractList[i])
      .toFile(path.join(outDir, type, `${imageNameWithoutExt}-${tileSize}px-${type}_${i}.jpg`))
  }
}

const pushMainTilesIntoExtractList = (xTiles: number, yTiles: number, extractList: sharp.Region[]) => {
  for (let y = 0; y < yTiles; y++) {
    for (let x = 0; x < xTiles; x++) {
      extractList.push({ width: tileSize, height: tileSize, left: x * tileSize, top: y * tileSize })
    }
  }
}

const pushMainInsideTilesIntoExtractList = (xTiles: number, yTiles: number, extractList: sharp.Region[]) => {
  for (let y = 0; y < yTiles - 1; y++) {
    for (let x = 0; x < xTiles - 1; x++) {
      extractList.push({ width: tileSize, height: tileSize, left: tileSize * (x + 0.5), top: tileSize * (y + 0.5) })
    }
  }
}

const pushRightTilesIntoExtractList = (width: number, yTiles: number, extractList: sharp.Region[]) => {
  for (let y = 0; y < yTiles; y++) {
    extractList.push({ width: tileSize, height: tileSize, left: width - tileSize, top: y * tileSize })
  }
}

const pushRightInsideTilesIntoExtractList = (width: number, yTiles: number, extractList: sharp.Region[]) => {
  for (let y = 0; y < yTiles - 1; y++) {
    extractList.push({ width: tileSize, height: tileSize, left: width - tileSize * 1.5, top: tileSize * (y + 0.5) })
  }
}

const pushBottomTilesIntoExtractList = (height: number, xTiles: number, extractList: sharp.Region[]) => {
  for (let x = 0; x < xTiles; x++) {
    extractList.push({ width: tileSize, height: tileSize, left: x * tileSize, top: height - tileSize })
  }
}

const pushBottomInsideTilesIntoExtractList = (height: number, xTiles: number, extractList: sharp.Region[]) => {
  for (let x = 0; x < xTiles - 1; x++) {
    extractList.push({ width: tileSize, height: tileSize, left: (x + 0.5) * tileSize, top: height - tileSize * 1.5 })
  }
}


const pushCornerTilesIntoExtractList = (width: number, height: number, xTiles: number, extractList: sharp.Region[]) => {
  extractList.push({ width: tileSize, height: tileSize, left: width - tileSize, top: height - tileSize })
}

const pushCornerInsideTilesIntoExtractList = (width: number, height: number, xTiles: number, extractList: sharp.Region[]) => {
  extractList.push({ width: tileSize, height: tileSize, left: width - tileSize * 1.5, top: height - tileSize * 1.5 })
}

tileImages()
