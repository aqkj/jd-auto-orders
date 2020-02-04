/**
 * 入口
 */
import puppeteer from 'puppeteer'
import qs from 'querystring'
import os from 'os'
import child_process from 'child_process'
import iconv from 'iconv-lite'
import http from 'http'
import cluster from 'cluster'
import sendMail from './mail'
import fs from 'fs'
import path from 'path'
import { EventEmitter } from 'events'
import imageBytes from './defaultimg'
import Log from './log'
// 获取产品列表
let products = require('./products.json')
// 获取cpu核心数量
const cpulength: number = os.cpus().length
// 获取每个cpu分配的数量
const step = Math.ceil(products.length / cpulength)
let userInfo: Record<string, any> = {}
let uuid = ''
// 是否在下单
let isOrder = false
// 是否在登录状态
let isLogin = false
const event = new EventEmitter()
let brower: puppeteer.Browser = null
let pages: puppeteer.Page[] = []
if (cluster.isMaster) {
  ;(async () => {
    const productSuccess: Set<string> = new Set([])
    const works: cluster.Worker[] = []
    brower = await puppeteer.launch({
      headless: true
      // args: [
      //   '--disable-gpu',
      //   '–-disable-dev-shm-usage',
      //   '–-disable-setuid-sandbox',
      //   '–-no-first-run',
      //   '–-no-sandbox',
      //   '–-no-zygote',
      //   '–-single-process'
      // ]
    })
    const page = await brower.newPage()
    pages = await brower.pages()
    // console.log(pages.length)
    // return
    page.setViewport({
      width: 1200,
      height: 1200
    })
    await page.setRequestInterception(true)
    page.on('request', (req) => {
      // 请求禁止,加快页面响应速度
      if (req.resourceType().match(/image|stylesheet|font/) && !isLogin) {
        // req.abort()
        req.respond({
          status: 200,
          body: Buffer.from(imageBytes)
        });
        return;
      }
      // 其他
      req.continue()
    })
    page.on('response', async (res) => {
      const myUrl = new URL(res.url())
      const params: Record<string, any> = qs.parse(myUrl.search.slice(1))
      event.emit(myUrl.pathname, res)
      // 判断是否为获取用户信息的接口
      if (myUrl.pathname === '/user/petName/getUserInfoForMiniJd.action' && !userInfo) {
        const text = await res.text()
        userInfo = getJsonp(params.callback, text)
        console.log('更新登录用户个人数据')
      }
    })
    // 优先登录
    await login(page)
    // process.exit()
    // 收集接口依赖数据
    console.log(`正在收集产品依赖数据中，共${products.length}个产品`)
    for (const product of products) {
      console.log(`产品ID:${product.skuId} 收集中...`)
      // 失败了重新尝试一次
      try {
        await getdepData(page, product)
      } catch (e1) {
        console.log('重新尝试获取数据', `产品ID:${product.skuId}`, e1.message)
        try {
          await getdepData(page, product)
        } catch (e2) {}
      }
    }
    products = products.filter(product =>
      product.skuId &&
      product.name &&
      product.venderId &&
      product.cat &&
      product.buyNum
    )
    console.log('收集产品依赖数据结束', `共收集${products.length}个产品数据`)
    // process.exit()
    // 清空购物车
    await clearCart(page)
    // process.exit()
    // await brower.close()
    for (let index = 0; index < cpulength; index++) {
      const work = cluster.fork()
      works.push(work)
      // 发送数据
      work.send({
        productList: products.slice(index * step, step * (index + 1)),
        index,
        userInfo,
        uuid
      })
      // 接收数据
      work.process.on('message', (data) => {
        if (typeof data === 'object') {
          let { msg, product, type }: any = data
          product = products.find(p => p.skuId === product.skuId)
          // 存在，则加入购物车并下单
          if (type === 'requestGoodsById') {
            productSuccess.add(msg)
            if (product.needs > 0) {
              // 提前-1
              product.needs--
              try {
                // 通知所有进入抢单状态
                // works.forEach(w => {
                //   w.process.send({
                //     type: 'order',
                //     value: true
                //   })
                // })
                addCart(page, product, () => {
                  console.log('下单结束')
                  // 通知所有取消抢单状态
                  // works.forEach(w => {
                  //   w.process.send({
                  //     type: 'order',
                  //     value: false
                  //   })
                  // })
                })
              } catch (error) {
                Log.write('系统出现错误', error.message)
              }
            } else {
              Log.write(product.name, '不需要货物了')
            }
            // 将时间段内存在的物品写入到data文件内
            fs.writeFile(path.join(__dirname, './productSuccess.data'), Array.from(productSuccess).join('\n'), (err) => {
              if (err) return console.log(err)
            })
          } else if (type === 'log') {
            Log.write(msg)
          }
        }
      })
    }
  })()
} else {
  process.on('message', async (data: {
    type?: string
    value?: any
    index: number
    productList: any[]
    userInfo: typeof userInfo
    uuid: typeof uuid
  }) => {
    // if (data.type === 'order') {
    //   isOrder = data.value
    // } else {
    userInfo = data.userInfo
    uuid = data.uuid
    // console.log(data)
    // console.log()
    // const productList = products.slice(data.index * step, step * (data.index + 1))
    // await sleep(data.index * 2000)
    if (data.productList.length) {
      getProduct(data.productList)
    }
    // }
  })
  console.log(`工作进程 ${process.pid} 准备爬取`)
}
/**
 * 清空购物车
 * @param page 
 */
async function clearCart(page) {
  if (isOrder) return
  try {
    isOrder = true
    const old = Date.now()
    await page.goto(`https://cart.jd.com/`)
    console.log('[防止误下单]正在清空购物车...')
    const clearAll = await page.$('.J_clr_all')
    if (clearAll) {
      await clearAll.click()
      await sleep(100)
      const cartcItems = await page.$$('.cartc-item')
      for (const cartItem of cartcItems) {
        await cartItem.click()
      }
      const del = await page.$('#cart-cleaner-continer-3vwezo-opt-del')
      await del.click()
      console.log('清空购物车结束', Date.now() - old)
    } else {
      console.log('购物车内没东西')
    }
  } catch (error) {
    console.log('清空购物车失败', error.message)
  } finally {
    isOrder = false
  }
}
/**
 * 加入到购物车
 */
async function addCart(page: puppeteer.Page, product, cb: VoidFunction) {
  console.log('isOrder', isOrder)
  // 一次只能一单
  if (isOrder) {product.needs ++; return}
  const oldTimes = Date.now()
  let submitClickTime = 0
  let hasClick = true
  // 下单成功页面加载
  function pageLoad() {
    // 不存在click则表示未下单成功
    if (hasClick) {
      Log.write(product.name, '下单成功，需要的数量-1', product.needs, `下单耗时:${submitClickTime - oldTimes}`)
      // 发送邮件
      sendMail(`${product.name} https://www.jd.com/`)
    } else {
      product.needs += 1
    }
    event.off('/shopping/order/submitOrder.action', eventFireFn)
    isOrder = false
    clearCart(page).finally(() => {
      cb && cb()
    })
  }
  // 事件触发方法
  async function eventFireFn(res: puppeteer.Response) {
    let result = ''
    try {
      result = await res.text()
    } catch (error) {
      result = ''
    }
    // console.log('/shopping/order/submitOrder.action', result, !!result)
    if (result) {
      Log.write(product.name, '下单失败', `下单耗时:${submitClickTime - oldTimes}`, `\n${result}`)
      isOrder = false
      clearCart(page).finally(() => {
        cb && cb()
      })
      product.needs += 1
      page.off('load', pageLoad)
    }
  }
  try {
    isOrder = true
    pages[0].goto(`https://cart.jd.com/gate.action?pid=${product.skuId}&pcount=${product.buyNum}&ptype=1`)
    await sleep(100)
    // 购物车页面
    // await page.goto(`https://cart.jd.com/gate.action?pid=${product.skuId}&pcount=${product.buyNum}&ptype=1`)
    // 下单页面
    await page.goto(`https://trade.jd.com/shopping/order/getOrderInfo.action`)
    // 检测
    event.once('/shopping/order/submitOrder.action', eventFireFn)
    page.once('load', pageLoad)
    try {
      ;(await page.$('#order-submit')).click()
    } catch (error) {
      hasClick = false
      throw error
    }
    submitClickTime = Date.now()
    await page.screenshot({
      path: './order.png'
    })
  } catch (error) {
    isOrder = false
    Log.write(product.skuId, product.name, '下单失败', error.message)
    event.off('/shopping/order/submitOrder.action', eventFireFn)
    page.off('load', pageLoad)
    product.needs += 1
    clearCart(page).finally(() => {
      cb && cb()
    })
  }
  // isOrder = false
}
/**
 * 获取依赖数据
 * @param 产品id
 */
async function getdepData(page: puppeteer.Page, product: {
  skuId: string | number,
  [key: string]: any
}) {
  try {
    // 打开对应产品页面
    await page.goto(`https://item.jd.com/${product.skuId}.html`)
    await page.screenshot({
      path: `./${product.skuId}.png`
    })
    const aHandle = await page.evaluateHandle(() => (window as any).pageConfig);
    // 获取信息
    const resultHandle = await page.evaluateHandle(pageConfig => ({
      cat: pageConfig.product.cat,
      venderId: pageConfig.product.venderId
    }), aHandle);
    Object.assign(product, await resultHandle.jsonValue())
    product.buyNum = ~~await page.$eval('#buy-num', node => (node as any).value)
    product.name = (await page.$eval('.sku-name', node => node.innerHTML) || '').replace(/\<\w+(.| )*\/?>/g, '').replace(/\n| /g, '')
    // 如果uuid不存在，则查找uuid
    if (!uuid) {
      const jdu = (await page.cookies()).find((val) => val.name === '__jdu') || { value: '' }
      uuid = jdu.value
    }
    await aHandle.dispose();
  } catch (error) {
    Log.write('获取依赖数据失败', product.skuId)
    throw new Error(error)
  }
}
/**
 * 登录
 * @param page 页面对象
 */
async function login(page: puppeteer.Page) {
  console.log('准备登录中...')
  isLogin = true
  try {
    await page.goto('https://passport.jd.com/new/login.aspx')
  } catch (error) {
    return await login(page)
  }
  await getQrcode(page)
  await new Promise((resolve) => {
    page.on('response', async function qrcodeOn(res) {
      if (res.ok()) {
        // 获取请求的地址
        const url: string = await res.request().url()
        const myUrl = new URL(url)
        // 判断是否为扫码接口
        if (myUrl.pathname === '/check' && myUrl.hostname === 'qr.m.jd.com') {
          const params: Record<string, any> = qs.parse(myUrl.search.slice(1))
          const callback = params.callback
          const data = new Function(callback, `return ${await res.text()}`)(callbackFn)
          if (data.code !== 200) console.log(data.msg)
          // 二维码过期
          if (data.code === 203) {
            getQrcode(page, true)
          } else if (data.code === 201) { // 等待扫描
  
          } else if (data.code === 202) { // 请在手机上确认
  
          } else if (data.code === 200) { // 确认完毕
            const ticket: string = data.ticket
            isLogin = false
            // 页面加载触发
            page.once('load', async (e) => {
              page.off('response', qrcodeOn)
              console.log('登录成功')
              await page.screenshot({
                path: './login.png'
              })
              resolve()
              // console.log('page on load')
              // const url = page.url()
              // console.log(url)
              // // if (url === '')
              // page.goto('https://item.jd.com/100010233106.html').then(async () => {
              //   const nickname = await page.$eval('.nickname', (node) => node.innerHTML)
              //   if (nickname) {
                  
              //   }
              //   console.log(nickname)
              // })
            })
          }
        }
      }
    })
  })
}
/**
 * 回调
 * @param data 数据
 */
function callbackFn(data: any) {
  return data
}
/**
 * 获取jsonp数据
 * @param cb 回调名称
 * @param data 数据字符串
 */
function getJsonp(cb: string, data: string) {
  return new Function(cb, `return ${data}`)(callbackFn)
}
/**
 * 获取二维码
 * @param page 
 */
async function getQrcode(page: puppeteer.Page, refresh?: boolean) {
  // 拿到qrcode元素
  const qrcode = await page.$('.qrcode-img')
  if (refresh) {
    const refreshBtn = await page.$('.refresh-btn')
    await refreshBtn.click()
    await sleep(2000)
  }
  console.log('生成二维码中...')
  await qrcode.screenshot({
    path: './qr.png'
  })
  child_process.exec('qr.png', (error) => {
    if (error) console.log('打开图片失败')
  })
}
/**
 * 停顿
 * @param times 时间
 */
async function sleep(times: number) {
  await new Promise((resolve) => setTimeout(resolve, times))
}
/**
 * 获取产品数据
 * @param data 
 */
async function getProduct(data) {
  for (const product of data) {
    if (isOrder) {
      await sleep(2000)
      continue
    }
    let result
    try {
      result = await requestGoodsById(product)
    } catch (error) {
      result = await requestGoodsById(product)
    }
    if (result) process.send({
      type: 'requestGoodsById',
      product,
      msg: `${result} https://item.jd.com/${product.skuId}.html`
    })
    // await new Promise((resolve) => {
    //   setTimeout(() => {
    //     resolve()
    //   }, 100)
    // })
  }
  getProduct(data)
}
async function requestGoodsById(product) {
  const now = new Date()
  const hour: number = now.getHours()
  const minutes: number = now.getMinutes()
  const second: number = now.getSeconds()
  try {
    const res = await request({
      url: 'http://c0.3.cn/stock',
      params: {
        skuId: product.skuId,
        area: '12_988_40034_58079', // 连云港
        // area: '12_911_917_23821', // 徐州
        // area: '12_988_3088_0', // 苏州
        venderId: product.venderId,
        buyNum: product.buyNum,
        choseSuitSkuIds: null,
        cat: product.cat.join(','),
        extraParam: '{\"originid\":\"1\"}',
        fqsp: 0,
        pdpin: userInfo.realName,
        pduid: uuid,
        ch: 1,
        callback: 'jQuery1088082'
      },
      method: 'get'
    })
    if (res && res.stock && res.stock.StockState !== 34) {
      console.log('\x1B[32m[', `${hour}:${minutes}:${second}`, ']', product.name, ' 有货\x1b[0m')
      return `[ ${hour}:${minutes}:${second} ] ${product.name} 有货`
    } else {
      console.log('\x1b[31m[', `${hour}:${minutes}:${second}`, ']', product.name, ' 无货\x1b[0m')
      return false
    }
  } catch (error) {
    console.log('\x1B[33m[', `${hour}:${minutes}:${second}`, ']', product.skuId, product.name, '-', error.message, '\x1b[0m')
    // throw new Error(error)
  }
}

interface IRequestOptions {
  method?: string
  url: string
  params: Record<string, any>
}
function request(options: IRequestOptions) {
  options.method = options.method.toUpperCase() || 'GET'
  const myUrl = new URL(options.url)
  if (myUrl.search) options.params = Object.assign({}, qs.parse(myUrl.search.slice(1)), options.params)
  const search = '?' + decodeURIComponent(qs.stringify(options.params))
  // console.log(search)
  return new Promise((resolve: (val: Record<string, any>) => any, reject) => {
    http.request({
      timeout: 300,
      method: options.method,
      hostname: myUrl.hostname,
      path: myUrl.pathname + search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36'
      }
    }, (res) => {
        let data = []
        res.on('data', (chunk: any) => {
            data.push(chunk)
        })
        res.on('end', () => {
          const headers = res.headers
          let charset
          try {
            charset = headers['content-type'].match(/(?:charset=)(\w+)/)[1] || 'utf8';
          } catch (error) {
            charset = 'utf8'
          }
          // 转编码，保持跟响应一致
          let body = iconv.decode(Buffer.concat(data), charset);
          const result = getJsonp(options.params.callback, body)
          resolve(result)
        })
    }).on('error', (err) => {
      reject(err)
    }).on('timeout', () => {
      reject(new Error('链接超时'))
    }).end()
  })
}