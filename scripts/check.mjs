import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { root, filesUnder, readText, readCollection, validateSkill, validateLinks } from './lib.mjs';

try {
  const names = await readCollection();
  const actual = (await readdir(path.join(root, 'skills'))).sort();
  if (JSON.stringify(actual) !== JSON.stringify([...names].sort())) throw new Error('skills 目录与 collection.json 不一致。');
  const errors = [];
  for (const name of names) errors.push(...await validateSkill(path.join(root, 'skills', name)));
  const files = [];
  for (const name of ['docs', 'authoring', 'evals']) files.push(...await filesUnder(path.join(root, name)));
  for (const item of await readdir(root)) if (item.endsWith('.md')) files.push(path.join(root, item));
  for (const file of files.filter((item) => item.endsWith('.md'))) {
    const text = await readText(file);
    if (text.includes('\uFFFD')) errors.push(`${file}: 存在替代字符。`);
    if ((text.match(/^```/gm) ?? []).length % 2) errors.push(`${file}: 代码围栏未配对。`);
    errors.push(...await validateLinks(file, root));
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(`已检查 ${names.length} 个技能的元数据、独立引用、许可证及项目文档链接。`);
  console.log('这些检查不评估教学效果，也不自动访问外部网页。');
} catch (error) { console.error(error.message); process.exitCode = 1; }
