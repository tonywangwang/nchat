# N-Chat
**N-Chat is NOT only CHAT**
* 专为工程师开发的在线实时交流平台
* 随叫随到的工作助理
* 机器人功能开放平台
* 快速接入第三方平台应用

## 程序运行

```
npm install
```

```
node index
```

http://localhost


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

### 2018.12.03
* 对话自动互译功能

### 2018.12.12
* 机器人开放平台上线

### Backlog
* Room/User存储
* 机器人管理：支持使用房间配置
* 房间支持Private/Public
* @功能强化： 输入@加载用户选择List, 并自动发送邮件通知被@用户，有人@他
* edge 浏览器循环加载
* http://10.16.78.88:8008/ 粘贴复制（Jay建议）
