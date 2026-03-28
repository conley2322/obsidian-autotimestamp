<script setup lang="ts">
import { ref, watch, computed } from 'vue';

interface Settings {
  timeFormat: string;
  timestampStyle: string;
  timestampStart: string;
  timestampEnd: string;
  fileNamePattern: string;
  folderPattern: string;
}

const props = defineProps<{
  settings: Settings;
  onSave: (settings: Settings) => Promise<void>;
}>();

const timeFormat = ref(props.settings.timeFormat);
const timestampStyle = ref(props.settings.timestampStyle);
const timestampStart = ref(props.settings.timestampStart);
const timestampEnd = ref(props.settings.timestampEnd);
const fileNamePattern = ref(props.settings.fileNamePattern || '');
const folderPattern = ref(props.settings.folderPattern || '');

const styleOptions = [
  { value: 'brackets', label: '方括号 [时间]', example: ' [2026-03-26 13:55:41]' },
  { value: 'comment', label: '注释 %%时间%% (渲染隐藏)', example: ' %%2026-03-26 13:55:41%%' },
  { value: 'parentheses', label: '圆括号 (时间)', example: ' (2026-03-26 13:55:41)' },
  { value: 'angle', label: '尖括号 <时间>', example: ' <2026-03-26 13:55:41>' },
  { value: 'custom', label: '自定义', example: '' }
];

const isCustom = computed(() => timestampStyle.value === 'custom');

const formatPreview = () => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  const replacements: Record<string, string> = {
    'YYYY': now.getFullYear().toString(),
    'MM': pad(now.getMonth() + 1),
    'DD': pad(now.getDate()),
    'HH': pad(now.getHours()),
    'mm': pad(now.getMinutes()),
    'ss': pad(now.getSeconds())
  };

  let result = timeFormat.value;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(key, 'g'), value);
  }
  return result;
};

const getTimestampPreview = () => {
  const time = formatPreview();
  if (timestampStyle.value === 'custom') {
    return `${timestampStart.value}${time}${timestampEnd.value}`;
  }
  const option = styleOptions.find(o => o.value === timestampStyle.value);
  return option ? option.example.replace(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/, time) : ` [${time}]`;
};

const saveSettings = async () => {
  await props.onSave({
    timeFormat: timeFormat.value,
    timestampStyle: timestampStyle.value,
    timestampStart: timestampStart.value,
    timestampEnd: timestampEnd.value,
    fileNamePattern: fileNamePattern.value,
    folderPattern: folderPattern.value
  });
};

watch([timeFormat, timestampStyle, timestampStart, timestampEnd, fileNamePattern, folderPattern], saveSettings);
</script>

<template>
  <div class="settings-container">
    <h2>回车时间戳设置</h2>
    
    <div class="setting-item">
      <div class="setting-item-info">
        <div class="setting-item-name">时间格式</div>
        <div class="setting-item-description">
          支持：YYYY（年）、MM（月）、DD（日）、HH（时）、mm（分）、ss（秒）
        </div>
      </div>
      <div class="setting-item-control">
        <input 
          type="text" 
          v-model="timeFormat" 
          placeholder="YYYY-MM-DD HH:mm:ss"
          class="text-input"
        />
      </div>
    </div>
    
    <div class="setting-item">
      <div class="setting-item-info">
        <div class="setting-item-name">格式预览</div>
        <div class="setting-item-description preview">
          {{ formatPreview() }}
        </div>
      </div>
    </div>

    <div class="setting-item">
      <div class="setting-item-info">
        <div class="setting-item-name">时间戳样式</div>
        <div class="setting-item-description">
          选择时间戳的包裹格式
        </div>
      </div>
      <div class="setting-item-control">
        <select v-model="timestampStyle" class="select-input">
          <option v-for="opt in styleOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="isCustom" class="setting-item">
      <div class="setting-item-info">
        <div class="setting-item-name">自定义包裹符号</div>
        <div class="setting-item-description">
          设置时间戳的开始和结束符号
        </div>
      </div>
      <div class="setting-item-control custom-inputs">
        <input 
          type="text" 
          v-model="timestampStart" 
          placeholder="开始符号"
          class="text-input small"
        />
        <span class="separator">时间</span>
        <input 
          type="text" 
          v-model="timestampEnd" 
          placeholder="结束符号"
          class="text-input small"
        />
      </div>
    </div>

    <div class="setting-item">
      <div class="setting-item-info">
        <div class="setting-item-name">完整预览</div>
        <div class="setting-item-description preview">
          你好这是一段文字{{ getTimestampPreview() }}
        </div>
      </div>
    </div>

    <h3 class="section-title">文件范围设置</h3>

    <div class="setting-item">
      <div class="setting-item-info">
        <div class="setting-item-name">文件夹匹配模式</div>
        <div class="setting-item-description">
          支持通配符：* 匹配任意字符，? 匹配单个字符。留空表示所有文件夹。<br />
          支持多模式：用顿号、逗号或竖线分隔。<br />
          <strong>示例：</strong><br />
          • <code>/</code> = 所有文件<br />
          • <code>Notes</code> = Notes 文件夹及其所有子文件夹<br />
          • <code>Notes/Diary</code> = Notes/Diary 文件夹及其子文件夹<br />
          • <code>Notes/my*</code> = 通配符匹配
        </div>
      </div>
      <div class="setting-item-control">
        <textarea 
          v-model="folderPattern" 
          placeholder="例如：Notes、Notes/个人笔记、Notes/my*"
          class="text-input large"
          rows="4"
        />
      </div>
    </div>

    <div class="setting-item">
      <div class="setting-item-info">
        <div class="setting-item-name">文件名匹配模式</div>
        <div class="setting-item-description">
          支持通配符：* 匹配任意字符，? 匹配单个字符。留空表示全部文件。
          <br />支持多模式：用顿号、逗号或竖线分隔，如：G*、8* 或 *.md, diary-*
          <br />示例：G*、8* 表示匹配以G或8开头的文件
        </div>
      </div>
      <div class="setting-item-control">
        <input 
          type="text" 
          v-model="fileNamePattern" 
          placeholder="例如：*.md 或 diary-*"
          class="text-input"
        />
      </div>
    </div>

    <div class="setting-item tip">
      <div class="setting-item-info">
        <div class="setting-item-name">💡 使用说明</div>
        <div class="setting-item-description">
          <p><strong>文件夹模式 + 文件名模式：</strong>满足任一条件就会启用（OR 关系）</p>
          <p>• 例如：文件夹 = <code>Notes、公司</code>，文件名 = <code>G*</code></p>
          <p>  → Notes/G08.md ✅（文件夹对）</p>
          <p>  → 公司/G09.md ✅（文件夹对）</p>
          <p>  → Notes/笔记.md ✅（文件夹对）</p>
          <p>  → 其他/G01.md ✅（文件名对）</p>
          <p>  → 其他/个人.md ❌（都不对）</p>
          <p>• 选择「注释 %%时间%%」样式时，Obsidian 原生会隐藏 %% 包裹的内容</p>
        </div>
      </div>
    </div>

    <div class="setting-item author-info">
      <div class="setting-item-info">
        <div class="setting-item-name">作者</div>
        <div class="setting-item-description">
          Conley
        </div>
      </div>
      <div class="setting-item-info">
        <div class="setting-item-name">邮箱</div>
        <div class="setting-item-description">
          2322903411@qq.com
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-container {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: var(--text-normal);
}

h3.section-title {
  margin: 24px 0 16px 0;
  padding-top: 16px;
  border-top: 1px solid var(--background-modifier-border);
  color: var(--text-normal);
  font-size: 1.1em;
}

.setting-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid var(--background-modifier-border);
}

.setting-item.tip {
  background: var(--background-secondary);
  border-radius: 8px;
  padding: 12px;
  margin-top: 20px;
  border-bottom: none;
}

.setting-item-info {
  flex: 1;
  margin-right: 20px;
}

.setting-item-name {
  font-weight: 600;
  color: var(--text-normal);
  margin-bottom: 4px;
}

.setting-item-description {
  font-size: 0.9em;
  color: var(--text-muted);
  line-height: 1.5;
}

.setting-item-description.preview {
  font-family: monospace;
  background: var(--background-secondary);
  padding: 4px 8px;
  border-radius: 4px;
  color: var(--text-accent);
}

.setting-item-control {
  flex: 0 0 auto;
}

.text-input {
  width: 200px;
  padding: 6px 12px;
  border: 1px solid var(--background-modifier-border);
  border-radius: 4px;
  background: var(--background-primary);
  color: var(--text-normal);
  font-size: 14px;
}

.text-input.large {
  width: 300px;
  resize: vertical;
  min-height: 80px;
  font-family: monospace;
}

.text-input.small {
  width: 80px;
  text-align: center;
}

.text-input:focus {
  outline: none;
  border-color: var(--interactive-accent);
}

.select-input {
  width: 220px;
  padding: 6px 12px;
  border: 1px solid var(--background-modifier-border);
  border-radius: 4px;
  background: var(--background-primary);
  color: var(--text-normal);
  font-size: 14px;
  cursor: pointer;
}

.select-input:focus {
  outline: none;
  border-color: var(--interactive-accent);
}

.custom-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.separator {
  color: var(--text-muted);
  font-size: 0.9em;
}
</style>
