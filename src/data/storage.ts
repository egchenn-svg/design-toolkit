export interface CustomTool {
  id: string;
  name: string;
  url: string;
  icon: string;
  mode: 'iframe' | 'jump';
  description?: string;
}

const STORAGE_KEY = 'design-toolkit-my-tools';

export function getCustomTools(): CustomTool[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomTools(tools: CustomTool[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tools));
}

export function addTool(tool: Omit<CustomTool, 'id'>): CustomTool {
  const tools = getCustomTools();
  const newTool: CustomTool = { ...tool, id: Date.now().toString() };
  tools.push(newTool);
  saveCustomTools(tools);
  return newTool;
}

export function removeTool(id: string): void {
  const tools = getCustomTools().filter(t => t.id !== id);
  saveCustomTools(tools);
}

const API_KEY_STORAGE = 'design-toolkit-api-keys';

export interface ApiKeys {
  removebg?: string;
  tinypng?: string;
}

export function getApiKeys(): ApiKeys {
  try {
    const raw = localStorage.getItem(API_KEY_STORAGE);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveApiKeys(keys: ApiKeys): void {
  localStorage.setItem(API_KEY_STORAGE, JSON.stringify(keys));
}
