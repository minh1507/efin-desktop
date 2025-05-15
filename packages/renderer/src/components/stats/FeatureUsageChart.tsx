import React, { createRef } from 'react';
import { Chart, ArcElement, Tooltip, Legend, ChartConfiguration, PieController } from 'chart.js';
import { FeatureUsage } from '@/services/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Register Chart.js components
Chart.register(ArcElement, Tooltip, Legend, PieController);

interface FeatureUsageChartProps {
  data: FeatureUsage[];
  title: string;
}

class FeatureUsageChart extends React.Component<FeatureUsageChartProps> {
  private chartRef = createRef<HTMLCanvasElement>();
  private chart: Chart | null = null;
  private canvasId = `feature-chart-${Math.random().toString(36).substring(2, 9)}`;

  componentDidMount() {
    this.createChart();
  }

  componentDidUpdate(prevProps: FeatureUsageChartProps) {
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
      // Thêm các tính năng khác ở đây
    };
    
    return featureNames[featureKey] || featureKey;
  };

  // Chuẩn bị dữ liệu cho biểu đồ
  prepareChartData = () => {
    const { data } = this.props;
    // Ensure data is valid and filter out statistics page
    const validData = data && Array.isArray(data) 
      ? data.filter(item => item.feature !== 'statistics')
      : [];
    
    if (validData.length === 0) {
      return {
        labels: [],
        datasets: [{ data: [], backgroundColor: [], borderColor: [], borderWidth: 1 }]
      };
    }
    
    // Sắp xếp dữ liệu theo số lần sử dụng (giảm dần)
    const sortedData = [...validData].sort((a, b) => b.count - a.count);
    
    // Lấy 5 tính năng được sử dụng nhiều nhất
    const topFeatures = sortedData.slice(0, 5);
    
    // Tạo "Others" cho các tính năng còn lại
    const otherFeatures = sortedData.slice(5);
    const otherCount = otherFeatures.reduce((sum, item) => sum + item.count, 0);
    
    // Tạo danh sách các tính năng để hiển thị
    const labels = topFeatures.map(item => this.getFeatureName(item.feature));
    const counts = topFeatures.map(item => item.count);
    
    // Thêm "Khác" nếu có
    if (otherCount > 0) {
      labels.push('Khác');
      counts.push(otherCount);
    }
    
    // Tạo mảng màu sắc đa dạng
    const backgroundColors = [
      'rgba(99, 102, 241, 0.7)',
      'rgba(59, 130, 246, 0.7)',
      'rgba(16, 185, 129, 0.7)',
      'rgba(245, 158, 11, 0.7)',
      'rgba(239, 68, 68, 0.7)',
      'rgba(107, 114, 128, 0.7)'
    ];
    
    const borderColors = [
      'rgb(99, 102, 241)',
      'rgb(59, 130, 246)',
      'rgb(16, 185, 129)',
      'rgb(245, 158, 11)',
      'rgb(239, 68, 68)',
      'rgb(107, 114, 128)'
    ];
    
    return {
      labels,
      datasets: [
        {
          data: counts,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
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
      type: 'pie',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: {
                size: 12,
              },
              color: 'rgb(156, 163, 175)',
              padding: 15,
              boxWidth: 15,
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
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} lần (${percentage}%)`;
              }
            }
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
        <CardContent className="h-[250px] flex items-center justify-center">
          {validData.length > 0 ? (
            <div className="w-full h-full">
              <canvas id={this.canvasId} ref={this.chartRef} />
            </div>
          ) : (
            <div className="text-center text-gray-500">
              Chưa có dữ liệu sử dụng tính năng
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
}

export default FeatureUsageChart; 