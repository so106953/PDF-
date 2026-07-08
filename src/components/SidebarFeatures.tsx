import React, { useState } from 'react';
import { Sparkles, Calendar, Crop, Copy, ExternalLink, HelpCircle, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SidebarFeatures() {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  const features = [
    {
      icon: <Calendar className="w-5 h-5 text-on-tertiary-container" />,
      bgClass: 'bg-tertiary-container/35',
      title: '自动日期排序',
      desc: '智能识别并提取每张发票中的开票日期，一键按时间先后顺序自动对齐，免去人手拖拽调整的繁琐步骤。',
      details: '支持标准增值税专用发票、电子行程单以及各类海外收据的智能 OCR 识别。'
    },
    {
      icon: <Crop className="w-5 h-5 text-on-secondary-container" />,
      bgClass: 'bg-secondary-container/35',
      title: '智能裁剪与对齐',
      desc: '对手机拍摄的发票照片进行智能边缘检测、倾斜校正和透视裁剪，自动去除多余桌面背景。',
      details: '算法将自动提升文本对比度，压缩并黑白化背景以优化 PDF 生成质量及体积。'
    },
    {
      icon: <Copy className="w-5 h-5 text-outline" />,
      bgClass: 'bg-surface-container-highest',
      title: '重复查重安全拦截',
      desc: '提取发票代码与号码（或收据唯一凭证ID），上传时自动与历史记录及当前队列重叠比对。',
      details: '遇到重复文件会发出高亮警报，从源头上预防同一张发票发生二次重复报销的财税风险。'
    }
  ];

  return (
    <aside className="space-y-6">
      
      {/* Smart Features card */}
      <div className="bg-surface-container p-6 rounded-2xl border border-outline-variant/50">
        <h3 className="font-display text-lg font-bold text-primary mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 animate-pulse" />
          智能云端引擎
        </h3>
        
        <ul className="space-y-4">
          {features.map((item, index) => (
            <li 
              key={index} 
              className="p-3 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer group"
              onClick={() => setActiveFeature(activeFeature === index ? null : index)}
            >
              <div className="flex gap-4">
                <div className={`flex-shrink-0 w-10 h-10 ${item.bgClass} rounded-xl flex items-center justify-center transition-transform group-hover:scale-105`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-on-surface flex items-center justify-between text-sm">
                    {item.title}
                    <HelpCircle className="w-3.5 h-3.5 text-on-surface-variant opacity-60 group-hover:opacity-100" />
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>

              <AnimatePresence>
                {activeFeature === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginTop: 8 }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden bg-surface-container-lowest/80 p-3 rounded-lg border border-outline-variant/40"
                  >
                    <p className="text-xs text-primary font-medium leading-relaxed">
                      {item.details}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          ))}
        </ul>
      </div>

      {/* Campaign / Workspace Guide Banner */}
      <div className="relative overflow-hidden rounded-2xl h-48 group shadow-sm">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC12R2qweY7fkoKso0-B3VuH7haLNtRN7_uRoksANddOkjQvWxBfAANuCy8HBgb3iOS-mbB_RwHRhwmdANbhixYPC9OWtxzWa-fjIZxY1UpUyEw12Us0FmOOMd-MVfsJNN86bNbEZm1D04vJZhwB7IlOzNb6E_E1dnlQy_wURcxH6zq5CMshBLrgaazlZQTutZ5Sj_62rRP7isjtdyCMNkdoRIw0NZh8C12D_EY7pQYORrEG-Jnb9YJIqGHx_8YkATJpr6MmJu9Oyo')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent flex flex-col justify-end p-5">
          <p className="text-on-primary font-display text-base font-bold leading-snug drop-shadow-sm">
            查看如何高效管理你的发票报销流程
          </p>
          <p className="text-[11px] text-primary-fixed-dim/90 font-medium mt-1 flex items-center gap-1">
            了解企业差旅及财税合规的最佳实践
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>
      </div>

      {/* Security note card */}
      <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/40 text-center space-y-3">
        <div className="inline-flex items-center justify-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          数据隐私双重盾牌
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed px-2">
          所有发票在合并下载完成后，或退出合并标签页后即刻在本地及内存中完全销毁。我们严格遵守 GDPR 规范，绝不保留、存储或审查任何财务报销文件。
        </p>
      </div>

    </aside>
  );
}
