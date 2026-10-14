import dayjs from 'dayjs';
import { load } from 'cheerio';
import { Bindings } from '../types/bindings';

const PARENT_CATEGORY_ID = 58;

const getter = async (url: string) => {
  url = url.startsWith('/') ? url : '/' + url;
  const response = await fetch(`https://docs.agenty.com${url}`, {
    headers: {
      'Api-Username': 'admin',
      'Api-Key':
        '9083764a1b793b7af47d50ba6375b5d899c5a6fbe7ffb8cc4aa3768d040fb9ab',
    },
    cf: {
      cacheTtl: 3600,
      cacheEverything: true,
    },
  });
  if (response && response.status == 200) {
    return (await response.json()) as any;
  }
};

export const getPost = async (env: Bindings, path: string) => {
  const slug = path + '/1000.json';
  const value = await env.KVCACHE.get(slug, {
    type: 'json',
    cacheTtl: 60 * 15,
  });
  if (value) return value;

  const json = await getter(slug);
  if (!json) return;
  json.post_stream.posts.map((post: any) => {
    const $ = load(post.cooked);
    // Add nofollow
    $('a').each(function (i, elem) {
      const url = $(this).attr('href');
      if (!url.startsWith('https://idm.in') && !url.startsWith('/')) {
        $(this).attr('rel', 'nofollow').attr('target', '_blank');
      }
    });
    $('p').first().addClass('bd-lead');

    $('code').each(function (i, elem) {
      $(this).removeClass('lang-auto');
    });

    post.description = $('p').first().text();
    post.html = $('body').html();
    post.prettyDate = dayjs(post.created_at).format('ll');
    post.image =
      $('img').first().attr('src') ||
      post.image_url ||
      'https://idm.in/static/img/logo.png';
  });
  await env.KVCACHE.put(slug, JSON.stringify(json), {
    expirationTtl: 60 * 60 * 24,
  });
  return json;
};

export const getLatestTopics = async (env: Bindings) => {
  const slug = `latest.json?category=${PARENT_CATEGORY_ID}&order=created`;
  const value = await env.KVCACHE.get(slug, {
    type: 'json',
    cacheTtl: 60 * 15,
  });
  if (value) return value;

  const json = await getter(slug);
  if (!json) return [];
  const topics = json.topic_list.topics.filter(
    (x: any) => !x.closed && !x.archived && x.id != 212
  );
  for (const topic of topics) {
    const user = json.users.find(
      (x: any) => x.username == topic.last_poster_username
    );
    if (user) {
      topic.author = user.name;
    }
  }
  await env.KVCACHE.put(slug, JSON.stringify(topics), {
    expirationTtl: 60 * 60 * 24,
  });
  return topics;
};

export const getSite = async (env: Bindings) => {
  const slug = '/c/idm-docs/58.json';
  const value = await env.KVCACHE.get(slug, {
    type: 'json',
    cacheTtl: 60 * 15,
  });
  if (value) return value;

  const json = await getter(slug);
  const topics = json.topic_list.topics.filter(
    (x: { id: number; category_id: number }) =>
      x.id != 402 && x.category_id == 58
  );

  const result = topics.map((x: any) => ({
    ...x,
    author: 'Vikash Rathee',
    posted_at: dayjs(x.bumped_at || x.created_at).format('MMM, d, YYYY'),
  }));
  await env.KVCACHE.put(slug, JSON.stringify(result), {
    expirationTtl: 60 * 60 * 24,
  });
  return result;
};

//   getSchema(post: any) {
//     const article = post.post_stream.posts[0];
//     return {
//       '@context': 'https://schema.org',
//       '@type': 'Article',
//       mainEntityOfPage: {
//         '@type': 'WebPage',
//         '@id': `https://dayschedule.com/docs/t/${post.slug}/${post.id}`,
//       },
//       headline: post.title,
//       image: article.link_counts
//         ? article.link_counts
//             .filter((x: any) => x.internal && x.url.endsWith('.png'))
//             .map((y: any) => y.url)
//         : [],
//       datePublished: article.created_at,
//       dateModified: article.updated_at,
//       author: [
//         {
//           '@type': 'Person',
//           name: 'Vikash Rathee',
//           url: 'https://twitter.com/@vikashrathee',
//         },
//       ],
//       publisher: {
//         '@type': 'Organization',
//         name: 'DaySchedule',
//         logo: {
//           '@type': 'ImageObject',
//           url: 'https://cdn.dayschedule.com/img/dayschedule.png',
//         },
//       },
//     };
//   }
