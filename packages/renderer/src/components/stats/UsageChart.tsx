import React, { createRef } from 'react';
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartConfiguration,
  LineController,
  BarController
} from 'chart.js';
import { DailyUsage } from '@/services/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineController,
  BarController
);

interface UsageChartProps {
  data: DailyUsage[];
  title: string;
  type?: 'line' | 'bar';
}

class UsageChart extends React.Component<UsageChartProps> {
  private chartRef = createRef<HTMLCanvasElement>();
  private chart: Chart | null = null;
  private canvasId = `usage-chart-${Math.random().toString(36).substring(2, 9)}`;

  componentDidMount() {
    this.createChart();
  }

  componentDidUpdate(prevProps: UsageChartProps) {
    // If data or type changed, destroy and recreate chart
    if (prevProps.data !== this.props.data || prevProps.type !== this.props.type) {
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

  createChart() {
    const { data, type = 'line' } = this.props;
    const validData = data && Array.isArray(data) ? data : [];
    const ctx = this.chartRef.current?.getContext('2d');

    if (!ctx || validData.length === 0) {
      return;
    }

    // Check if a chart already exists on this canvas and destroy it
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    const chartData = {
      labels: validData.map(item => {
        // Format date to display as "dd/MM"
        const date = new Date(item.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      }),
      datasets: [
        {
          label: 'Số lần sử dụng',
          data: validData.map(item => item.count),
          backgroundColor: 'rgba(99, 102, 241, 0.5)',
          borderColor: 'rgb(99, 102, 241)',
          borderWidth: 2,
          tension: 0.3,
          pointBackgroundColor: 'rgb(99, 102, 241)',
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };

    const config: ChartConfiguration = {
      type: type as any,
      data: chartData,
      options: {
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
          title: {
            display: false,
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
          },
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(156, 163, 175, 0.1)',
            },
            ticks: {
              color: 'rgb(156, 163, 175)',
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(156, 163, 175, 0.1)',
            },
            ticks: {
              color: 'rgb(156, 163, 175)',
              precision: 0,
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
              Chưa có dữ liệu sử dụng
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
}

export default UsageChart; 