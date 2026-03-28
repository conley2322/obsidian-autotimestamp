# 文件/文件夹范围过滤功能计划

## 需求

用户可以自定义插件生效的范围：

1. 指定文件夹 - 插件只在选定的文件夹中生效
2. 指定文件名匹配 - 只有符合文件名规则的文件才生效

## 实现步骤

### 1. 扩展设置接口

在 `EnterTimestampSettings` 中添加：

* `enabledFolders: string[]` - 启用的文件夹列表（空数组表示全部启用）

* `fileNamePattern: string` - 文件名匹配模式（支持通配符，如 `*.md`、`diary-*`）

### 2. 修改 main.ts

* 添加 `isFileEnabled()` 方法检查当前文件是否符合条件

* 在 `createTimestampPreviewExtension()` 中添加文件检查

* 在 `createEnterExtension()` 中添加文件检查

* 在 `processTimestamps()` 中添加文件检查

### 3. 修改 SettingTab.vue

* 添加文件夹选择下拉框（多选）

* 获取 vault 中所有文件夹列表

* 添加文件名匹配模式输入框

* 显示当前匹配状态

### 4. 文件检查逻辑

```
检查顺序：
1. 如果 enabledFolders 为空 → 所有文件夹启用
2. 如果 enabledFolders 不为空 → 检查当前文件路径是否在选定文件夹中
3. 如果 fileNamePattern 为空 → 所有文件名匹配
4. 如果 fileNamePattern 不为空 → 检查文件名是否匹配模式
```

## 代码修改清单

### main.ts

* [ ] 扩展 `EnterTimestampSettings` 接口

* [ ] 更新 `DEFAULT_SETTINGS`

* [ ] 添加 `isFileEnabled()` 方法

* [ ] 修改 `createTimestampPreviewExtension()` 添加文件检查

* [ ] 修改 `createEnterExtension()` 添加文件检查

* [ ] 修改 `processTimestamps()` 添加文件检查

### SettingTab.vue

* [ ] 添加文件夹选择 UI

* [ ] 添加文件名匹配模式输入

* [ ] 获取 vault 文件夹列表

* [ ] 实现多选文件夹功能

