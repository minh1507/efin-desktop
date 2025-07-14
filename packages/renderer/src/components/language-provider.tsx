import { createContext, useContext, useEffect, useState } from "react";
import { getSetting, saveSetting } from "@/services/database";

// Available languages
export type Language = "vi" | "en";

// Translation dictionaries
const translations: Record<Language, Record<string, string>> = {
  vi: {
    // Common
    "app.settings": "Cài đặt",
    "app.language": "Ngôn ngữ",
    "app.theme": "Giao diện",
    "app.save": "Lưu",
    "app.cancel": "Hủy",
    "app.reset": "Đặt lại",
    "app.active": "Đang hoạt động",
    "app.my_account": "Tài khoản của tôi",
    "app.profile": "Thông tin cá nhân",
    "app.security": "Bảo mật",
    "app.logout": "Đăng xuất",
    "app.search": "Tìm kiếm",
    "app.view_shortcuts": "Xem phím tắt",
    "app.open_menu": "Mở menu",
    
    // Languages
    "language.vi": "Tiếng Việt",
    "language.en": "Tiếng Anh",
    
    // Themes
    "theme.dark": "Tối",
    "theme.light": "Sáng",
    "theme.blue": "Xanh Dương",
    "theme.green": "Xanh Lá",
    
    // Settings
    "settings.title": "Cài đặt",
    "settings.language": "Ngôn ngữ",
    "settings.theme": "Giao diện",
    "settings.saved": "Đã lưu cài đặt",
    
    // Home
    "home.title": "Chào mừng trở lại!",
    "home.subtitle": "Khám phá những công cụ mạnh mẽ và tiện ích để giúp bạn làm việc hiệu quả hơn.",
    "home.popular_tools": "Công cụ phổ biến",
    "home.view_all": "Xem tất cả",
    "home.json_formatter_description": "Format và kiểm tra cú pháp JSON",
    "home.json_formatter_content": "Định dạng, tìm lỗi và làm đẹp code JSON một cách nhanh chóng",
    "home.json_comparison_description": "So sánh hai đối tượng JSON",
    "home.json_comparison_content": "Dễ dàng so sánh và tìm sự khác biệt giữa hai đối tượng JSON",
    "home.settings_description": "Tùy chỉnh ứng dụng",
    "home.settings_content": "Thay đổi giao diện, bảo mật và các tùy chọn khác",
    "home.statistics_description": "Xem thống kê sử dụng", 
    "home.statistics_content": "Theo dõi thời gian và tần suất sử dụng các công cụ",
    "home.open_tool": "Mở công cụ",
    "home.open_settings": "Mở cài đặt",
    "home.view_statistics": "Xem thống kê",
    "home.recent_activities": "Hoạt động gần đây",
    "home.activity_history": "Lịch sử hoạt động",
    "home.recent_activities_description": "Các hoạt động được thực hiện gần đây",
    "home.time_10min_ago": "10 phút trước",
    "home.time_2hours_ago": "2 giờ trước",
    "home.time_1day_ago": "1 ngày trước",
    "home.format_code": "Format code",
    "home.usage_statistics": "Thống kê sử dụng",
    "home.you_used": "Bạn đã sử dụng",
    "home.featured_features": "Tính năng nổi bật",
    "home.high_performance": "Hiệu suất cao",
    "home.high_performance_description": "Ứng dụng được tối ưu hóa để chạy nhanh và mượt mà ngay cả với dữ liệu lớn",
    "home.save_history": "Lưu lịch sử",
    "home.save_history_description": "Tự động lưu lịch sử các thao tác để dễ dàng truy cập lại sau này",
    "home.multiple_formats": "Hỗ trợ nhiều định dạng",
    "home.multiple_formats_description": "Hỗ trợ nhiều định dạng dữ liệu phổ biến như JSON, XML, CSV và nhiều hơn nữa",
    "home.high_customization": "Tùy biến cao",
    "home.high_customization_description": "Dễ dàng tùy chỉnh giao diện và chức năng theo nhu cầu cá nhân",
    
    // JSON Formatter
    "json.original_json": "JSON gốc",
    "json.formatted_json": "JSON đã định dạng",
    "json.enter_json_to_format": "Nhập JSON cần định dạng...",
    "json.invalid_format": "Sai định dạng",
    "json.copied_to_clipboard": "Đã sao chép vào clipboard",
    "json.search_in_formatted_json": "Tìm trong JSON đã định dạng...",
    
    // JSON Compare
    "json_compare.left_json": "JSON bên trái",
    "json_compare.right_json": "JSON bên phải",
    "json_compare.enter_left_json": "Nhập JSON thứ nhất...",
    "json_compare.enter_right_json": "Nhập JSON thứ hai...",
    "json_compare.invalid_left_json": "Sai định dạng JSON bên trái",
    "json_compare.invalid_right_json": "Sai định dạng JSON bên phải",
    "json_compare.comparison_error": "Lỗi khi so sánh",
    "json_compare.unknown_error": "Lỗi không xác định",
    "json_compare.error_during_comparison": "Lỗi khi so sánh",
    "json_compare.copied_to_clipboard": "Đã sao chép vào clipboard",
    "json_compare.comparison_result": "Kết quả so sánh",
    "json_compare.missing_in_left": "Thiếu ở bên trái",
    "json_compare.missing_in_right": "Thiếu ở bên phải",
    "json_compare.copy_to_left": "Sao chép sang trái",
    "json_compare.copy_to_right": "Sao chép sang phải",
    "json_compare.copy_all_missing_to_left": "Sao chép tất cả sang trái",
    "json_compare.copy_all_missing_to_right": "Sao chép tất cả sang phải",
    "json_compare.expand_all": "Mở rộng tất cả",
    "json_compare.collapse_all": "Thu gọn tất cả",
    
    // Sidebar
    "sidebar.home": "Trang chủ",
    "sidebar.tools": "Công cụ",
    "sidebar.formatting": "Định dạng",
    "sidebar.json": "JSON",
    "sidebar.compare_json": "So sánh JSON",
    "sidebar.statistics": "Thống kê",
    "sidebar.settings": "Cài đặt",
    "sidebar.ai": "Trí tuệ nhân tạo",
    "sidebar.ai_chat": "Chat AI",
    
    // AI Chat
    "ai.chat": "Chat AI",
    "ai.new_chat": "Chat mới",
    "ai.clear_all": "Xóa tất cả",
    "ai.your_chats": "Đoạn chat của bạn",
    "ai.type_message": "Nhập tin nhắn...",
    "ai.send": "Gửi",
    "ai.sending": "Đang gửi...",
    "ai.setup_api_key": "Thiết lập API Key",
    "ai.enter_api_key": "Nhập API key để bắt đầu sử dụng chat AI.",
    "ai.api_key_stored_locally": "API key của bạn được lưu trữ cục bộ và không bao giờ được gửi đến máy chủ của chúng tôi.",
    "ai.delete_confirm": "Bạn có chắc chắn muốn xóa tất cả các cuộc trò chuyện?",
    "ai.delete_chat": "Xóa cuộc trò chuyện",
    "ai.delete_chat_confirm": "Bạn có chắc chắn muốn xóa cuộc trò chuyện này?",
    "ai.error_response": "Lỗi khi tạo phản hồi. Vui lòng thử lại.",
    "ai.custom_endpoint": "Địa chỉ API Endpoint",
    "ai.custom_model": "VNPAY v_chat (Hỏi đáp/Hỗ trợ code)",
    "ai.openai_model": "OpenAI",
    "ai.thinking": "Đang suy nghĩ...",
    "ai.edit_chat_title": "Đổi tên chat",
    "ai.rename_chat": "Đổi tên",
    "ai.settings": "Cài đặt",
    "ai.model_selection": "Chọn model",
    "ai.api_key": "API Key",
    "ai.refresh_api_key": "Làm mới API Key",
    "ai.start_conversation": "Bắt đầu cuộc trò chuyện",
    "ai.saved_models": "Cấu hình model đã lưu",
    "ai.add_model": "Thêm model mới",
    "ai.model_name": "Tên model",
    "ai.edit_model": "Sửa model",
    "ai.delete_model": "Xóa model",
    "ai.save_model": "Lưu model",
    "ai.model_management": "Quản lý model",
    "ai.no_saved_models": "Chưa có model nào được lưu",
    "ai.select_model": "Chọn model",
    "ai.model_type": "Loại model",
    "ai.model_config": "Cấu hình model",
    "ai.enter_required_fields": "Vui lòng nhập các trường bắt buộc",
    "ai.enter_endpoint": "Vui lòng nhập API Endpoint",
    "ai.confirm_delete_model": "Bạn có chắc chắn muốn xóa model này?",
    "ai.select_model_for_chat": "Chọn model",
    "ai.config_models_first": "Bạn cần cấu hình API key cho model này",
    "ai.go_to_models": "Đi đến quản lý model",
    "ai.no_usable_models": "Không có model khả dụng. Vui lòng thêm API key.",
    "ai.active_model": "Model đang dùng",
    
    // Other
    "footer.version": "Phiên bản"
  },
  en: {
    // Common
    "app.settings": "Settings",
    "app.language": "Language",
    "app.theme": "Theme",
    "app.save": "Save",
    "app.cancel": "Cancel",
    "app.reset": "Reset",
    "app.active": "Active",
    "app.my_account": "My Account",
    "app.profile": "Profile",
    "app.security": "Security",
    "app.logout": "Logout",
    "app.search": "Search",
    "app.view_shortcuts": "View shortcuts",
    "app.open_menu": "Open menu",
    
    // Languages
    "language.vi": "Vietnamese",
    "language.en": "English",
    
    // Themes
    "theme.dark": "Dark",
    "theme.light": "Light",
    "theme.blue": "Blue",
    "theme.green": "Green",
    
    // Settings
    "settings.title": "Settings",
    "settings.language": "Language",
    "settings.theme": "Theme",
    "settings.saved": "Settings saved",
    
    // Home
    "home.title": "Welcome back!",
    "home.subtitle": "Explore powerful tools and utilities to help you work more efficiently.",
    "home.popular_tools": "Popular Tools",
    "home.view_all": "View all",
    "home.json_formatter_description": "Format and validate JSON syntax",
    "home.json_formatter_content": "Quickly format, validate, and beautify JSON code",
    "home.json_comparison_description": "Compare two JSON objects",
    "home.json_comparison_content": "Easily compare and find differences between two JSON objects",
    "home.settings_description": "Customize application",
    "home.settings_content": "Change interface, security and other options",
    "home.statistics_description": "View usage statistics",
    "home.statistics_content": "Track time and frequency of tool usage",
    "home.open_tool": "Open tool",
    "home.open_settings": "Open settings",
    "home.view_statistics": "View statistics",
    "home.recent_activities": "Recent Activities",
    "home.activity_history": "Activity History",
    "home.recent_activities_description": "Recently performed activities",
    "home.time_10min_ago": "10 minutes ago",
    "home.time_2hours_ago": "2 hours ago",
    "home.time_1day_ago": "1 day ago",
    "home.format_code": "Format code",
    "home.usage_statistics": "Usage statistics",
    "home.you_used": "You used",
    "home.featured_features": "Featured Features",
    "home.high_performance": "High Performance",
    "home.high_performance_description": "Application optimized to run fast and smooth even with large data",
    "home.save_history": "Save History",
    "home.save_history_description": "Automatically save operation history for easy access later",
    "home.multiple_formats": "Multiple Format Support",
    "home.multiple_formats_description": "Support for popular data formats like JSON, XML, CSV and more",
    "home.high_customization": "High Customization",
    "home.high_customization_description": "Easily customize interface and functions according to personal needs",
    
    // JSON Formatter
    "json.original_json": "Original JSON",
    "json.formatted_json": "Formatted JSON",
    "json.enter_json_to_format": "Enter JSON to format...",
    "json.invalid_format": "Invalid format",
    "json.copied_to_clipboard": "Copied to clipboard",
    "json.search_in_formatted_json": "Search in formatted JSON...",
    
    // JSON Compare
    "json_compare.left_json": "Left JSON",
    "json_compare.right_json": "Right JSON",
    "json_compare.enter_left_json": "Enter first JSON...",
    "json_compare.enter_right_json": "Enter second JSON...",
    "json_compare.invalid_left_json": "Invalid left JSON format",
    "json_compare.invalid_right_json": "Invalid right JSON format",
    "json_compare.comparison_error": "Comparison error",
    "json_compare.unknown_error": "Unknown error",
    "json_compare.error_during_comparison": "Error during comparison",
    "json_compare.copied_to_clipboard": "Copied to clipboard",
    "json_compare.comparison_result": "Comparison Result",
    "json_compare.missing_in_left": "Missing in left",
    "json_compare.missing_in_right": "Missing in right",
    "json_compare.copy_to_left": "Copy to left",
    "json_compare.copy_to_right": "Copy to right",
    "json_compare.copy_all_missing_to_left": "Copy all to left",
    "json_compare.copy_all_missing_to_right": "Copy all to right",
    "json_compare.expand_all": "Expand all",
    "json_compare.collapse_all": "Collapse all",
    
    // Sidebar
    "sidebar.home": "Home",
    "sidebar.tools": "Tools",
    "sidebar.formatting": "Formatting",
    "sidebar.json": "JSON",
    "sidebar.compare_json": "Compare JSON",
    "sidebar.statistics": "Statistics",
    "sidebar.settings": "Settings",
    "sidebar.ai": "Artificial Intelligence",
    "sidebar.ai_chat": "AI Chat",
    
    // AI Chat
    "ai.chat": "AI Chat",
    "ai.new_chat": "New Chat",
    "ai.clear_all": "Clear All",
    "ai.your_chats": "Your Chats",
    "ai.type_message": "Type your message...",
    "ai.send": "Send",
    "ai.sending": "Sending...",
    "ai.setup_api_key": "Setup API Key",
    "ai.enter_api_key": "Enter your API key to start using the AI chat.",
    "ai.api_key_stored_locally": "Your API key is stored locally and never sent to our servers.",
    "ai.delete_confirm": "Are you sure you want to delete all chats?",
    "ai.delete_chat": "Delete chat",
    "ai.delete_chat_confirm": "Are you sure you want to delete this chat?",
    "ai.error_response": "Error generating response. Please try again.",
    "ai.custom_endpoint": "API Endpoint URL",
    "ai.custom_model": "VNPAY v_chat",
    "ai.openai_model": "OpenAI",
    "ai.thinking": "Thinking...",
    "ai.edit_chat_title": "Edit chat title",
    "ai.rename_chat": "Rename",
    "ai.settings": "Settings",
    "ai.model_selection": "Model selection",
    "ai.api_key": "API Key",
    "ai.refresh_api_key": "Refresh API Key",
    "ai.start_conversation": "Start conversation",
    "ai.saved_models": "Saved model configurations",
    "ai.add_model": "Add new model",
    "ai.model_name": "Model name",
    "ai.edit_model": "Edit model",
    "ai.delete_model": "Delete model",
    "ai.save_model": "Save model",
    "ai.model_management": "Model management",
    "ai.no_saved_models": "No saved models",
    "ai.select_model": "Select model",
    "ai.model_type": "Model type",
    "ai.model_config": "Model configuration",
    "ai.enter_required_fields": "Please enter all required fields",
    "ai.enter_endpoint": "Please enter API Endpoint",
    "ai.confirm_delete_model": "Are you sure you want to delete this model?",
    "ai.select_model_for_chat": "Select model",
    "ai.config_models_first": "You need to configure API key for this model",
    "ai.go_to_models": "Go to model management",
    "ai.no_usable_models": "No usable models. Please add API key.",
    "ai.active_model": "Active model",
    
    // Other
    "footer.version": "Version"
  }
};

type LanguageProviderProps = {
  children: React.ReactNode;
  defaultLanguage?: Language;
  storageKey?: string;
};

type LanguageProviderState = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const initialState: LanguageProviderState = {
  language: "vi",
  setLanguage: () => null,
  t: (key: string) => key,
};

const LanguageProviderContext = createContext<LanguageProviderState>(initialState);

export function LanguageProvider({
  children,
  defaultLanguage = "vi",
  storageKey = "app-language",
}: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load language from database when component mounts
  useEffect(() => {
    async function loadLanguage() {
      try {
        const savedLanguage = await getSetting(storageKey);
        if (savedLanguage && (savedLanguage === "vi" || savedLanguage === "en")) {
          setLanguage(savedLanguage as Language);
        }
        setIsLoaded(true);
      } catch (error) {
        console.error("Failed to load language from database:", error);
        setIsLoaded(true);
      }
    }
    loadLanguage();
  }, [storageKey]);

  // Translation function
  const t = (key: string): string => {
    if (!translations[language][key]) {
      // Fallback to Vietnamese if translation not found
      if (translations["vi"][key]) {
        return translations["vi"][key];
      }
      
      // Return the key itself if no translation found
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translations[language][key];
  };

  const value = {
    language,
    setLanguage: (newLanguage: Language) => {
      saveSetting(storageKey, newLanguage).catch(error => {
        console.error("Failed to save language to database:", error);
      });
      setLanguage(newLanguage);
    },
    t,
  };

  // Only render children when language is loaded
  if (!isLoaded) {
    return null;
  }

  return (
    <LanguageProviderContext.Provider value={value}>
      {children}
    </LanguageProviderContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageProviderContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}; 