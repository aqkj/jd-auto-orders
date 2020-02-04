# nodejs实现京东登录自动下单

最近口罩比较难买，所以做了一个这个项目用来买口罩;
目前实现运行后扫码登录，然后开始扫描对应产品货物，有货则自动下单;
喜欢的可以fork和star;

## 技术栈

> puppeteer + ts

## 使用说明

```
npm i // 安装依赖
npm run start // 运行, 运行前记得配置产品数据
```

## 项目文件说明

```
|- defaultimg.ts // 页面加载请求过滤网络图片，使用此默认图片代替，优化加载速度
|- index.ts // 主逻辑入口
|- log.ts // 生成日志逻辑
|- mail.ts // 发送邮件逻辑
|- package.json // node包配置
|- products.json // 需要爬的产品数据配置文件
|- tsconfig.json // ts配置
```

## products.json 产品数据配置文件

前置，注意配置此文件，脚本根据此文件抓取；可配置多个

```json
[{
    "skuId": 100002990895, // 产品id，通过京东产品链接获取https://item.jd.com/100002990895.html;
    "needs": 1 // 需要下单的件数
}, {
    "skuId": 100002990894, // 产品id，通过京东产品链接获取https://item.jd.com/100002990894.html;
    "needs": 1 // 需要下单的件数
}]
```