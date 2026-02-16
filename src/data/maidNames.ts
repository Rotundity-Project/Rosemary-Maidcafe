import { MaidPersonality } from '@/types';

export const maidFirstNames: string[] = [
  '樱', '雪', '月', '花', '星',
  '铃', '美', '优', '爱', '心',
  '梦', '光', '风', '雨', '云',
  '琴', '诗', '画', '舞', '歌',
  '莉', '娜', '菲', '艾', '露',
  '蓝', '紫', '红', '白', '黑',
];

export const maidLastNames: string[] = [
  '野', '川', '山', '森', '原',
  '宫', '城', '桥', '井', '田',
  '木', '林', '的', '海', '空',
];

export const personalityDescriptions: Record<MaidPersonality, string> = {
  cheerful: '开朗活泼，总是带着笑容',
  cool: '冷静沉着，做事有条不紊',
  shy: '害羞内向，但服务细心',
  energetic: '精力充沛，行动迅速',
  elegant: '优雅端庄，举止得体',
  gentle: '温柔体贴，关怀备至',
  playful: '俏皮可爱，活泼有趣',
};

export const personalityStatBonuses: Record<MaidPersonality, { charm: number; skill: number; stamina: number; speed: number }> = {
  cheerful: { charm: 10, skill: 0, stamina: 5, speed: 5 },
  cool: { charm: 5, skill: 10, stamina: 5, speed: 0 },
  shy: { charm: 0, skill: 5, stamina: 10, speed: 5 },
  energetic: { charm: 5, skill: 5, stamina: 0, speed: 10 },
  elegant: { charm: 15, skill: 5, stamina: 0, speed: 0 },
  gentle: { charm: 8, skill: 5, stamina: 8, speed: 4 },
  playful: { charm: 12, skill: 3, stamina: 3, speed: 7 },
};

export const hireCostByLevel: number[] = [
  80,   // Level 1 - 降低20%
  150,  // Level 2 - 降低25%
  250,  // Level 3 - 降低29%
  400,  // Level 4 - 降低27%
  600,  // Level 5 - 降低25%
];

export const dailyWageByLevel: number[] = [
  15,   // Level 1 - 降低25%
  25,   // Level 2 - 降低29%
  40,   // Level 3 - 降低27%
  60,   // Level 4 - 降低25%
  85,   // Level 5 - 降低23%
];
