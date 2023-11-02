# midjourney-proxy-admin
[midjourney-proxy-plus](https://github.com/litter-coder/midjourney-proxy-plus) 的管理后台

# 主要功能

- [x] 支持MJ账号的增删改查功能
- [x] 支持MJ账号的详细信息查询和账号同步操作
- [x] 支持MJ账号的并发队列设置
- [x] 支持MJ的账号settings设置
- [x] 支持MJ的任务查询
- [x] 提供功能齐全的绘图测试页面

# 后续计划

- [ ] 任务查询功能优化
- [ ] 支持MJ的队列内容查询

# 使用示例

①登录页

<img src="https://raw.githubusercontent.com/litter-coder/midjourney-proxy-admin/main/docs/login.png" alt="登录页"/>

②欢迎页

<img src="https://raw.githubusercontent.com/litter-coder/midjourney-proxy-admin/main/docs/welcome.png" alt="欢迎页"/>

③账号管理

<img src="https://raw.githubusercontent.com/litter-coder/midjourney-proxy-admin/main/docs/account.png" alt="账号管理"/>

④添加账号

<img src="https://raw.githubusercontent.com/litter-coder/midjourney-proxy-admin/main/docs/account_add.png" alt="添加账号"/>

⑤账号详情

<img src="https://raw.githubusercontent.com/litter-coder/midjourney-proxy-admin/main/docs/account_info.png" alt="账号详情"/>

⑥任务列表

<img src="https://raw.githubusercontent.com/litter-coder/midjourney-proxy-admin/main/docs/task.png" alt="任务列表"/>

7 任务详情

<img src="https://raw.githubusercontent.com/litter-coder/midjourney-proxy-admin/main/docs/task_info.png" alt="任务列表"/>

# 部署方式

## 1.运行环境

支持 Linux、MacOS、Windows 系统（可在Linux服务器上长期运行)，同时需安装 `node18`。

**(1) 克隆项目代码：**

```bash
git clone https://github.com/litter-coder/midjourney-proxy-admin
cd midjourney-proxy-admin/
```

**(2) 安装依赖 ：**

```bash
npm install
```

## 2.配置

配置文件在根目录的`.env`中：

```shell
# MJ-SERVER
MJ_SERVER=http://127.0.0.1:8080
```

## 3.运行

使用nohup命令在后台运行程序：

```
nohup npm run start > out.log 2>&1 & disown
# 在后台运行程序
```

## 4.其他

### 1.查看进程

```shell
ps -ef | grep npm
```

### 2.结束进程

```sh
kill -9 [进程id]
```

# 联系我们

问题咨询和商务合作可联系

 <img src="https://raw.githubusercontent.com/litter-coder/midjourney-proxy-plus/main/docs/manager-qrcode.jpeg" width="240" alt="微信二维码"/>

