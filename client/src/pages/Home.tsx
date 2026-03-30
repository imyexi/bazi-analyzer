import { useCallback, useState } from "react";
import { Copy, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { analyzeBazi, formatResultForCopy, WUXING_CLASS, type BaziAnalysisResult } from "@/lib/baziAnalyzer";
import { CITIES, DEFAULT_CITY, findCity, type CityInfo } from "@/lib/cityData";
import { fatemaps, lunarToSolar } from "@/lib/paipanWrapper";
import { parseBirthInfo } from "@/lib/textParser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const PILLAR_LABELS = ["年柱", "月柱", "日柱", "时柱"] as const;
const WUXING_LIST = ["金", "水", "木", "火", "土"] as const;

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall back for HTTP pages or browsers that block the Clipboard API.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.left = "-9999px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

export default function Home() {
  const assetBase = import.meta.env.BASE_URL;
  const assetUrl = (file: string) => `${assetBase}${file.startsWith("/") ? file.slice(1) : file}`;

  const [smartInput, setSmartInput] = useState("");
  const [year, setYear] = useState<number>(1990);
  const [month, setMonth] = useState<number>(1);
  const [day, setDay] = useState<number>(1);
  const [hour, setHour] = useState<number>(12);
  const [minute, setMinute] = useState<number>(0);
  const [gender, setGender] = useState<"male" | "female">("female");
  const [city, setCity] = useState<CityInfo>(DEFAULT_CITY);
  const [isLunar, setIsLunar] = useState(false);
  const [parseConfidence, setParseConfidence] = useState<number>(0);
  const [result, setResult] = useState<BaziAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSmartParse = useCallback(() => {
    if (!smartInput.trim()) {
      toast.error("请输入生辰信息");
      return;
    }

    const parsed = parseBirthInfo(smartInput);

    if (parsed.year) setYear(parsed.year);
    if (parsed.month) setMonth(parsed.month);
    if (parsed.day) setDay(parsed.day);

    if (parsed.hour !== undefined) {
      setHour(parsed.hour);
      setMinute(parsed.minute ?? 0);
    } else {
      setHour(12);
      setMinute(0);
    }

    setGender(parsed.gender ?? "female");
    setIsLunar(Boolean(parsed.isLunar));

    if (parsed.location) {
      const matchedCity = findCity(parsed.location);
      if (matchedCity) setCity(matchedCity);
    }

    setParseConfidence(parsed.confidence);

    if (parsed.confidence >= 75) {
      toast.success("解析成功，请确认信息");
    } else if (parsed.confidence >= 50) {
      toast.warning("已识别部分信息，请补充完善");
    } else {
      toast.error("解析结果不完整，请手动补全");
    }
  }, [smartInput]);

  const handleAnalyze = useCallback(() => {
    setIsAnalyzing(true);

    try {
      let actualYear = year;
      let actualMonth = month;
      let actualDay = day;

      if (isLunar) {
        const solarDate = lunarToSolar(year, month, day);
        if (!solarDate) {
          toast.error("农历转换失败，请检查日期");
          setIsAnalyzing(false);
          return;
        }

        [actualYear, actualMonth, actualDay] = solarDate;
      }

      const paipanResult = fatemaps(
        gender === "male" ? 0 : 1,
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
        toast.error("排盘失败，请检查输入信息");
        setIsAnalyzing(false);
        return;
      }

      setResult(analyzeBazi(paipanResult));
      toast.success("分析完成");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("分析过程中出现错误");
    } finally {
      setIsAnalyzing(false);
    }
  }, [city, day, gender, hour, isLunar, minute, month, year]);

  const handleCopy = useCallback(() => {
    if (!result) return;

    const text = formatResultForCopy(result, {
      gender: gender === "male" ? "男" : "女",
      birthDate: `${year}年${month}月${day}日${isLunar ? "（农历）" : ""}`,
      birthTime: `${hour}时${minute}分`,
    });

    void copyText(text).then((copied) => {
      if (copied) {
        toast.success("结果已复制到剪贴板");
        return;
      }

      toast.error("复制失败，请手动长按或选择文本复制");
    });
  }, [day, gender, hour, isLunar, minute, month, result, year]);

  const handleCopyColorAdvice = useCallback(() => {
    if (!result) return;

    void copyText(result.colorAdvice).then((copied) => {
      if (copied) {
        toast.success("颜色建议已复制");
        return;
      }

      toast.error("复制失败，请手动长按或选择文本复制");
    });
  }, [result]);

  const handleReset = useCallback(() => {
    setSmartInput("");
    setYear(1990);
    setMonth(1);
    setDay(1);
    setHour(12);
    setMinute(0);
    setGender("female");
    setCity(DEFAULT_CITY);
    setIsLunar(false);
    setParseConfidence(0);
    setResult(null);
  }, []);

  return (
    <div className="min-h-screen relative">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-30 pointer-events-none"
        style={{ backgroundImage: `url(${assetUrl("images/hero-bg.jpg")})` }}
      />

      <div className="relative z-10">
        <header className="py-8 text-center">
          <div className="container">
            <div className="flex items-center justify-center gap-4 mb-4">
              <img src={assetUrl("images/logo.png")} alt="圆圆如意" className="w-12 h-12" />
              <h1 className="text-3xl md:text-4xl font-bold tracking-wider" style={{ fontFamily: "var(--font-serif)" }}>
                圆圆如意五行喜用神分析工具
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              内部工具，请勿外传。结果基于本地排盘与规则分析，仅供学习参考。
            </p>
          </div>
        </header>

        <main className="container pb-16">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card className="card-shadow border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl" style={{ fontFamily: "var(--font-serif)" }}>
                    <Sparkles className="w-5 h-5 text-accent" />
                    智能输入
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder={"请输入出生信息，支持：\n1990年5月15日 10:30 北京 女\n19900515 10:30 北京\n农历1990年四月初一 巳时"}
                    value={smartInput}
                    onChange={event => setSmartInput(event.target.value)}
                    className="min-h-[120px] bg-background/50 resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <Button onClick={handleSmartParse} className="btn-seal" variant="outline">
                      智能解析
                    </Button>
                    {parseConfidence > 0 && (
                      <span className="text-sm text-muted-foreground">解析置信度：{parseConfidence}%</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-shadow border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl" style={{ fontFamily: "var(--font-serif)" }}>
                    信息确认
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>历法类型</Label>
                    <RadioGroup
                      value={isLunar ? "lunar" : "solar"}
                      onValueChange={value => setIsLunar(value === "lunar")}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="solar" id="solar" />
                        <Label htmlFor="solar" className="cursor-pointer">
                          公历（阳历）
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="lunar" id="lunar" />
                        <Label htmlFor="lunar" className="cursor-pointer">
                          农历（阴历）
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>年</Label>
                      <Input
                        type="number"
                        min={1900}
                        max={2100}
                        value={year}
                        onChange={event => setYear(parseInt(event.target.value, 10) || 1990)}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>月</Label>
                      <Select value={String(month)} onValueChange={value => setMonth(parseInt(value, 10))}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, index) => (
                            <SelectItem key={index + 1} value={String(index + 1)}>
                              {index + 1}月
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>日</Label>
                      <Select value={String(day)} onValueChange={value => setDay(parseInt(value, 10))}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, index) => (
                            <SelectItem key={index + 1} value={String(index + 1)}>
                              {index + 1}日
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>时</Label>
                      <Select value={String(hour)} onValueChange={value => setHour(parseInt(value, 10))}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, index) => (
                            <SelectItem key={index} value={String(index)}>
                              {index}时
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>分</Label>
                      <Select value={String(minute)} onValueChange={value => setMinute(parseInt(value, 10))}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 60 }, (_, index) => (
                            <SelectItem key={index} value={String(index)}>
                              {index}分
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>性别</Label>
                      <RadioGroup
                        value={gender}
                        onValueChange={value => setGender(value as "male" | "female")}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="male" id="male" />
                          <Label htmlFor="male" className="cursor-pointer">
                            男
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="female" id="female" />
                          <Label htmlFor="female" className="cursor-pointer">
                            女
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="space-y-2">
                      <Label>出生地</Label>
                      <Select
                        value={city.name}
                        onValueChange={value => {
                          const matched = CITIES.find(item => item.name === value);
                          if (matched) setCity(matched);
                        }}
                      >
                        <SelectTrigger className="bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {CITIES.map(item => (
                            <SelectItem key={item.name} value={item.name}>
                              {item.name}（{item.province}）
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex gap-4">
                    <Button onClick={handleAnalyze} disabled={isAnalyzing} className="flex-1 bg-accent hover:bg-accent/90 text-white">
                      {isAnalyzing ? "分析中..." : "开始分析"}
                    </Button>
                    <Button onClick={handleReset} variant="outline" className="btn-seal">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      重置
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-shadow border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg" style={{ fontFamily: "var(--font-serif)" }}>
                    五行生克图
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <img src={assetUrl("images/wuxing-cycle.png")} alt="五行生克图" className="max-w-[280px] w-full" />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {result ? (
                <>
                  <Card className="card-shadow border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl" style={{ fontFamily: "var(--font-serif)" }}>
                        八字排盘
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-2 mb-6">
                        {PILLAR_LABELS.map((label, index) => (
                          <div key={label} className="text-center">
                            <div className="text-xs text-muted-foreground mb-2">{label}</div>
                            <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                              <div className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-serif)" }}>
                                {result.tianGan[index]}
                              </div>
                              <div className="text-2xl font-bold" style={{ fontFamily: "var(--font-serif)" }}>
                                {result.diZhi[index]}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3">
                        <div className="text-sm font-medium">五行分布</div>
                        <div className="flex gap-2">
                          {WUXING_LIST.map(element => (
                            <div key={element} className="flex-1 text-center p-2 rounded-lg bg-background/50 border border-border/50">
                              <div className={`text-lg font-bold ${WUXING_CLASS[element]}`}>{element}</div>
                              <div className="text-sm text-muted-foreground">{result.wuxingCount[element]}个</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-shadow border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in" style={{ animationDelay: "0.2s" }}>
                    <CardHeader className="pb-4 flex flex-row items-center justify-between">
                      <CardTitle className="text-xl" style={{ fontFamily: "var(--font-serif)" }}>
                        分析结果
                      </CardTitle>
                      <Button onClick={handleCopy} variant="outline" size="sm" className="btn-seal">
                        <Copy className="w-4 h-4 mr-2" />
                        复制全部
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-3 bg-background/50 rounded-lg border border-border/50">
                          <div className="text-xs text-muted-foreground mb-1">日干</div>
                          <div className={`text-xl font-bold ${WUXING_CLASS[result.riGanWuxing]}`}>
                            {result.riGan}（{result.riGanWuxing}）
                          </div>
                        </div>
                        <div className="text-center p-3 bg-background/50 rounded-lg border border-border/50">
                          <div className="text-xs text-muted-foreground mb-1">旺衰</div>
                          <div className="text-xl font-bold">{result.wangShuai}</div>
                        </div>
                        <div className="text-center p-3 bg-background/50 rounded-lg border border-border/50">
                          <div className="text-xs text-muted-foreground mb-1">用神</div>
                          <div className={`text-xl font-bold ${WUXING_CLASS[result.yongShen]}`}>{result.yongShen}</div>
                        </div>
                        <div className="text-center p-3 bg-background/50 rounded-lg border border-border/50">
                          <div className="text-xs text-muted-foreground mb-1">喜神</div>
                          <div className={`text-xl font-bold ${result.xiShen[0] ? WUXING_CLASS[result.xiShen[0]] : ""}`}>
                            {result.xiShen.join("、")}
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">简洁文案（可直接发送给客户）</span>
                          <Button
                            onClick={() => {
                              void copyText(result.simpleText).then((copied) => {
                                if (copied) {
                                  toast.success("简洁文案已复制");
                                  return;
                                }

                                toast.error("复制失败，请手动长按或选择文本复制");
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
                          <p className="text-sm leading-relaxed">{result.simpleText}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">颜色推荐</span>
                          <Button onClick={handleCopyColorAdvice} variant="ghost" size="sm">
                            <Copy className="w-3 h-3 mr-1" />
                            复制
                          </Button>
                        </div>
                        <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                          <p className="text-sm leading-relaxed">{result.colorAdvice}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="text-sm font-medium mb-2">取用逻辑</div>
                        <div className="bg-background/50 rounded-lg p-4 border border-border/50 space-y-3">
                          <p className="text-sm leading-relaxed">{result.decisionSummary}</p>

                          <div className="space-y-2">
                            {result.yongShenReport.map(item => (
                              <div
                                key={`${item.title}-${item.element ?? "none"}`}
                                className={`rounded-lg border p-3 ${
                                  item.kind === "selected"
                                    ? "border-accent/40 bg-accent/5"
                                    : item.kind === "misjudgment"
                                      ? "border-amber-300/40 bg-amber-50/40"
                                      : "border-border/50 bg-card/40"
                                }`}
                              >
                                <div className="text-sm font-medium mb-1">
                                  {item.title}
                                  {item.element ? `：${item.element}` : ""}
                                </div>
                                <p className="text-sm leading-relaxed">{item.body}</p>
                              </div>
                            ))}
                          </div>

                          <div className="space-y-2">
                            {result.yongShenCandidates.map(candidate => (
                              <div
                                key={candidate.element}
                                className={`rounded-lg border p-3 ${
                                  candidate.selected ? "border-accent/40 bg-accent/5" : "border-border/50 bg-card/40"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-3 mb-1">
                                  <div className="text-sm font-medium">
                                    {candidate.selected ? "主用" : "备选"}：{candidate.element}
                                  </div>
                                  <div className="text-xs text-muted-foreground">评分 {candidate.score}</div>
                                </div>
                                <p className="text-sm leading-relaxed">{candidate.reason}</p>
                                {!candidate.selected && candidate.rejectionReason && (
                                  <p className="text-xs text-muted-foreground mt-1">{candidate.rejectionReason}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium mb-2">详细分析</div>
                        <div className="bg-background/50 rounded-lg p-4 border border-border/50">
                          <pre className="whitespace-pre-wrap text-sm leading-relaxed" style={{ fontFamily: "var(--font-sans)" }}>
                            {result.analysisText}
                          </pre>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="card-shadow border-border/50 bg-card/80 backdrop-blur-sm h-full min-h-[400px] flex items-center justify-center">
                  <CardContent className="text-center py-16">
                    <img src={assetUrl("images/wuxing-elements.png")} alt="五行" className="w-48 h-48 mx-auto mb-6 opacity-60" />
                    <p className="text-muted-foreground text-lg mb-2">请输入生辰信息</p>
                    <p className="text-muted-foreground text-sm">支持智能解析多种格式的文本</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>

        <footer className="py-6 border-t border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="container text-center text-sm text-muted-foreground">
            <p>© 2026 圆圆如意. All Rights Reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
