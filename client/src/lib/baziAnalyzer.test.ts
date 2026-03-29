import { describe, expect, it } from "vitest";
import { analyzeBazi } from "./baziAnalyzer";

function makePaipan(ctg: string[], cdz: string[]) {
  return {
    ctg,
    cdz,
    sz: ctg.map((gan, index) => `${gan}${cdz[index]}`),
  };
}

describe("baziAnalyzer", () => {
  it("marks cold winter charts with a fire climate adjustment", () => {
    const result = analyzeBazi(makePaipan(["癸", "壬", "壬", "癸"], ["亥", "子", "亥", "丑"]));

    expect(result.needTiaoHou).toBe(true);
    expect(result.tiaoHouWuxing).toBe("火");
    expect(result.analysisPrinciples).toContain("调候");
    expect([result.yongShen, ...result.xiShen]).toContain("火");
    expect(result.yongShenReport.some(item => item.title === "第一候选")).toBe(true);
    expect(result.yongShenReport.some(item => item.title === "常见误判")).toBe(true);
  });

  it("detects tongguan when water and fire clash without wood", () => {
    const result = analyzeBazi(makePaipan(["丙", "壬", "戊", "丁"], ["午", "子", "午", "子"]));

    expect(result.needTongGuan).toBe(true);
    expect(result.tongGuanWuxing).toBe("木");
    expect(result.analysisPrinciples).toContain("通关");
    expect([result.yongShen, ...result.xiShen]).toContain("木");
  });

  it("identifies strict cong-weak tendency on rootless metal-heavy charts", () => {
    const result = analyzeBazi(makePaipan(["庚", "庚", "甲", "戊"], ["申", "申", "酉", "辰"]));

    expect(result.pattern).toBe("从弱倾向");
    expect(result.analysisPrinciples).toContain("从弱");
    expect(["金", "土", "火"]).toContain(result.yongShen);
  });

  it("does not force cong-weak when the day master still has root and seal", () => {
    const result = analyzeBazi(makePaipan(["庚", "辛", "甲", "癸"], ["申", "酉", "寅", "子"]));

    expect(result.pattern).toBe("常规格局");
    expect(result.analysisPrinciples).not.toContain("从弱");
    expect(["水", "木"]).toContain(result.yongShen);
  });
});
