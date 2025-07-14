import React, { createRef } from 'react';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartConfiguration,
  BarController
} from 'chart.js';
import { FeatureUsage } from '@/services/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  BarController
);

interface TimeDistributionChartProps {
  data: FeatureUsage[];
  title: string;
}

class TimeDistributionChart extends React.Component<TimeDistributionChartProps> {
  private chartRef = createRef<HTMLCanvasElement>();
  private chart: Chart | null = null;
  private canvasId = `time-chart-${Math.random().toString(36).substring(2, 9)}`;

  componentDidMount() {
    this.createChart();
  }

  componentDidUpdate(prevProps: TimeDistributionChartProps) {
    // If data changed, destroy and recreate chart
    if (prevProps.data !== this.props.data) {
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }
      this.createChart();
    }
  }

  componentWillUnmount() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  // Ánh xạ tên tính năng dễ đọc hơn
  getFeatureName = (featureKey: string): string => {
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

  // Hàm định dạng thời gian từ giây sang phút
  formatTimeToMinutes = (seconds: number): number => {
    return Math.round(seconds / 60);
  };

  // Chuẩn bị dữ liệu cho biểu đồ
  prepareChartData = () => {
    const { data } = this.props;
    // Ensure data is valid and filter out statistics and settings pages
    const validData = data && Array.isArray(data) 
      ? data.filter(item => item.feature !== 'statistics' && item.feature !== 'settings')
      : [];
    
    if (validData.length === 0) {
      return {
        labels: [],
        datasets: [{ 
          label: 'Thời gian sử dụng (phút)', 
          data: [], 
          backgroundColor: [],
          hoverBackgroundColor: [],
          borderRadius: 4 
        }]
      };
    }
    
    // Sắp xếp dữ liệu theo thời gian sử dụng (giảm dần)
    const sortedData = [...validData].sort((a, b) => b.timeSpent - a.timeSpent);
    
    // Lấy 5 tính năng được sử dụng nhiều nhất theo thời gian
    const topFeatures = sortedData.slice(0, 5);
    
    // Xử lý dữ liệu cho biểu đồ
    const labels = topFeatures.map(item => this.getFeatureName(item.feature));
    const timeSpentData = topFeatures.map(item => this.formatTimeToMinutes(item.timeSpent));
    
    // Tạo mảng màu sắc đa dạng
    const backgroundColors = [
      'rgba(99, 102, 241, 0.7)',
      'rgba(59, 130, 246, 0.7)',
      'rgba(16, 185, 129, 0.7)',
      'rgba(245, 158, 11, 0.7)',
      'rgba(239, 68, 68, 0.7)',
    ];
    
    const hoverBackgroundColors = [
      'rgba(99, 102, 241, 0.9)',
      'rgba(59, 130, 246, 0.9)',
      'rgba(16, 185, 129, 0.9)',
      'rgba(245, 158, 11, 0.9)',
      'rgba(239, 68, 68, 0.9)',
    ];
    
    return {
      labels,
      datasets: [
        {
          label: 'Thời gian sử dụng (phút)',
          data: timeSpentData,
          backgroundColor: backgroundColors,
          hoverBackgroundColor: hoverBackgroundColors,
          borderRadius: 4,
        },
      ],
    };
  };

  createChart() {
    const ctx = this.chartRef.current?.getContext('2d');
    if (!ctx) return;

    const chartData = this.prepareChartData();
    
    // Don't create chart if there's no data
    if (chartData.labels.length === 0) {
      return;
    }

    // Check if a chart already exists on this canvas and destroy it
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    const config: ChartConfiguration = {
      type: 'bar',
      data: chartData,
      options: {
        indexAxis: 'y', // Horizontal bar chart
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: {
                size: 12,
              },
              color: 'rgb(156, 163, 175)',
            },
          },
          tooltip: {
            backgroundColor: 'rgb(17, 24, 39)',
            titleFont: {
              size: 14,
            },
            bodyFont: {
              size: 13,
            },
            padding: 12,
            borderColor: 'rgba(99, 102, 241, 0.3)',
            borderWidth: 1,
            callbacks: {
              label: function(context: any) {
                const value = context.raw || 0;
                return `${value} phút`;
              }
            }
          },
        },
        scales: {
          x: {
            ticks: {
              color: 'rgb(156, 163, 175)',
            },
            grid: {
              color: 'rgba(156, 163, 175, 0.1)',
            },
            title: {
              display: true,
              text: 'Thời gian (phút)',
              color: 'rgb(156, 163, 175)',
              font: {
                size: 12,
              },
            },
          },
          y: {
            ticks: {
              color: 'rgb(156, 163, 175)',
            },
            grid: {
              color: 'rgba(156, 163, 175, 0.1)',
            },
          },
        },
      }
    };

    // Create new chart
    this.chart = new Chart(ctx, config);
  }

  render() {
    const { title, data } = this.props;
    const validData = data && Array.isArray(data) ? data : [];

    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px]">
          {validData.length > 0 ? (
            <div className="w-full h-full">
              <canvas id={this.canvasId} ref={this.chartRef} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Chưa có dữ liệu sử dụng tính năng
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
}

export default TimeDistributionChart; 