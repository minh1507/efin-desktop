import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, FileJson, Settings, BarChart, Zap, Code, Clock, GitCompare } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero section */}
      <section className="space-y-4">
        <div className="flex flex-col">
          <Badge variant="outline" className="w-fit mb-4">Dashboard</Badge>
          <h1 className="text-3xl font-bold tracking-tight">Chào mừng trở lại!</h1>
          <p className="text-muted-foreground">
            Khám phá những công cụ mạnh mẽ và tiện ích để giúp bạn làm việc hiệu quả hơn.
          </p>
        </div>
      </section>

      {/* Featured tools */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Công cụ phổ biến</h2>
          <Button variant="ghost" size="sm" className="gap-1">
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <FileJson className="text-primary h-6 w-6" />
              </div>
              <CardTitle>JSON Formatter</CardTitle>
              <CardDescription>
                Format và kiểm tra cú pháp JSON
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2 text-sm text-muted-foreground">
              Định dạng, tìm lỗi và làm đẹp code JSON một cách nhanh chóng
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" asChild>
                <a href="#/format/json">Mở công cụ</a>
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-2">
                <GitCompare className="text-blue-500 h-6 w-6" />
              </div>
              <CardTitle>JSON Comparison</CardTitle>
              <CardDescription>
                So sánh hai đối tượng JSON
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2 text-sm text-muted-foreground">
              Dễ dàng so sánh và tìm sự khác biệt giữa hai đối tượng JSON
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" asChild>
                <a href="#/format/compare-json">Mở công cụ</a>
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-2">
                <Settings className="text-secondary h-6 w-6" />
              </div>
              <CardTitle>Cài đặt</CardTitle>
              <CardDescription>
                Tùy chỉnh ứng dụng
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2 text-sm text-muted-foreground">
              Thay đổi giao diện, bảo mật và các tùy chọn khác
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm">Mở cài đặt</Button>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-2">
                <BarChart className="text-destructive h-6 w-6" />
              </div>
              <CardTitle>Thống kê</CardTitle>
              <CardDescription>
                Xem thống kê sử dụng
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2 text-sm text-muted-foreground">
              Theo dõi thời gian và tần suất sử dụng các công cụ
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm">Xem thống kê</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Recent activities */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Hoạt động gần đây</h2>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Lịch sử hoạt động</CardTitle>
            <CardDescription>
              Các hoạt động được thực hiện gần đây
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { icon: FileJson, title: 'JSON Formatter', time: '10 phút trước', color: 'text-primary' },
                { icon: Code, title: 'Format code', time: '2 giờ trước', color: 'text-green-500' },
                { icon: Clock, title: 'Thống kê sử dụng', time: '1 ngày trước', color: 'text-orange-500' },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`p-2 rounded-full bg-muted ${item.color}`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.time}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Bạn đã sử dụng {item.title.toLowerCase()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Features */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Tính năng nổi bật</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Zap className="text-yellow-500 h-5 w-5" />
                <CardTitle className="text-base">Hiệu suất cao</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Ứng dụng được tối ưu hóa để chạy nhanh và mượt mà ngay cả với dữ liệu lớn
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Clock className="text-blue-500 h-5 w-5" />
                <CardTitle className="text-base">Lưu lịch sử</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Tự động lưu lịch sử các thao tác để dễ dàng truy cập lại sau này
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Code className="text-green-500 h-5 w-5" />
                <CardTitle className="text-base">Hỗ trợ nhiều định dạng</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Hỗ trợ nhiều định dạng dữ liệu phổ biến như JSON, XML, CSV và nhiều hơn nữa
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Settings className="text-purple-500 h-5 w-5" />
                <CardTitle className="text-base">Tùy biến cao</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Dễ dàng tùy chỉnh giao diện và chức năng theo nhu cầu cá nhân
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
