import { AIModelConfig } from './openai-service';

export interface SavedModelConfig extends AIModelConfig {
  id: string;
  name: string;
}

const STORAGE_KEY = 'ai-model-configs';
const DEFAULT_V_CHAT_ID = 'default-v-chat';
const DEFAULT_V_CHAT_V4_ID = 'default-v-chat-v4';
const DEFAULT_V_REASONING_ID = 'default-v-reasoning';

// Lấy tất cả cấu hình model từ localStorage
export function getSavedModelConfigs(): SavedModelConfig[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const configs = JSON.parse(saved);
      // Nếu không có cấu hình nào, tạo các cấu hình mặc định
      if (configs.length === 0) {
        return [
          createDefaultVChatConfig(),
          createDefaultVChatV4Config(),
          createDefaultVReasoningConfig()
        ];
      }
      
      // Đảm bảo các model mặc định luôn tồn tại
      let updated = false;
      if (!configs.some((c: SavedModelConfig) => c.id === DEFAULT_V_CHAT_ID)) {
        configs.push(createDefaultVChatConfig());
        updated = true;
      }
      if (!configs.some((c: SavedModelConfig) => c.id === DEFAULT_V_CHAT_V4_ID)) {
        configs.push(createDefaultVChatV4Config());
        updated = true;
      }
      if (!configs.some((c: SavedModelConfig) => c.id === DEFAULT_V_REASONING_ID)) {
        configs.push(createDefaultVReasoningConfig());
        updated = true;
      }
      
      if (updated) {
        saveModelConfigs(configs);
      }
      
      return configs;
    }
  } catch (error) {
    console.error('Failed to load model configs:', error);
  }
  // Nếu không có dữ liệu hoặc có lỗi, trả về các cấu hình mặc định
  return [
    createDefaultVChatConfig(),
    createDefaultVChatV4Config(),
    createDefaultVReasoningConfig()
  ];
}

// Tạo cấu hình v_chat mặc định
export function createDefaultVChatConfig(): SavedModelConfig {
  return {
    id: DEFAULT_V_CHAT_ID,
    name: 'VNPAY v_chat',
    type: 'custom',
    apiKey: '',
    model: 'v_chat',
    endpoint: 'https://genai.vnpay.vn/aigateway/llm/v1/chat/completions'
  };
}

// Tạo cấu hình v_chat_v4 mặc định
export function createDefaultVChatV4Config(): SavedModelConfig {
  return {
    id: DEFAULT_V_CHAT_V4_ID,
    name: 'VNPAY v_chatv4',
    type: 'custom',
    apiKey: '',
    model: 'v_chatv4',
    endpoint: 'https://genai.vnpay.vn/aigateway/llm_v4/v1/chat/completions'
  };
}

// Tạo cấu hình v_reasoning mặc định
export function createDefaultVReasoningConfig(): SavedModelConfig {
  return {
    id: DEFAULT_V_REASONING_ID,
    name: 'VNPAY v_reasoning',
    type: 'custom',
    apiKey: '',
    model: 'v_reasoning',
    endpoint: 'https://genai.vnpay.vn/aigateway/llm_reasoning/v1'
  };
}

// Lưu danh sách cấu hình model vào localStorage
export function saveModelConfigs(configs: SavedModelConfig[]): void {
  try {
    // Đảm bảo luôn có các cấu hình mặc định
    if (configs.length === 0 || !configs.some(c => c.id === DEFAULT_V_CHAT_ID)) {
      configs.push(createDefaultVChatConfig());
    }
    if (!configs.some(c => c.id === DEFAULT_V_CHAT_V4_ID)) {
      configs.push(createDefaultVChatV4Config());
    }
    if (!configs.some(c => c.id === DEFAULT_V_REASONING_ID)) {
      configs.push(createDefaultVReasoningConfig());
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  } catch (error) {
    console.error('Failed to save model configs:', error);
  }
}

// Thêm hoặc cập nhật một cấu hình model
export function addOrUpdateModelConfig(config: SavedModelConfig): void {
  const configs = getSavedModelConfigs();
  const index = configs.findIndex(c => c.id === config.id);
  
  if (index >= 0) {
    configs[index] = config;
  } else {
    configs.push(config);
  }
  
  saveModelConfigs(configs);
}

// Xóa một cấu hình model
export function deleteModelConfig(id: string): void {
  // Không cho phép xóa các cấu hình mặc định
  if (id === DEFAULT_V_CHAT_ID || id === DEFAULT_V_CHAT_V4_ID || id === DEFAULT_V_REASONING_ID) {
    console.warn('Cannot delete default model configurations');
    return;
  }
  
  const configs = getSavedModelConfigs();
  const filteredConfigs = configs.filter(c => c.id !== id);
  saveModelConfigs(filteredConfigs);
}

// Lấy một cấu hình model theo ID
export function getModelConfigById(id: string): SavedModelConfig | undefined {
  const configs = getSavedModelConfigs();
  return configs.find(c => c.id === id);
}

// Lấy cấu hình mặc định
export function getDefaultModelConfig(): SavedModelConfig {
  const configs = getSavedModelConfigs();
  // Tìm cấu hình mặc định
  const defaultConfig = configs.find(c => c.id === DEFAULT_V_CHAT_ID);
  if (defaultConfig) {
    return defaultConfig;
  }
  // Nếu không tìm thấy, tạo mới
  const newDefault = createDefaultVChatConfig();
  addOrUpdateModelConfig(newDefault);
  return newDefault;
}

// Kiểm tra xem một cấu hình có đầy đủ thông tin để sử dụng không (có API key)
export function isModelConfigUsable(config: SavedModelConfig): boolean {
  return !!config.apiKey;
}

// Tạo ID ngẫu nhiên cho cấu hình mới
export function generateConfigId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
} 