import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchStats, resetStats } from '@/lib/store/slices/statsSlice';
import { Clock, Activity, Layers, Award, Timer, Trash2 } from 'lucide-react';
import StatCard from '@/components/stats/StatCard';
import UsageChart from '@/components/stats/UsageChart';
import FeatureUsageTable from '@/components/stats/FeatureUsageTable';
import FeatureUsageChart from '@/components/stats/FeatureUsageChart';
import TimeDistributionChart from '@/components/stats/TimeDistributionChart';
import DateRangeSelector from '@/components/stats/DateRangeSelector';
import ResetStatsDialog from '@/components/stats/ResetStatsDialog';
import { DailyUsage, FeatureUsage } from '@/services/database';
import { Button } from '@/components/ui/button';
import { useFeatureTracking } from '@/hooks/useFeatureTracking';
import { toast } from 'sonner';
// Always use our fallback tabs to avoid dynamic import errors
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Fallback for tabs if not available yet
const DEFAULT_SECTION = 'overview';

const Statistics = () => {
  // Track usage of the statistics page
  useFeatureTracking('statistics');

  const dispatch = useAppDispatch();
  const { dailyUsage, featureUsage, loading } = useAppSelector(state => state.stats);
  const [days, setDays] = useState(7); // Mặc định hiển thị 7 ngày
  const [activeSection, setActiveSection] = useState(DEFAULT_SECTION);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  // Remove dynamic import that's causing 500 error
  // const [TabsComponents, setTabsComponents] = useState<any>(null);
  
  // useEffect(() => {
  //   const loadTabsComponents = async () => {
  //     try {
  //       const tabsModule = await import('@/components/ui/tabs');
  //       setTabsComponents(tabsModule);
  //     } catch (error) {
  //       console.error('Failed to load Tabs components:', error);
  //     }
  //   };
    
  //   loadTabsComponents();
  // }, []);

  useEffect(() => {
    // Fetch dữ liệu thống kê
    dispatch(fetchStats(days));
  }, [dispatch, days]);

  // Tính tổng số lần truy cập (tổng số lượt truy cập vào tất cả các trang)
  const getTotalVisits = (data: DailyUsage[]): number => {
    return data.reduce((sum, item) => sum + item.count, 0);
  };

  // Tính tổng số lượt truy cập vào các tính năng (không bao gồm trang thống kê và trang cài đặt)
  const getTotalFeatureVisits = (data: FeatureUsage[]): number => {
    return data
      .filter(item => item.feature !== 'statistics' && item.feature !== 'settings')
      .reduce((sum, item) => sum + item.count, 0);
  };

  // Tính tổng thời gian sử dụng (đơn vị phút), không bao gồm trang thống kê và trang cài đặt
  const getTotalTimeSpent = (data: FeatureUsage[]): number => {
    const totalSeconds = data
      .filter(item => item.feature !== 'statistics' && item.feature !== 'settings')
      .reduce((sum, item) => sum + item.timeSpent, 0);
    return Math.round(totalSeconds / 60); // Đổi từ giây sang phút
  };

  // Tính số lượng tính năng đã sử dụng, không bao gồm trang thống kê và trang cài đặt
  const getFeatureCount = (data: FeatureUsage[]): number => {
    return data.filter(item => item.feature !== 'statistics' && item.feature !== 'settings').length;
  };

  // Tính tính năng được sử dụng nhiều nhất
  const getMostUsedFeature = (data: FeatureUsage[]): string => {
    if (data.length === 0) return 'Chưa có dữ liệu';
    
    const sorted = [...data]
      .filter(item => item.feature !== 'statistics' && item.feature !== 'settings')
      .sort((a, b) => b.count - a.count);
    
    if (sorted.length === 0) return 'Chưa có dữ liệu';
    
    const featureMap: Record<string, string> = {
      'json_formatter': 'JSON Formatter',
      'json_compare': 'So sánh JSON',
      'home': 'Trang chủ',
      'statistics': 'Thống kê',
      'ai': 'AI Chat'
    };
    
    return featureMap[sorted[0].feature] || sorted[0].feature;
  };

  // Tính tính năng có thời gian sử dụng nhiều nhất
  const getMostTimeSpentFeature = (data: FeatureUsage[]): string => {
    if (data.length === 0) return 'Chưa có dữ liệu';
    
    const sorted = [...data]
      .filter(item => item.feature !== 'statistics' && item.feature !== 'settings')
      .sort((a, b) => b.timeSpent - a.timeSpent);
    
    if (sorted.length === 0) return 'Chưa có dữ liệu';
    
    const featureMap: Record<string, string> = {
      'json_formatter': 'JSON Formatter',
      'json_compare': 'So sánh JSON',
      'home': 'Trang chủ',
      'statistics': 'Thống kê',
      'ai': 'AI Chat'
    };
    
    return featureMap[sorted[0].feature] || sorted[0].feature;
  };

  // Tính thời gian sử dụng trung bình mỗi ngày (phút)
  const getAverageTimePerDay = (data: FeatureUsage[], daysCount: number): number => {
    if (data.length === 0 || daysCount === 0) return 0;
    
    const totalMinutes = getTotalTimeSpent(data);
    return Math.round(totalMinutes / daysCount);
  };

  // Tính phần trăm tăng/giảm so với tuần trước
  const calculateTrend = (data: DailyUsage[]): {value: number, isPositive: boolean} => {
    if (data.length < 14) return { value: 0, isPositive: true };
    
    const currentWeek = data.slice(data.length - 7, data.length);
    const previousWeek = data.slice(data.length - 14, data.length - 7);
    
    const currentSum = currentWeek.reduce((sum, item) => sum + item.count, 0);
    const previousSum = previousWeek.reduce((sum, item) => sum + item.count, 0);
    
    if (previousSum === 0) return { value: 100, isPositive: true };
    
    const percentChange = Math.round(((currentSum - previousSum) / previousSum) * 100);
    return {
      value: Math.abs(percentChange),
      isPositive: percentChange >= 0
    };
  };

  // Xử lý thay đổi khoảng thời gian
  const handleDateRangeChange = (newDays: number) => {
    setDays(newDays);
  };

  // Hàm reset thống kê
  const handleResetStats = async () => {
    try {
      const result = await dispatch(resetStats()).unwrap();
      if (result.success) {
        toast.success('Đã xóa toàn bộ dữ liệu thống kê');
        // Reload thống kê sau khi reset
        dispatch(fetchStats(days));
      } else {
        toast.error('Không thể xóa dữ liệu thống kê');
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi khi xóa dữ liệu thống kê');
    }
  };

  // Simple tab selection
  const handleTabChange = (section: string) => {
    setActiveSection(section);
  };

  // Render the Overview section
  const renderOverviewSection = () => (
    <div className="space-y-6">
      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Phiên làm việc"
          value={getTotalVisits(dailyUsage)}
          icon={Activity}
          trend={calculateTrend(dailyUsage)}
        />
        <StatCard
          title="Lượt sử dụng tính năng"
          value={getTotalFeatureVisits(featureUsage)}
          icon={Layers}
        />
        <StatCard
          title="Thời gian sử dụng"
          value={`${getTotalTimeSpent(featureUsage)} phút`}
          icon={Clock}
        />
        <StatCard
          title="Tính năng phổ biến"
          value={getMostUsedFeature(featureUsage)}
          icon={Award}
        />
      </div>

      {/* Biểu đồ lượt truy cập */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UsageChart
          data={dailyUsage}
          title="Lượt truy cập theo ngày"
          type="line"
        />
        <FeatureUsageChart
          data={featureUsage}
          title="Phân bố sử dụng tính năng"
        />
      </div>
    </div>
  );

  // Render the Features section
  const renderFeaturesSection = () => (
    <div className="space-y-6">
      {/* Thống kê tính năng */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng số tính năng"
          value={getFeatureCount(featureUsage)}
          icon={Layers}
        />
        <StatCard
          title="Thời gian TB/ngày"
          value={`${getAverageTimePerDay(featureUsage, days)} phút`}
          icon={Timer}
        />
        <StatCard
          title="Dùng nhiều nhất"
          value={getMostUsedFeature(featureUsage)}
          icon={Award}
        />
        <StatCard
          title="Dùng lâu nhất"
          value={getMostTimeSpentFeature(featureUsage)}
          icon={Clock}
        />
      </div>

      {/* Biểu đồ phân bố thời gian sử dụng */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TimeDistributionChart
          data={featureUsage}
          title="Thời gian sử dụng các tính năng"
        />
        <UsageChart
          data={dailyUsage}
          title="Lượt truy cập theo ngày"
          type="bar"
        />
      </div>
    </div>
  );

  // Render content based on active section
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverviewSection();
      case 'features':
        return renderFeaturesSection();
      case 'details':
        return <FeatureUsageTable data={featureUsage} />;
      default:
        return renderOverviewSection();
    }
  };

  // Fallback tab UI if Tabs component isn't available
  const renderFallbackTabs = () => (
    <div className="mb-6">
      <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
        {['overview', 'features', 'details'].map(tab => (
          <button 
            key={tab}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all 
              ${activeSection === tab 
                ? 'bg-background text-foreground shadow-sm' 
                : 'hover:bg-background/50 hover:text-foreground'
              }`}
            onClick={() => handleTabChange(tab)}
          >
            {tab === 'overview' ? 'Tổng quan' : tab === 'features' ? 'Tính năng' : 'Chi tiết'}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {renderActiveSection()}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Thống kê sử dụng</h1>
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          <DateRangeSelector days={days} onChange={handleDateRangeChange} />
          <Button 
            variant="outline" 
            size="sm"
            className="text-destructive border-destructive hover:bg-destructive/10"
            onClick={() => setIsResetDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Xóa thống kê
          </Button>
        </div>
      </div>

      {loading === 'pending' ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Use fallback tabs since the dynamic import is failing */}
          {renderFallbackTabs()}
        </>
      )}

      <ResetStatsDialog 
        isOpen={isResetDialogOpen} 
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={handleResetStats}
      />
    </div>
  );
};

export default Statistics; 