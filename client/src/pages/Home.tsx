/**
 * 八字排盘分析工具 - 主页面
 * 东方禅意风格设计
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Copy, Sparkles, RotateCcw } from 'lucide-react';
import { parseBirthInfo, type ParsedBirthInfo } from '@/lib/textParser';
import { fatemaps, lunarToSolar } from '@/lib/paipanWrapper';
import { analyzeBazi, formatResultForCopy, WUXING_CLASS, type BaziAnalysisResult } from '@/lib/baziAnalyzer';
import { CITIES, findCity, DEFAULT_CITY, type CityInfo } from '@/lib/cityData';

export default function Home() {
  // 智能输入文本
  const [smartInput, setSmartInput] = useState('');
  
  // 表单数据
  const [year, setYear] = useState<number>(1990);
  const [month, setMonth] = useState<number>(1);
  const [day, setDay] = useState<number>(1);
  const [hour, setHour] = useState<number>(12);
  const [minute, setMinute] = useState<number>(0);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [city, setCity] = useState<CityInfo>(DEFAULT_CITY);
  const [isLunar, setIsLunar] = useState(false);
  
  // 解析状态
  const [parseConfidence, setParseConfidence] = useState<number>(0);
  
  // 分析结果
  const [result, setResult] = useState<BaziAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 智能解析
  const handleSmartParse = useCallback(() => {
    if (!smartInput.trim()) {
      toast.error('请输入生辰信息');
      return;
    }
    
    const parsed = parseBirthInfo(smartInput);
    
    if (parsed.year) setYear(parsed.year);
    if (parsed.month) setMonth(parsed.month);
    if (parsed.day) setDay(parsed.day);
    if (parsed.hour !== undefined) setHour(parsed.hour);
    if (parsed.minute !== undefined) setMinute(parsed.minute);
    if (parsed.gender) setGender(parsed.gender);
    if (parsed.isLunar) setIsLunar(parsed.isLunar);
    
    if (parsed.location) {
      const foundCity = findCity(parsed.location);
      if (foundCity) setCity(foundCity);
    }
    
    setParseConfidence(parsed.confidence);
    
    if (parsed.confidence >= 75) {
      toast.success('解析成功，请确认信息');
    } else if (parsed.confidence >= 50) {
      toast.warning('部分信息已识别，请补充完善');
    } else {
      toast.error('解析结果不完整，请手动填写');
    }
  }, [smartInput]);

  // 执行分析
  const handleAnalyze = useCallback(() => {
    setIsAnalyzing(true);
    
    try {
      let actualYear = year;
      let actualMonth = month;
      let actualDay = day;
      
      // 如果是农历，先转换为公历
      if (isLunar) {
        const solarDate = lunarToSolar(year, month, day);
        if (solarDate) {
          actualYear = solarDate[0];
          actualMonth = solarDate[1];
          actualDay = solarDate[2];
        } else {
          toast.error('农历转换失败，请检查日期');
          setIsAnalyzing(false);
          return;
        }
      }
      
      // 调用排盘
      const genderCode = gender === 'male' ? 0 : 1;
      const paipanResult = fatemaps(
        genderCode,
        actualYear,
        actualMonth,
        actualDay,
        hour,
        minute,
        0,
        city.longitude,
        city.latitude
      );
      
      if (!paipanResult) {
        toast.error('排盘失败，请检查输入信息');
        setIsAnalyzing(false);
        return;
      }
      
      // 分析八字
      const analysisResult = analyzeBazi(paipanResult);
      setResult(analysisResult);
      toast.success('分析完成');
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('分析过程出错');
    } finally {
      setIsAnalyzing(false);
    }
  }, [year, month, day, hour, minute, gender, city, isLunar]);

  // 复制结果
  const handleCopy = useCallback(() => {
    if (!result) return;
    
    const text = formatResultForCopy(result, {
      gender: gender === 'male' ? '男' : '女',
      birthDate: `${year}年${month}月${day}日${isLunar ? '（农历）' : ''}`,
      birthTime: `${hour}时${minute}分`,
    });
    
    navigator.clipboard.writeText(text).then(() => {
      toast.success('已复制到剪贴板');
    }).catch(() => {
      toast.error('复制失败');
    });
  }, [result, gender, year, month, day, hour, minute, isLunar]);

  // 重置
  const handleReset = useCallback(() => {
    setSmartInput('');
    setYear(1990);
    setMonth(1);
    setDay(1);
    setHour(12);
    setMinute(0);
    setGender('male');
    setCity(DEFAULT_CITY);
    setIsLunar(false);
    setParseConfidence(0);
    setResult(null);
  }, []);

  return (
    <div className="min-h-screen relative">
      {/* 背景图 */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-30 pointer-events-none"
        style={{ backgroundImage: 'url(/images/hero-bg.jpg)' }}
      />
      
      {/* 主内容 */}
      <div className="relative z-10">
        {/* 头部 */}
        <header className="py-8 text-center">
          <div className="container">
            <div className="flex items-center justify-center gap-4 mb-4">
              <img 
                src="/images/bagua-symbol.png" 
                alt="八卦" 
                className="w-12 h-12 opacity-80"
              />
              <h1 className="text-3xl md:text-4xl font-bold tracking-wider" style={{ fontFamily: 'var(--font-serif)' }}>
                八字排盘分析
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              智能解析 · 精准排盘 · 专业分析
            </p>
          </div>
        </header>

        {/* 主体内容 */}
        <main className="container pb-16">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* 左侧：输入区 */}
            <div className="space-y-6">
              {/* 智能输入卡片 */}
              <Card className="card-shadow border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl" style={{ fontFamily: 'var(--font-serif)' }}>
                    <Sparkles className="w-5 h-5 text-accent" />
                    智能输入
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="请粘贴生辰信息，支持多种格式：&#10;• 1990年5月15日 10时30分 北京 男&#10;• 1990/5/15 10:30 北京&#10;• 90年5月15号上午10点半&#10;• 农历1990年四月廿一 巳时"
                    value={smartInput}
                    onChange={(e) => setSmartInput(e.target.value)}
                    className="min-h-[120px] bg-background/50 resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <Button 
                      onClick={handleSmartParse}
                      className="btn-seal"
                      variant="outline"
                    >
                      智能解析
                    </Button>
                    {parseConfidence > 0 && (
                      <span className="text-sm text-muted-foreground">
                        解析置信度：{parseConfidence}%
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 表单确认卡片 */}
              <Card className="card-shadow border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl" style={{ fontFamily: 'var(--font-serif)' }}>
                    信息确认
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 日历类型 */}
                  <div className="space-y-2">
                    <Label>日历类型</Label>
                    <RadioGroup 
                      value={isLunar ? 'lunar' : 'solar'} 
                      onValueChange={(v) => setIsLunar(v === 'lunar')}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="solar" id="solar" />
                        <Label htmlFor="solar" className="cursor-pointer">公历（阳历）</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="lunar" id="lunar" />
                        <Label htmlFor="lunar" className="cursor-pointer">农历（阴历）</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* 日期 */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>年</Label>
                      <Input
                        type="number"
                        min={1900}
                        max={2100}
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value) || 1990)}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>月</Label>
                      <Select value={String(month)} onValueChange={(v) => setMonth(parseInt(v))}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i + 1} value={String(i + 1)}>
                              {i + 1}月
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>日</Label>
                      <Select value={String(day)} onValueChange={(v) => setDay(parseInt(v))}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, i) => (
                            <SelectItem key={i + 1} value={String(i + 1)}>
                              {i + 1}日
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* 时间 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>时</Label>
                      <Select value={String(hour)} onValueChange={(v) => setHour(parseInt(v))}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem key={i} value={String(i)}>
                              {i}时
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>分</Label>
                      <Select value={String(minute)} onValueChange={(v) => setMinute(parseInt(v))}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 60 }, (_, i) => (
                            <SelectItem key={i} value={String(i)}>
                              {i}分
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* 性别和地区 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>性别</Label>
                      <RadioGroup 
                        value={gender} 
                        onValueChange={(v) => setGender(v as 'male' | 'female')}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="male" id="male" />
                          <Label htmlFor="male" className="cursor-pointer">男（乾造）</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="female" id="female" />
                          <Label htmlFor="female" className="cursor-pointer">女（坤造）</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="space-y-2">
                      <Label>出生地</Label>
                      <Select 
                        value={city.name} 
                        onValueChange={(v) => {
                          const found = CITIES.find(c => c.name === v);
                          if (found) setCity(found);
                        }}
                      >
                        <SelectTrigger className="bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {CITIES.map((c) => (
                            <SelectItem key={c.name} value={c.name}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  {/* 操作按钮 */}
                  <div className="flex gap-4">
                    <Button 
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="flex-1 bg-accent hover:bg-accent/90 text-white"
                    >
                      {isAnalyzing ? '分析中...' : '开始分析'}
                    </Button>
                    <Button 
                      onClick={handleReset}
                      variant="outline"
                      className="btn-seal"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      重置
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右侧：结果区 */}
            <div className="space-y-6">
              {result ? (
                <>
                  {/* 排盘信息卡片 */}
                  <Card className="card-shadow border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl" style={{ fontFamily: 'var(--font-serif)' }}>
                        八字排盘
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* 四柱展示 */}
                      <div className="grid grid-cols-4 gap-2 mb-6">
                        {['年柱', '月柱', '日柱', '时柱'].map((label, index) => (
                          <div key={label} className="text-center">
                            <div className="text-xs text-muted-foreground mb-2">{label}</div>
                            <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                              <div className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
                                {result.tianGan[index]}
                              </div>
                              <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)' }}>
                                {result.diZhi[index]}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 五行统计 */}
                      <div className="space-y-3">
                        <div className="text-sm font-medium">五行分布</div>
                        <div className="flex gap-2">
                          {(['金', '水', '木', '火', '土'] as const).map((wx) => (
                            <div 
                              key={wx}
                              className={`flex-1 text-center p-2 rounded-lg bg-background/50 border border-border/50`}
                            >
                              <div className={`text-lg font-bold ${WUXING_CLASS[wx]}`}>
                                {wx}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {result.wuxingCount[wx]}个
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 分析结果卡片 */}
                  <Card className="card-shadow border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <CardHeader className="pb-4 flex flex-row items-center justify-between">
                      <CardTitle className="text-xl" style={{ fontFamily: 'var(--font-serif)' }}>
                        分析结果
                      </CardTitle>
                      <Button 
                        onClick={handleCopy}
                        variant="outline"
                        size="sm"
                        className="btn-seal"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        复制结果
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {/* 核心信息 */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-3 bg-background/50 rounded-lg border border-border/50">
                          <div className="text-xs text-muted-foreground mb-1">日干</div>
                          <div className={`text-xl font-bold ${WUXING_CLASS[result.riGanWuxing]}`}>
                            {result.riGan}（{result.riGanWuxing}）
                          </div>
                        </div>
                        <div className="text-center p-3 bg-background/50 rounded-lg border border-border/50">
                          <div className="text-xs text-muted-foreground mb-1">旺衰</div>
                          <div className="text-xl font-bold">
                            {result.wangShuai}
                          </div>
                        </div>
                        <div className="text-center p-3 bg-background/50 rounded-lg border border-border/50">
                          <div className="text-xs text-muted-foreground mb-1">用神</div>
                          <div className={`text-xl font-bold ${WUXING_CLASS[result.yongShen]}`}>
                            {result.yongShen}
                          </div>
                        </div>
                        <div className="text-center p-3 bg-background/50 rounded-lg border border-border/50">
                          <div className="text-xs text-muted-foreground mb-1">喜神</div>
                          <div className={`text-xl font-bold ${WUXING_CLASS[result.xiShen[0]]}`}>
                            {result.xiShen.join('、')}
                          </div>
                        </div>
                      </div>

                      {/* 简洁文案（适合发送给顾客） */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">简洁文案（可直接发送给顾客）</span>
                          <Button
                            onClick={() => {
                              navigator.clipboard.writeText(result.simpleText).then(() => {
                                toast.success('简洁文案已复制');
                              });
                            }}
                            variant="ghost"
                            size="sm"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            复制
                          </Button>
                        </div>
                        <div className="bg-accent/5 rounded-lg p-4 border border-accent/20">
                          <p className="text-sm leading-relaxed">
                            {result.simpleText}
                          </p>
                        </div>
                      </div>

                      {/* 详细分析文案 */}
                      <div>
                        <div className="text-sm font-medium mb-2">详细分析</div>
                        <div className="bg-background/50 rounded-lg p-4 border border-border/50">
                          <pre className="whitespace-pre-wrap text-sm leading-relaxed" style={{ fontFamily: 'var(--font-sans)' }}>
                            {result.analysisText}
                          </pre>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                /* 空状态 */
                <Card className="card-shadow border-border/50 bg-card/80 backdrop-blur-sm h-full min-h-[400px] flex items-center justify-center">
                  <CardContent className="text-center py-16">
                    <img 
                      src="/images/wuxing-elements.png" 
                      alt="五行" 
                      className="w-48 h-48 mx-auto mb-6 opacity-60"
                    />
                    <p className="text-muted-foreground text-lg mb-2">
                      请输入生辰信息
                    </p>
                    <p className="text-muted-foreground text-sm">
                      支持智能解析多种格式的文本
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>

        {/* 页脚 */}
        <footer className="py-6 border-t border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="container text-center text-sm text-muted-foreground">
            <p>八字排盘分析工具 · 仅供参考娱乐</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
