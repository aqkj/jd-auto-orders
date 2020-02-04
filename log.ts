/**
 * 日志
 */
import fs from 'fs'
export default class Log {
  private static logs: string[] = []
  constructor() {}
  static write(...str: (string | number)[]) {
    const now = new Date()
    const hour: number = now.getHours()
    const minutes: number = now.getMinutes()
    const second: number = now.getSeconds()
    console.log(`[ ${hour}:${minutes}:${second} ]`, ...str)
    this.logs.push(`[ ${hour}:${minutes}:${second} ] ` + str.join(' '))
    fs.writeFile('./logs.data', this.logs.join('\n'), (err) => {
      if (err) console.log('日志写入失败')
    })
  }
}
// Log.write('1232323232')