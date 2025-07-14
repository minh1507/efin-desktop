import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileJson, Settings, BarChart, Zap, Code, Clock, GitCompare, MessageSquare, Brain } from 'lucide-react';
import { useFeatureTracking } from '@/hooks/useFeatureTracking';
import { useLanguage } from '@/components/language-provider';

export default function Home() {
  // Track usage of the home page
  useFeatureTracking('home');
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      {/* Hero section */}
      <section className="space-y-4">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight">{t('home.title')}</h1>
          <p className="text-muted-foreground">
            {t('home.subtitle')}
          </p>
        </div>
      </section>

      {/* Featured tools */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('home.popular_tools')}</h2>
          <Button variant="ghost" size="sm" className="gap-1">
            {t('home.view_all')} <ArrowRight className="h-4 w-4" />
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
                {t('home.json_formatter_description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2 text-sm text-muted-foreground">
              {t('home.json_formatter_content')}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" asChild>
                <a href="#/format/json">{t('home.open_tool')}</a>
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
                {t('home.json_comparison_description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2 text-sm text-muted-foreground">
              {t('home.json_comparison_content')}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" asChild>
                <a href="#/format/compare-json">{t('home.open_tool')}</a>
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-2">
                <MessageSquare className="text-green-500 h-6 w-6" />
              </div>
              <CardTitle>VNPAY AI Chat</CardTitle>
              <CardDescription>
                Tương tác với mô hình AI thông minh
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2 text-sm text-muted-foreground">
              Trò chuyện với AI để nhận thông tin hỗ trợ công việc hàng ngày
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" asChild>
                <a href="#/ai">{t('home.open_tool')}</a>
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-2">
                <BarChart className="text-destructive h-6 w-6" />
              </div>
              <CardTitle>{t('sidebar.statistics')}</CardTitle>
              <CardDescription>
                {t('home.statistics_description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2 text-sm text-muted-foreground">
              {t('home.statistics_content')}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" asChild>
                <a href="#/statistics">{t('home.view_statistics')}</a>
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-2">
                <Settings className="text-secondary h-6 w-6" />
              </div>
              <CardTitle>{t('app.settings')}</CardTitle>
              <CardDescription>
                {t('home.settings_description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2 text-sm text-muted-foreground">
              {t('home.settings_content')}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" asChild>
                <a href="#/settings">{t('home.open_settings')}</a>
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-2">
                <Brain className="text-purple-500 h-6 w-6" />
              </div>
              <CardTitle>AI Reasoning</CardTitle>
              <CardDescription>
                Mô hình suy luận logic nâng cao
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2 text-sm text-muted-foreground">
              Giải quyết vấn đề phức tạp với mô hình AI reasoning
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" asChild>
                <a href="#/ai">{t('home.open_tool')}</a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Recent activities */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{t('home.recent_activities')}</h2>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>{t('home.activity_history')}</CardTitle>
            <CardDescription>
              {t('home.recent_activities_description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { icon: FileJson, title: 'JSON Formatter', time: t('home.time_10min_ago'), color: 'text-primary' },
                { icon: MessageSquare, title: 'AI Chat', time: t('home.time_1hour_ago'), color: 'text-green-500' },
                { icon: Code, title: t('home.format_code'), time: t('home.time_2hours_ago'), color: 'text-blue-500' },
                { icon: Clock, title: t('home.usage_statistics'), time: t('home.time_1day_ago'), color: 'text-orange-500' },
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
                    <p className="text-sm text-muted-foreground">{t('home.you_used')} {item.title.toLowerCase()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Features */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{t('home.featured_features')}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Zap className="text-yellow-500 h-5 w-5" />
                <CardTitle className="text-base">{t('home.high_performance')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {t('home.high_performance_description')}
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Clock className="text-blue-500 h-5 w-5" />
                <CardTitle className="text-base">{t('home.save_history')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {t('home.save_history_description')}
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Code className="text-green-500 h-5 w-5" />
                <CardTitle className="text-base">{t('home.multiple_formats')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {t('home.multiple_formats_description')}
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="text-purple-500 h-5 w-5" />
                <CardTitle className="text-base">AI Chat & Reasoning</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Công cụ AI thông minh giúp tương tác, trả lời câu hỏi và giải quyết vấn đề phức tạp
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
