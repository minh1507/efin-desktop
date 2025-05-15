import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

interface DateRangeSelectorProps {
  days: number;
  onChange: (days: number) => void;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ days, onChange }) => {
  // Tạo các tùy chọn khoảng thời gian
  const timeRanges = [
    { label: '7 ngày', value: 7 },
    { label: '14 ngày', value: 14 },
    { label: '30 ngày', value: 30 },
    { label: '90 ngày', value: 90 }
  ];

  // Định dạng ngày tháng
  const formatDate = (daysAgo: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Hiển thị khoảng thời gian hiện tại
  const currentRange = `${formatDate(days - 1)} - ${formatDate(0)}`;

  return (
    <Card className="bg-background border-border/40">
      <CardContent className="p-3">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Khoảng thời gian:</span>
            <span className="font-medium">{currentRange}</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {timeRanges.map((range) => (
              <Button
                key={range.value}
                variant={days === range.value ? "default" : "outline"}
                size="sm"
                onClick={() => onChange(range.value)}
                className="h-8 px-3 py-1"
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DateRangeSelector; 