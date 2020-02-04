/**
 * 发送邮件
 */
import nodemailer from 'nodemailer'
export default async function sendMail(message: string) {
  const transport = nodemailer.createTransport({
    host: 'smtp.163.com',
    port: 465, // port
    pool: true,
    secure: true,
    auth: {
      user: 'xxx',
      pass: 'xxx'
    }
  })
  const msg = {
    from: 'Node服务 <xxx@163.com>',
    to: '465633678@qq.com',
    subject: `下单成功，赶快抓紧时间付款。`,
    // subject: '邮件测试',
    text: message
  }
  try {
    await transport.sendMail(msg)
    console.log('提醒邮件发送成功')
  } catch (error) {}
}
// sendMail('[ 23:4:15 ] 霍尼韦尔（Honeywell）H930V - 5只/包 有货 https://item.jd.com/100006784144.html')