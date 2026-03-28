# Tasks

- [x] Task 1: 初始化项目结构
  - [x] SubTask 1.1: 使用 obsidian-plugin-generator 创建基础项目
  - [x] SubTask 1.2: 安装 Vue 3 及相关依赖
  - [x] SubTask 1.3: 配置 TypeScript 和构建工具以支持 Vue 3

- [x] Task 2: 实现核心时间戳功能
  - [x] SubTask 2.1: 创建时间格式化工具函数
  - [x] SubTask 2.2: 实现编辑器回车键监听器
  - [x] SubTask 2.3: 实现时间戳自动插入逻辑

- [x] Task 3: 实现设置页面（Vue 3 setup 语法糖）
  - [x] SubTask 3.1: 创建 Vue 设置组件 SettingTab.vue
  - [x] SubTask 3.2: 实现时间格式输入设置
  - [x] SubTask 3.3: 实现渲染开关设置
  - [x] SubTask 3.4: 挂载 Vue 组件到 Obsidian 设置页

- [x] Task 4: 实现渲染控制功能
  - [x] SubTask 4.1: 创建 Markdown 后处理器
  - [x] SubTask 4.2: 根据设置开关控制时间戳的显示/隐藏

- [x] Task 5: 测试与验证
  - [x] SubTask 5.1: 测试时间戳插入功能
  - [x] SubTask 5.2: 测试设置页面功能
  - [x] SubTask 5.3: 测试渲染开关功能

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1]
- [Task 4] depends on [Task 2, Task 3]
- [Task 5] depends on [Task 2, Task 3, Task 4]
