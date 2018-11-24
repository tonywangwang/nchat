# N-Chat

N-Chat是可接入类似Confluence这样其他软件平台在线实时互动通讯平台。

## 功能

* 如果是接入模式，可按照三方系统Page等自定义构建Chat区域(Room)
  * 比如Confluence Home Page 作为公共Chat区域
  * 用户发送的消息默认广播到所在Chat区域
* 支持文件传输
  * 图片上传成功后，直接以图片形式显示
  * 文件上传成功后，以下载link显示
* 历史消息服务
  * 所有消息存储于服务端
  * 连线后，恢复特定时间段内（条件）的历史消息
* 服务端广播
  * 用户进入一个Page(Room)后，将发出如下广播通知: 
    * （to All）谁进入了什么Page,并提供Page Link，
    * （to All） 在线用户
  * 用户离开一个Page(Room)后，将发出如下广播通知：
  * 广播总在线用户，以及当前你Page区域在线用户

## 特性

* 信息检索
    * 打卡信息：基于Attendance API
    * 员工个人信息：基于EmployeeInfo API
    * 项目信息：基于PMC API
    * 知识库： 基于Confluene API
    * 积点查询： 基于NPoint API

* 知识问答
    * 用户可以在平台提问，其他用户可以对于问题进行在线解答
    * 对于Q&A 进行评价（提问者）和跟踪统计
    * 对于成功解答的问题的用户给予激励 

* Standlone模式
    * 支持不介入其他平台（Confluence），单独的运行。
    * 将核心模型和功能抽离出来使得Confluence仅仅是接入模式之一
    * 甚至包括作为单独的及时沟通扩展集成到类似于Conluence这样的第三方软件平台，增加原平台的价值。

* Server集群模式
    * 支持集群模式应对更多的客户端连接
    * Server和Server之间依然采用Socket进行消息实时同步
    * 共享相同的消息持久化存储
    * 客户端自主选择连接Server (客户端负载均衡) 

## 核心模型

### User
```javascript
{
  id: 'tw14',
  name: 'Tony.J.Wang',
  iconUrl: 'http://tony.jpg',
}
```
### Room
```javascript
{
    id: 'appid | guid',
    name: 'n-chat',
    type:'confluence | standalone',
    url: 'https://www.xxxxx.com',
    users:[user1,user2,user3]
}
```
### Message
```javascript
{
    id: guid,
    value: 'hello world!',
    type:  'text | image | question | answer', 
    sender: User,
    receiver: User,
    room: Room,
    time: '2018-11-11 11:08' //UTC
}
```

## 程序运行

```
npm install
```

```
node index
```

http://localhost


## 开发日志

### 2018.11.15
* standlone 模式上线

### 2018.11.22
* confluence plugin 上线内测

### 2018.11.23
* 用户输入内容 encode
* 修复 “token 处理不正确，导致Login Failed的问题”
* UserName 格式调整：FullName->FullName (Title)
* Room List按照在线人数排序
* 优化room创建和信息加载机制

### 2018.11.24
* 解决跨域问题
* 添加Plugin模式下Room的外部链接(originUrl)
* 支持HTTPS