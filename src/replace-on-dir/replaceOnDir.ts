import fs from 'fs'

const dirPath = '/home/muniz/projects/six&bus/downloads/v831_yolo_baby/data/custom/Annotations'
const replaceChar = '&'
const resultDir = `${dirPath}/replaced`

if (!fs.existsSync(resultDir)) fs.mkdirSync(resultDir)

fs.readdirSync(dirPath, { encoding: 'utf-8' })
  .filter((e) => e.endsWith('.xml'))
  .forEach((xmlName) => {
    const stringXML = fs.readFileSync(`${dirPath}/${xmlName}`).toString().replace(replaceChar, '')
    fs.writeFileSync(`${resultDir}/${xmlName}`, stringXML)
  })
