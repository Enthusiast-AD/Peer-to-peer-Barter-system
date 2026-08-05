import { prisma } from '../db/index.js';

const SITE_URL = process.env.SITE_URL || 'https://peersy.vercel.app';

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function rssHeader(title, description, link, selfHref) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapeXml(title)}</title>`,
    `    <link>${escapeXml(link)}</link>`,
    `    <description>${escapeXml(description)}</description>`,
    `    <atom:link href="${escapeXml(selfHref)}" rel="self" type="application/rss+xml"/>`,
    `    <language>en</language>`,
    `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
  ].join('\n');
}

function rssItem(item) {
  return [
    '    <item>',
    `      <title>${escapeXml(item.title)}</title>`,
    `      <link>${escapeXml(item.link)}</link>`,
    `      <guid isPermaLink="false">${escapeXml(item.guid)}</guid>`,
    `      <description>${escapeXml(item.description)}</description>`,
    `      <author>${escapeXml(item.author)}</author>`,
    `      <category>${escapeXml(item.category)}</category>`,
    `      <pubDate>${item.pubDate}</pubDate>`,
    '    </item>',
  ].join('\n');
}

/**
 * RSS feed of the latest skills listed on the platform.
 * Public endpoint - no auth required. Serves dynamic, fresh content to
 * feed readers and can be referenced from the site head.
 */
export const skillsRssFeed = async (req, res) => {
  try {
    const skills = await prisma.skill.findMany({
      include: {
        user: {
          select: { id: true, name: true, bio: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const items = skills.map((skill) => {
      const name = skill.user?.name || 'A member';
      const bio = skill.user?.bio?.trim()
        ? ` ${skill.user.bio.trim()}`
        : '';
      return {
        title: `${name} is offering ${skill.name}`,
        link: SITE_URL,
        guid: `${skill.id}@skills`,
        description: `Peersy member ${name} is offering to teach "${skill.name}" (${skill.category || 'General'} skill).${bio}`,
        author: name,
        category: skill.category || 'Skill',
        pubDate: skill.createdAt.toUTCString(),
      };
    });

    const feed = [
      rssHeader(
        'Peersy - Latest Skills',
        'Newly listed skills on Peersy, the free peer-to-peer skill barter platform for students.',
        SITE_URL,
        `${req.protocol}://${req.get('host')}/api/feeds/skills.rss`
      ),
      ...items.map(rssItem),
      '  </channel>',
      '</rss>',
    ].join('\n');

    res
      .status(200)
      .set('Content-Type', 'application/rss+xml; charset=utf-8')
      .set('Cache-Control', 'public, max-age=900, s-maxage=900')
      .send(feed);
  } catch (error) {
    console.error('Failed to generate RSS feed:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
