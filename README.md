# N-Chat

N-Chat是可接入类似Confluence这样其他软件平台在线实时互动通讯平台。

## 功能

 * 拖拽发送图片或者文件
 * 双击窗口切换全屏模式
 * 点击消息输入框右边 "+",可发送的表情
 * 消息中加上 @@ 联系小恩 (AI)
 * 消息中加上 @all 将向N-Chat世界广播
 * 发送 #room#房间名称 创建新的房间 
 * 发送 #help 获得帮助
 * 接入 Confluence
 * 接入 N-Point

## 特性

* 信息检索  (待实现)
    * 打卡信息：基于Attendance API
    * 员工个人信息：基于EmployeeInfo API
    * 项目信息：基于PMC API
    * 知识库： 基于Confluene API
    * 积点查询： 基于NPoint API

* 知识问答 (待实现)
    * 用户可以在平台提问，其他用户可以对于问题进行在线解答
    * 对于Q&A 进行评价（提问者）和跟踪统计
    * 对于成功解答的问题的用户给予激励 

* Standlone模式
    * 支持不介入其他平台（Confluence），单独的运行。
    * 将核心模型和功能抽离出来使得Confluence仅仅是接入模式之一
    * 甚至包括作为单独的及时沟通扩展集成到类似于Conluence这样的第三方软件平台，增加原平台的价值。

* Server集群模式 (待实现)
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
    type:'confluence | standalone | npoint',
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

http://localhost:3000


## 开发日志

### 2018.11 
* 孵化

### 2018.11.15
* standlone 模式上线

### 2018.11.22
* 支持Confluence plugin

### 2018.11.23
* 用户输入内容 encode
* 修复 “token 处理不正确，导致Login Failed的问题”
* UserName 格式调整：FullName->FullName (Title)
* Room List按照在线人数排序
* 优化room创建和信息加载机制

### 2018.11.24
* 小恩具备智能
* 解决跨域问题
* 添加Plugin模式下Room的外部链接(originUrl)
* 支持HTTPS
* 支持N-Point plugin

### 2018.11.25
* 支持表情符

### 2018.11.26
* 用户发送的url为内容的消息处理为可直接点击的连接
* 界面改版
* 增加房间收藏功能，以及收藏房间查看和编辑
* 添加所有在线用户列表，以及其他功能菜单及其相关功能
* 切换用户（注销）功能完善

### 2018.11.27
* 配置化初始用户和房间，并添加启动自动初始化功能
* 向CDMIS全员发布第一次内测

### 2018.11.28
* 支持 Jira Plugin
* 显示用户在线状态，以及用户手动reconnect/disconnect功能
* Room Title超长处理 max-width:25vw;max-height:40px

### 2018.11.29
* 文件下载link添加target="_blank", 避免在nchat窗口直接打开
* 修复edge 浏览器无法显示表情(replace_em 中正则表达式问题)
* 页面资源加载和性能优化
* 修复：非standalone的Room iconurl的外部引用会受到外部平台是否登录的影响 
* 增加统计信息推送

### 2018.11.30 
* 新增markdown/流程图 消息的编辑和显示


### 2018.12.01
* 向上滚动加载历史消息功能 
* Plugin 模式统一为引入一个js模式，简化使用；并且支持iframe内嵌显示， 并在npoint应用

### 2018.12.02
* input 改为 textarea
* confluence & jira 改为新的plugin模式
* plugin模式优化和完善
* 加入启动画面

### Backlog
* 房间支持Private/Public
* @功能强化： 输入@加载用户选择List, 并自动发送邮件通知被@用户，有人@他
* 应答知识库
* edge 浏览器循环加载
* http://10.16.78.88:8008/ 粘贴复制（Jay建议）
