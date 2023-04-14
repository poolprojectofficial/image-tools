import fs from 'fs'

const dirPath = '/home/muniz/projects/six&bus/downloads/frames-64/val'
const resultName = 'val.txt'
const imagesNames = fs
  .readdirSync(dirPath, { encoding: 'utf-8' })
  .filter((e) => e.endsWith('.jpg'))
  .map(e => e.replace('.jpg', ''))
  .join('\n')
fs.writeFileSync(`${dirPath}/${resultName}`, imagesNames)
