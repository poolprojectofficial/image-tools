import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const dirPath = '/home/muniz/Downloads/image-small'
const side = 128
const resultDirName = `${side}x${side}-black`
const imgExtensions = '.jpg'
let blackBgImage: Buffer
const gravityElements = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest', 'center', 'centre']

export const composite = async () => {
  await updateBlackBgImageVar()
  const images = await getImageNames()
  await createDirIfNotExisted()

  for (const image of images) {
    await createNewCompositeImage(image)
  }
}

const createDirIfNotExisted = async () => {
  const dirPathAndName = path.join(dirPath, resultDirName)
  const dirExists = fs.existsSync(dirPathAndName)
  if (!dirExists) fs.mkdirSync(dirPathAndName)
}

const getImageNames = async () => {
  return fs.readdirSync(dirPath, { encoding: 'utf-8' }).filter((a) => a.includes(imgExtensions))
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

const createNewCompositeImage = async (imageName: string) => {
  const randomIndex = Math.round(Math.random() * 10) - 1

  try {
    await sharp(blackBgImage)
      .composite([
        {
          input: path.join(dirPath, imageName),
          gravity: gravityElements[randomIndex]
        }
      ])
      // .withMetadata()
      .png({ quality: 100 })
      .toFile(path.join(dirPath, resultDirName, `${imageName}`))
  } catch (err) {
    console.log(imageName, err)
  }
}
