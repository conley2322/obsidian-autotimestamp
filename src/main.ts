import { App, Plugin, PluginSettingTab } from 'obsidian';
import { createApp, type App as VueApp } from 'vue';
import { keymap, ViewPlugin, Decoration, EditorView, WidgetType } from '@codemirror/view';
import { Extension, RangeSetBuilder, Prec } from '@codemirror/state';
import SettingTabComponent from './SettingTab.vue';

interface EnterTimestampSettings {
  timeFormat: string;
  timestampStyle: string;
  timestampStart: string;
  timestampEnd: string;
  fileNamePattern: string;
  folderPattern: string;
}

const TIMESTAMP_STYLES: Record<string, { start: string; end: string }> = {
  'brackets': { start: ' [', end: ']' },
  'comment': { start: ' %%', end: '%%' },
  'parentheses': { start: ' (', end: ')' },
  'angle': { start: ' <', end: '>' },
  'custom': { start: '', end: '' }
};

const DEFAULT_SETTINGS: EnterTimestampSettings = {
  timeFormat: 'YYYY-MM-DD HH:mm:ss',
  timestampStyle: 'brackets',
  timestampStart: ' [',
  timestampEnd: ']',
  fileNamePattern: '',
  folderPattern: ''
};

class TimestampWidget extends WidgetType {
  constructor(private text: string) {
    super();
  }
  
  toDOM() {
    const span = document.createElement('span');
    span.style.color = 'var(--text-muted)';
    span.style.opacity = '0.6';
    span.style.fontSize = '0.85em';
    span.textContent = this.text;
    return span;
  }
}

export default class EnterTimestampPlugin extends Plugin {
  settings: EnterTimestampSettings;

  async onload() {
    await this.loadSettings();
    this.registerEditorExtension(this.createTimestampPreviewExtension());
    this.registerEditorExtension(this.createEnterExtension());
    this.addSettingTab(new EnterTimestampSettingTab(this.app, this));
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  isFileEnabled(filePath: string | undefined): boolean {
    if (!filePath) return false;
    
    console.log('=== [Enter Timestamp] isFileEnabled Start ===');
    console.log(`File path: ${filePath}`);
    console.log(`Folder pattern: "${this.settings.folderPattern}"`);
    console.log(`File name pattern: "${this.settings.fileNamePattern}"`);
    
    const hasFolderPattern = this.settings.folderPattern && this.settings.folderPattern.trim() !== '';
    const hasFileNamePattern = this.settings.fileNamePattern && this.settings.fileNamePattern.trim() !== '';
    
    if (!hasFolderPattern && !hasFileNamePattern) {
      console.log('✅ No patterns set, all files enabled');
      console.log('=== [Enter Timestamp] isFileEnabled End ===');
      return true;
    }
    
    const folderEnabled = hasFolderPattern ? this.checkFolder(filePath) : false;
    const fileNameEnabled = hasFileNamePattern ? this.checkFileName(filePath) : false;
    
    console.log(`Folder enabled: ${folderEnabled}`);
    console.log(`File name enabled: ${fileNameEnabled}`);
    
    const result = folderEnabled || fileNameEnabled;
    
    if (result) {
      console.log('✅ At least one pattern matched');
    } else {
      console.log('❌ No patterns matched');
    }
    
    console.log('=== [Enter Timestamp] isFileEnabled End ===');
    return result;
  }

  private checkFolder(filePath: string): boolean {
    if (!this.settings.folderPattern || this.settings.folderPattern.trim() === '') {
      console.log('[Enter Timestamp] No folder pattern, skipping folder check');
      return true;
    }

    const lastSlashIndex = filePath.lastIndexOf('/');
    const parentPath = lastSlashIndex === -1 ? '/' : filePath.substring(0, lastSlashIndex);
    console.log(`[Enter Timestamp] Checking folder for file: ${filePath}, parent: ${parentPath}`);
    
    const patternStr = this.settings.folderPattern.trim();
    const patterns = patternStr.split(/[、,|]/).map(p => p.trim()).filter(p => p.length > 0);
    
    for (const pattern of patterns) {
      if (pattern === '/' || pattern === '') {
        console.log(`[Enter Timestamp] Matched root folder pattern`);
        return true;
      }
      
      if (this.matchPattern(parentPath, pattern)) {
        console.log(`[Enter Timestamp] Matched folder pattern: "${pattern}", Path: "${parentPath}"`);
        return true;
      }
      
      const patternWithSlash = pattern + '/';
      if (parentPath === pattern || parentPath.startsWith(patternWithSlash)) {
        console.log(`[Enter Timestamp] Matched folder (with children): "${pattern}", Path: "${parentPath}"`);
        return true;
      }
    }
    
    console.log(`[Enter Timestamp] No folder pattern matched. Patterns: [${patterns.join(', ')}]`);
    return false;
  }

  private checkFileName(filePath: string): boolean {
    if (!this.settings.fileNamePattern || this.settings.fileNamePattern.trim() === '') {
      return true;
    }

    const fileName = filePath.split('/').pop() || '';
    const patternStr = this.settings.fileNamePattern.trim();
    
    const patterns = patternStr.split(/[、,|]/).map(p => p.trim()).filter(p => p.length > 0);
    
    for (const pattern of patterns) {
      if (this.matchPattern(fileName, pattern)) {
        console.log(`[Enter Timestamp] Matched! Pattern: "${pattern}", File: "${fileName}"`);
        return true;
      }
    }
    
    console.log(`[Enter Timestamp] No match. Patterns: [${patterns.join(', ')}], File: "${fileName}"`);
    return false;
  }

  private matchPattern(fileName: string, pattern: string): boolean {
    let regexStr = '';
    for (let i = 0; i < pattern.length; i++) {
      const char = pattern[i];
      if (char === '*') {
        regexStr += '.*';
      } else if (char === '?') {
        regexStr += '.';
      } else if ('.+^${}()|[]\\'.includes(char)) {
        regexStr += '\\' + char;
      } else {
        regexStr += char;
      }
    }
    
    try {
      const regex = new RegExp(`^${regexStr}$`, 'i');
      return regex.test(fileName);
    } catch (e) {
      console.error('[Enter Timestamp] Regex error:', e);
      return false;
    }
  }

  getTimestampWrapper(): { start: string; end: string } {
    if (this.settings.timestampStyle === 'custom') {
      return { start: this.settings.timestampStart, end: this.settings.timestampEnd };
    }
    return TIMESTAMP_STYLES[this.settings.timestampStyle] || { start: ' [', end: ']' };
  }

  getTimestampRegex(): RegExp {
    const wrapper = this.getTimestampWrapper();
    const start = wrapper.start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const end = wrapper.end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`${start}\\d{4}-\\d{2}-\\d{2}[^\n]*?${end}$`);
  }

  private createTimestampPreviewExtension(): Extension {
    const plugin = this;
    
    return ViewPlugin.fromClass(class {
      decorations: any;
      
      constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view);
      }
      
      update(view: EditorView) {
        this.decorations = this.buildDecorations(view);
      }
      
      buildDecorations(view: EditorView) {
        const builder = new RangeSetBuilder<any>();
        const state = view.state;
        const selection = state.selection.main;
        
        try {
          const activeFile = plugin.app.workspace.getActiveFile();
          if (!activeFile || !plugin.isFileEnabled(activeFile.path)) {
            return builder.finish();
          }

          if (selection.empty) {
            const line = state.doc.lineAt(selection.head);
            const lineContent = line.text;
            
            if (lineContent.trim().length > 0) {
              const timestampRegex = plugin.getTimestampRegex();
              if (!timestampRegex.test(lineContent)) {
                const now = new Date();
                const formattedTime = plugin.formatTime(now, plugin.settings.timeFormat);
                const wrapper = plugin.getTimestampWrapper();
                const timestampPreview = `${wrapper.start}${formattedTime}${wrapper.end}`;
                
                const decoration = Decoration.widget({
                  widget: new TimestampWidget(timestampPreview),
                  side: 1
                });
                
                builder.add(line.to, line.to, decoration);
              }
            }
          }
        } catch (e) {
          console.error('Timestamp preview error:', e);
        }
        
        return builder.finish();
      }
    }, {
      decorations: (v: any) => v.decorations
    });
  }

  private createEnterExtension() {
    const plugin = this;
    
    return Prec.highest(keymap.of([
      {
        key: 'Enter',
        run: (view) => {
          const activeFile = plugin.app.workspace.getActiveFile();
          if (!activeFile || !plugin.isFileEnabled(activeFile.path)) {
            return false;
          }

          const state = view.state;
          const selection = state.selection.main;
          const line = state.doc.lineAt(selection.head);
          const lineContent = line.text;
          
          if (lineContent.trim().length === 0) {
            return false;
          }

          const timestampRegex = plugin.getTimestampRegex();
          if (timestampRegex.test(lineContent)) {
            return false;
          }

          const now = new Date();
          const formattedTime = plugin.formatTime(now, plugin.settings.timeFormat);
          const wrapper = plugin.getTimestampWrapper();
          const timestampText = `${wrapper.start}${formattedTime}${wrapper.end}`;
          
          const insertText = timestampText + '\n';
          const newLineStart = line.to + insertText.length;
          
          view.dispatch({
            changes: {
              from: line.to,
              to: line.to,
              insert: insertText
            },
            selection: {
              anchor: newLineStart
            }
          });
          
          return true;
        }
      }
    ]));
  }

  formatTime(date: Date, format: string): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    
    const replacements: Record<string, string> = {
      'YYYY': date.getFullYear().toString(),
      'MM': pad(date.getMonth() + 1),
      'DD': pad(date.getDate()),
      'HH': pad(date.getHours()),
      'mm': pad(date.getMinutes()),
      'ss': pad(date.getSeconds())
    };

    let result = format;
    for (const [key, value] of Object.entries(replacements)) {
      result = result.replace(new RegExp(key, 'g'), value);
    }
    return result;
  }
}

class EnterTimestampSettingTab extends PluginSettingTab {
  plugin: EnterTimestampPlugin;
  private vueApp: VueApp;

  constructor(app: App, plugin: EnterTimestampPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    const div = containerEl.createDiv();
    this.vueApp = createApp(SettingTabComponent, {
      settings: this.plugin.settings,
      onSave: async (newSettings: EnterTimestampSettings) => {
        this.plugin.settings = newSettings;
        await this.plugin.saveSettings();
      }
    });
    this.vueApp.mount(div);
  }

  hide(): void {
    if (this.vueApp) {
      this.vueApp.unmount();
    }
  }
}
