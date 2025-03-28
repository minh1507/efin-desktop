import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import './home.css'

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <h2 className="text-lg font-semibold mb-4">Tính năng mới</h2>
      <p className="text-sm text-gray-500 mb-8">
        Dưới đây là những tính năng mới nhất trong phiên bản này:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Tính năng mới 1</CardTitle>
            <CardDescription>
              Mô tả ngắn về tính năng mới 1
            </CardDescription>
          </CardHeader>
          <CardContent>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tính năng mới 2</CardTitle>
            <CardDescription>
              Mô tả ngắn về tính năng mới 2
            </CardDescription>
          </CardHeader>
          <CardContent>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tính năng mới 2</CardTitle>
            <CardDescription>
              Mô tả ngắn về tính năng mới 2
            </CardDescription>
          </CardHeader>
          <CardContent>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tính năng mới 2</CardTitle>
            <CardDescription>
              Mô tả ngắn về tính năng mới 2
            </CardDescription>
          </CardHeader>
          <CardContent>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-lg font-semibold mb-4">Chặng đường phát triển</h3>
      <p className="text-sm text-gray-500 mb-4">
        Dưới đây là chặng đường phát triển của chúng tôi:
      </p>

      <div className="flex flex-col items-center mb-8">
        <div className="relative w-full h-1 bg-gray-200 mb-4">
          <div className="absolute top-0 left w-1/4 h-full bg-red-500 red-plum" />
        </div>

        <div className="flex justify-between w-full mb-4">
          <div className="text-center">
            <h4 className="text-sm font-medium">Hiện tại</h4>
            <p className="text-xs text-gray-500">Phát triển công cụ hỗ trợ</p>
          </div>

          <div className="text-center">
            <h4 className="text-sm font-medium">2026</h4>
            <p className="text-xs text-gray-500">Chưa có</p>
          </div>

          <div className="text-center">
            <h4 className="text-sm font-medium">2027</h4>
            <p className="text-xs text-gray-500">Chưa có</p>
          </div>

          <div className="text-center">
            <h4 className="text-sm font-medium">2028</h4>
            <p className="text-xs text-gray-500">Chưa có</p>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-4">Tính năng nổi bật</h3>
      <p className="text-sm text-gray-500 mb-4">
        Dưới đây là những tính năng nổi bật của chúng tôi:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Tính năng nổi bật 1</CardTitle>
            <CardDescription>
              Mô tả ngắn về tính năng nổi bật 1
            </CardDescription>
          </CardHeader>
          <CardContent>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tính năng nổi bật 2</CardTitle>
            <CardDescription>
              Mô tả ngắn về tính năng nổi bật 2
            </CardDescription>
          </CardHeader>
          <CardContent>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tính năng nổi bật 2</CardTitle>
            <CardDescription>
              Mô tả ngắn về tính năng nổi bật 2
            </CardDescription>
          </CardHeader>
          <CardContent>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tính năng nổi bật 2</CardTitle>
            <CardDescription>
              Mô tả ngắn về tính năng nổi bật 2
            </CardDescription>
          </CardHeader>
          <CardContent>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
