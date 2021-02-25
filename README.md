## 小程序编译并上传体验版&预览版

### 配置`config`
- `port`: 端口，默认`3100`
- `gitlabHost`: `gitlab host`
- `gitlabToken`:  `gitlab personal access token`
- `gitlabRepoIds`: 仓库Id, 例： `['2345', '1234']`
- `mpList`: 小程序列表
  - 例子：
  ```json
  [
    {
      appid: 'xxx', 
      appname: 'xxx',
      // 小程序上传key, 去微信平台下载密钥key， 需保证该路径可以访问到
      keypath: '/Users/heliujie/Desktop/private.key' 
    }
  ]
  ```
- `experienceQrCodeUrl`: 体验版二维码网络图片， 例： `https://xxxx.png`

### 支持(Taro微信小程序)
- 上传体验版
- 上传预览版


### 使用方式
如下图， 资源管理器里，点击启动服务
![引导](/resources/guide1.png)


### 页面操作
![引导](/resources/guide2.png)
