import { z } from 'zod';

export const SupportedLocales = ['en', 'bn'] as const;
export const SupportedLocaleSchema = z.enum(SupportedLocales);
export type SupportedLocale = z.infer<typeof SupportedLocaleSchema>;

export interface I18nDictionary {
  nav: {
    overview: string;
    profile: string;
    resumes: string;
    analyzeJob: string;
    applications: string;
    aiWriting: string;
    interviews: string;
    settings: string;
  };
  interviews: {
    title: string;
    subtitle: string;
    startMock: string;
    targetRoleLabel: string;
    focusLabel: string;
    starGuidance: string;
    evaluate: string;
    evaluating: string;
    nextQuestion: string;
    finishSession: string;
    overallRating: string;
    ethicalDisclaimer: string;
  };
  writing: {
    title: string;
    bulletImprover: string;
    summaryTailor: string;
    coverLetter: string;
    quotaRemaining: string;
  };
  applications: {
    title: string;
    saved: string;
    applied: string;
    screening: string;
    interviewing: string;
    offer: string;
    rejected: string;
  };
  settings: {
    title: string;
    language: string;
    selectLanguage: string;
    notifications: string;
    emailFollowUp: string;
    emailInterview: string;
    weeklyDigest: string;
    supportAccess: string;
    grantAccess: string;
    revokeAccess: string;
    supportAccessNotice: string;
    saveChanges: string;
  };
}

export const DICTIONARIES: Record<SupportedLocale, I18nDictionary> = {
  en: {
    nav: {
      overview: 'Overview',
      profile: 'Profile',
      resumes: 'Resumes',
      analyzeJob: 'Analyze job',
      applications: 'Applications',
      aiWriting: 'AI Writing',
      interviews: 'Interviews',
      settings: 'Settings',
    },
    interviews: {
      title: 'Mock Interview Preparation',
      subtitle: 'Practice text-based interview scenarios with real-time STAR rubric evaluation grounded in your verified career history.',
      startMock: 'Start Mock Practice Session',
      targetRoleLabel: 'Target Role',
      focusLabel: 'Interview Focus',
      starGuidance: 'Structure your answer using STAR: Situation, Task, Action, Result.',
      evaluate: 'Evaluate Answer',
      evaluating: 'Evaluating with STAR Rubric...',
      nextQuestion: 'Next Question →',
      finishSession: 'Finish Session →',
      overallRating: 'Overall Rating',
      ethicalDisclaimer: 'Objective feedback based strictly on structure, factual relevance, and evidence. Emotion or personality inference is explicitly excluded.',
    },
    writing: {
      title: 'AI Writing Studio',
      bulletImprover: 'Bullet Improver',
      summaryTailor: 'Summary Tailor',
      coverLetter: 'Evidence-Bound Cover Letter',
      quotaRemaining: 'Daily Quota Remaining',
    },
    applications: {
      title: 'Job Application Pipeline',
      saved: 'Saved',
      applied: 'Applied',
      screening: 'Screening',
      interviewing: 'Interviewing',
      offer: 'Offer',
      rejected: 'Rejected',
    },
    settings: {
      title: 'Account & Platform Settings',
      language: 'Language & Localization',
      selectLanguage: 'Choose your preferred platform language',
      notifications: 'Notification & Reminder Preferences',
      emailFollowUp: 'Email reminders for upcoming application follow-ups',
      emailInterview: 'Email alerts 24 hours prior to scheduled interviews',
      weeklyDigest: 'Weekly career progress digest and application metrics',
      supportAccess: 'Temporary Support-Access Approval',
      grantAccess: 'Grant Temporary Support Access (24 Hours)',
      revokeAccess: 'Revoke Active Support Access',
      supportAccessNotice: 'Platform admins and support agents cannot access your resume drafts or applications without an explicit, active support access grant.',
      saveChanges: 'Save Preferences',
    },
  },
  bn: {
    nav: {
      overview: 'ওভারভিউ',
      profile: 'প্রোফাইল',
      resumes: 'রিজিউমসমূহ',
      analyzeJob: 'চাকরি বিশ্লেষণ',
      applications: 'আবেদনসমূহ',
      aiWriting: 'এআই রাইটিং',
      interviews: 'ইন্টারভিউ প্রস্তুতি',
      settings: 'সেটিংস',
    },
    interviews: {
      title: 'মক ইন্টারভিউ প্রস্তুতি',
      subtitle: 'আপনার ক্যারিয়ার ইতিহাস ও নির্দিষ্ট চাকরির সাথে মিল রেখে রিয়েল-টাইম স্টার (STAR) রুব্রিকে টেক্সট ইন্টারভিউ অনুশীলন করুন।',
      startMock: 'নতুন মক সেশন শুরু করুন',
      targetRoleLabel: 'কাঙ্ক্ষিত পদবী',
      focusLabel: 'ইন্টারভিউ বিষয়',
      starGuidance: 'স্টার (STAR) কাঠামো মেনে উত্তর দিন: পরিস্থিতি (S), দায়িত্ব (T), পদক্ষেপ (A), ফলাফল (R)।',
      evaluate: 'উত্তর মূল্যায়ন করুন',
      evaluating: 'স্টার রুব্রিকে মূল্যায়ন করা হচ্ছে...',
      nextQuestion: 'পরবর্তী প্রশ্ন →',
      finishSession: 'সেশন শেষ করুন →',
      overallRating: 'সামগ্রিক রেটিং',
      ethicalDisclaimer: 'মূল্যায়নটি সম্পূর্ণভাবে বস্তুনিষ্ঠ এবং কাঠামোগত। আবেগ বা মানসিক চরিত্র অনুমান কঠোরভাবে বর্জিত।',
    },
    writing: {
      title: 'এআই রাইটিং স্টুডিও',
      bulletImprover: 'বুলেট পরিমার্জন',
      summaryTailor: 'সারাংশ তৈরি',
      coverLetter: 'প্রমাণ-ভিত্তিক কভার লেটার',
      quotaRemaining: 'দৈনিক অবশিষ্ট কোটা',
    },
    applications: {
      title: 'চাকরির আবেদন পাইপলাইন',
      saved: 'সংরক্ষিত',
      applied: 'আবেদিত',
      screening: 'প্রাথমিক যাচাই',
      interviewing: 'ইন্টারভিউ চলমান',
      offer: 'অফার প্রাপ্ত',
      rejected: 'প্রত্যাখ্যাত',
    },
    settings: {
      title: 'অ্যাকাউন্ট ও প্ল্যাটফর্ম সেটিংস',
      language: 'ভাষা ও স্থানীয়করণ',
      selectLanguage: 'আপনার পছন্দের ভাষা নির্বাচন করুন',
      notifications: 'বিজ্ঞপ্তি ও অনুস্মারক পছন্দসমূহ',
      emailFollowUp: 'আবেদনের ফলো-আপের জন্য ইমেইল অনুস্মারক',
      emailInterview: 'নির্ধারিত ইন্টারভিউয়ের ২৪ ঘণ্টা পূর্বে ইমেইল সতর্কতা',
      weeklyDigest: 'সাপ্তাহিক ক্যারিয়ার অগ্রগতি ও আবেদন রিপোর্ট',
      supportAccess: 'সাময়িক সাপোর্ট অনুমোদন',
      grantAccess: 'সাময়িক সাপোর্ট অনুমোদন দিন (২৪ ঘণ্টা)',
      revokeAccess: 'সাপোর্ট অনুমোদন বাতিল করুন',
      supportAccessNotice: 'আপনার সুস্পষ্ট ও সক্রিয় অনুমোদন ব্যতীত কোনো অ্যাডমিন বা সাপোর্ট এজেন্ট আপনার রিজিউম বা তথ্য দেখতে পারবেন না।',
      saveChanges: 'পছন্দসমূহ সংরক্ষণ করুন',
    },
  },
};

export function getDictionary(locale: SupportedLocale = 'en'): I18nDictionary {
  return DICTIONARIES[locale] || DICTIONARIES.en;
}
