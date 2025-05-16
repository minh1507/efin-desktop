import React from 'react';
import { FeatureUsage } from '@/services/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FeatureUsageTableProps {
  data: FeatureUsage[];
}

const FeatureUsageTable: React.FC<FeatureUsageTableProps> = ({ data }) => {
  // Hàm định dạng thời gian từ giây sang giờ:phút:giây
  const formatTimeSpent = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}p ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}p ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };
  
  // Hàm định dạng ngày giờ
  const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Ánh xạ tên tính năng dễ đọc hơn
  const getFeatureName = (featureKey: string): string => {
    const featureNames: Record<string, string> = {
      'json_formatter': 'JSON Formatter',
      'json_compare': 'So sánh JSON',
      'home': 'Trang chủ',
      'statistics': 'Thống kê',
      'settings': 'Cài đặt',
      'ai': 'AI Chat',
      // Thêm các tính năng khác ở đây
    };
    
    return featureNames[featureKey] || featureKey;
  };
  
  // Create a sorted copy of the data array
  const sortedData = data && Array.isArray(data) 
    ? [...data]
        .filter(item => item.feature !== 'statistics' && item.feature !== 'settings') // Filter out statistics and settings pages
        .sort((a, b) => b.timeSpent - a.timeSpent) 
    : [];
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Chi tiết sử dụng tính năng</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-3 text-left font-medium">Tính năng</th>
                <th className="py-3 text-left font-medium">Số lần sử dụng</th>
                <th className="py-3 text-left font-medium">Thời gian sử dụng</th>
                <th className="py-3 text-left font-medium">Sử dụng lần cuối</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.length > 0 ? (
                sortedData.map((feature, index) => (
                  <tr 
                    key={feature.feature} 
                    className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : ''}
                  >
                    <td className="py-3 font-medium">{getFeatureName(feature.feature)}</td>
                    <td className="py-3">{feature.count} lần</td>
                    <td className="py-3">{formatTimeSpent(feature.timeSpent)}</td>
                    <td className="py-3">{formatDateTime(feature.lastUsed)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500">
                    Chưa có dữ liệu sử dụng tính năng
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureUsageTable; 