import React from 'react';
import { HelpCircle, CheckCircle, FileCode, ArrowRight } from 'lucide-react';
import { Language } from '../types';
import { UI_TEXT } from '../data/translations';

interface QuickGuideCardProps {
  lang: Language;
}

export const QuickGuideCard: React.FC<QuickGuideCardProps> = ({ lang }) => {
  const t = UI_TEXT[lang];

  const guideItems = [
    {
      soft: 'AutoCAD (.lsp)',
      color: '#E53E3E',
      ruleBn: 'APPLOAD কমান্ড লিখে ফাইলটি Load করুন। প্রতিটি প্রজেক্টে অটো-লোড করতে "Startup Suite" (স্যুটকেস আইকনে) যুক্ত করুন।',
      ruleEn: 'Type APPLOAD command and load file. To auto-load on every drawing, add to "Startup Suite" (Briefcase icon).',
    },
    {
      soft: 'SketchUp (.rbz)',
      color: '#0284C7',
      ruleBn: 'Extensions > Extension Manager-এ গিয়ে "Install Extension" বাটনে ক্লিক করে ফাইলটি দিন। ইনস্টল সাথে সাথে কার্যকর হয়।',
      ruleEn: 'Go to Extensions > Extension Manager, click "Install Extension" button, and pick the .rbz file.',
    },
    {
      soft: 'Revit (.dyn)',
      color: '#0D9488',
      ruleBn: 'Manage Tab > Dynamo Player খুলুন। ডাউনলোড করা ফোল্ডারটি লিঙ্ক করে প্লে বাটনে ক্লিক করুন।',
      ruleEn: 'Go to Manage Tab > Dynamo Player. Browse to your script folder and run directly with the play button.',
    },
    {
      soft: 'Civil 3D (.lsp)',
      color: '#D97706',
      ruleBn: 'APPLOAD কমান্ড দিয়ে রান করুন অথবা ড্রয়িং স্ক্রিনে .lsp ফাইলটি সরাসরি মাউস দিয়ে Drag & Drop করুন।',
      ruleEn: 'Run with APPLOAD command or directly drag & drop the .lsp file into your Civil 3D model viewport.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs transition-colors">
      <div className="flex items-center gap-2 mb-1">
        <HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {t.quickGuideTitle}
        </h3>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        {t.quickGuideSubtitle}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {guideItems.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs space-y-1.5"
          >
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.soft}</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {lang === 'bn' ? item.ruleBn : item.ruleEn}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
