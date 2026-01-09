import { Maid } from '@/types';

/**
 * 女仆图片池 - 所有可用的女仆头像图片
 * 来自 public/maid-image/ 目录
 */
export const maidImagePool: string[] = [
  '/maid-image/0064.jpg',
  '/maid-image/04d5.jpg',
  '/maid-image/0600.jpg',
  '/maid-image/087a.jpg',
  '/maid-image/095c.jpg',
  '/maid-image/0a04.jpg',
  '/maid-image/0a8f.jpg',
  '/maid-image/0bf8.jpg',
  '/maid-image/0bfc.jpg',
  '/maid-image/0d23.jpg',
  '/maid-image/131b.jpg',
  '/maid-image/1359.jpg',
  '/maid-image/1719.jpg',
  '/maid-image/1887.jpg',
  '/maid-image/1c6a.jpg',
  '/maid-image/1c77.jpg',
  '/maid-image/1c9b.jpg',
  '/maid-image/1dff.jpg',
  '/maid-image/29bf.jpg',
  '/maid-image/2f8a.jpg',
  '/maid-image/303e.jpg',
  '/maid-image/31c3.jpg',
  '/maid-image/31e9.jpg',
  '/maid-image/347d.jpg',
  '/maid-image/371b.jpg',
  '/maid-image/3ace.jpg',
  '/maid-image/3b04.jpg',
  '/maid-image/3b6a.jpg',
  '/maid-image/3dfb.jpg',
  '/maid-image/4864.jpg',
  '/maid-image/4b43.jpg',
  '/maid-image/4dec.jpg',
  '/maid-image/4df3.jpg',
  '/maid-image/50e6.jpg',
  '/maid-image/526e.jpg',
  '/maid-image/52b2.jpg',
  '/maid-image/56c0.jpg',
  '/maid-image/5865.jpg',
  '/maid-image/58c7.jpg',
  '/maid-image/596a.jpg',
  '/maid-image/5a5a.jpg',
  '/maid-image/5af7.jpg',
  '/maid-image/5e65.jpg',
  '/maid-image/5eb6.jpg',
  '/maid-image/6078.jpg',
  '/maid-image/607c.jpg',
  '/maid-image/60ca.jpg',
  '/maid-image/618e.jpg',
  '/maid-image/6306.jpg',
  '/maid-image/6474.jpg',
  '/maid-image/65aa.jpg',
  '/maid-image/6620.jpg',
  '/maid-image/66c3.jpg',
  '/maid-image/68e7.jpg',
  '/maid-image/6dd7.jpg',
  '/maid-image/6e95.jpg',
  '/maid-image/6ee2.jpg',
  '/maid-image/7589.jpg',
  '/maid-image/76c0.jpg',
  '/maid-image/77a3.jpg',
  '/maid-image/7c3d.jpg',
  '/maid-image/7c4f.jpg',
  '/maid-image/7c5a.jpg',
  '/maid-image/7e3d.jpg',
  '/maid-image/7e44.jpg',
  '/maid-image/7e98.jpg',
  '/maid-image/7ff9.jpg',
  '/maid-image/8040.jpg',
  '/maid-image/844e.jpg',
  '/maid-image/8ad2.jpg',
  '/maid-image/8b16.jpg',
  '/maid-image/8b58.jpg',
  '/maid-image/8c52.jpg',
  '/maid-image/8c81.jpg',
  '/maid-image/8d18.jpg',
  '/maid-image/9006.jpg',
  '/maid-image/9035.jpg',
  '/maid-image/91be.jpg',
  '/maid-image/92e6.jpg',
  '/maid-image/93e7.jpg',
  '/maid-image/9492.jpg',
  '/maid-image/9550.jpg',
  '/maid-image/9586.jpg',
  '/maid-image/9ae6.jpg',
  '/maid-image/9b81.jpg',
  '/maid-image/9ba9.jpg',
  '/maid-image/9c28.jpg',
  '/maid-image/9fe9.jpg',
  '/maid-image/a25a.jpg',
  '/maid-image/a3d3.jpg',
  '/maid-image/a73a.jpg',
  '/maid-image/aa06.jpg',
  '/maid-image/aa5a.jpg',
  '/maid-image/ab2b.jpg',
  '/maid-image/ad92.jpg',
  '/maid-image/ae11.jpg',
  '/maid-image/aed3.jpg',
  '/maid-image/afde.jpg',
  '/maid-image/b04c.jpg',
  '/maid-image/b1ab.jpg',
  '/maid-image/b286.jpg',
  '/maid-image/b2f0.jpg',
  '/maid-image/b67f.jpg',
  '/maid-image/b8e6.jpg',
  '/maid-image/b944.jpg',
  '/maid-image/bbf2.jpg',
  '/maid-image/bdeb.jpg',
  '/maid-image/bdef.jpg',
  '/maid-image/c560.jpg',
  '/maid-image/c5a1.jpg',
  '/maid-image/c625.jpg',
  '/maid-image/c9e6.jpg',
  '/maid-image/cb37.jpg',
  '/maid-image/cb50.jpg',
  '/maid-image/cd77.jpg',
  '/maid-image/ced4.jpg',
  '/maid-image/cfa0.jpg',
  '/maid-image/d0ee.jpg',
  '/maid-image/d231.jpg',
  '/maid-image/d280.jpg',
  '/maid-image/dd1a.jpg',
  '/maid-image/dfa8.jpg',
  '/maid-image/e094.jpg',
  '/maid-image/e0f8.jpg',
  '/maid-image/e10a.jpg',
  '/maid-image/e85c.jpg',
  '/maid-image/e96a.jpg',
  '/maid-image/ea2f.jpg',
  '/maid-image/eacc.jpg',
  '/maid-image/ec01.jpg',
  '/maid-image/ec65.jpg',
  '/maid-image/ecba.jpg',
  '/maid-image/ef28.jpg',
  '/maid-image/ef5e.jpg',
  '/maid-image/efd5.jpg',
  '/maid-image/f0ad.jpg',
  '/maid-image/f485.jpg',
  '/maid-image/f65f.jpg',
  '/maid-image/f68a.jpg',
  '/maid-image/f770.jpg',
  '/maid-image/f8b8.jpg',
  '/maid-image/f9a6.jpg',
  '/maid-image/fd8c.jpg',
  '/maid-image/fea8.jpg',
];

/**
 * 获取随机未使用的女仆图片
 * @param excludeImages 要排除的图片路径数组（已被使用的图片）
 * @returns 随机选择的图片路径
 * Requirements: 1.2
 */
export function getRandomMaidImage(excludeImages: string[] = []): string {
  const available = maidImagePool.filter(img => !excludeImages.includes(img));
  
  if (available.length === 0) {
    // 如果所有图片都用完了，从头开始随机选择
    return maidImagePool[Math.floor(Math.random() * maidImagePool.length)];
  }
  
  return available[Math.floor(Math.random() * available.length)];
}

/**
 * 获取所有已使用的女仆图片
 * @param maids 女仆数组
 * @returns 已使用的图片路径数组
 * Requirements: 1.3
 */
export function getAllUsedImages(maids: Maid[]): string[] {
  return maids.map(maid => maid.avatar);
}
