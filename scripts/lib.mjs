import { readFile, readdir, lstat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const normalize = (value) => value.replace(/\r\n/g, '\n');
export const readText = async (file) => normalize(await readFile(file, 'utf8'));

export function isInside(parent, target) {
  const relative = path.relative(path.resolve(parent), path.resolve(target));
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

export async function filesUnder(directory) {
  const info = await lstat(directory);
  if (info.isSymbolicLink()) throw new Error(`不接受符号链接：${directory}`);
  const files = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, item.name);
    if (item.isSymbolicLink()) throw new Error(`不接受符号链接：${full}`);
    if (item.isDirectory()) files.push(...await filesUnder(full));
    else if (item.isFile()) files.push(full);
  }
  return files.sort();
}

export async function readCollection(projectRoot = root) {
  const { skills } = JSON.parse(await readText(path.join(projectRoot, 'collection.json')));
  if (!Array.isArray(skills) || skills.length === 0 || new Set(skills).size !== skills.length ||
      skills.some((name) => typeof name !== 'string' || !/^textbook-[a-z]+(?:-[a-z]+)*$/.test(name) || name.length > 64)) {
    throw new Error('collection.json 必须包含非空、无重复的 textbook-* 技能名称。');
  }
  return skills;
}

// 本项目采用平面、单行的 YAML 元数据；复杂 YAML 交给外部技能校验器。
export function frontmatter(text) {
  const match = normalize(text).match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) throw new Error('缺少 YAML 前置元数据。');
  const fields = {};
  for (const line of match[1].split('\n')) {
    const field = line.match(/^([a-z-]+):\s+(.+)$/);
    if (!field || Object.hasOwn(fields, field[1])) throw new Error(`不支持或重复的元数据行：${line}`);
    fields[field[1]] = field[2].startsWith('"') ? JSON.parse(field[2]) : field[2];
  }
  return fields;
}

function anchorIds(text) {
  const ids = new Set();
  const counts = new Map();
  for (const heading of text.matchAll(/^#{1,6}\s+(.+)$/gm)) {
    const base = heading[1].replace(/<[^>]*>/g, '').toLowerCase().replace(/[^\p{L}\p{N}\p{M}_\- ]/gu, '').replace(/ /g, '-');
    const count = counts.get(base) ?? 0;
    ids.add(count ? `${base}-${count}` : base);
    counts.set(base, count + 1);
  }
  for (const anchor of text.matchAll(/\bid=["']([^"']+)["']/g)) ids.add(anchor[1]);
  return ids;
}

export async function validateLinks(file, boundary) {
  const text = await readText(file);
  const errors = [];
  const prose = text.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, '');
  for (const match of prose.matchAll(/\[[^\]]*\]\(([^\s)]+)\)/g)) {
    const target = match[1];
    if (/^(https?:|mailto:)/i.test(target)) continue;
    let decoded;
    try { decoded = decodeURIComponent(target); }
    catch { errors.push(`链接编码无效：${target}`); continue; }
    const hash = decoded.indexOf('#');
    const filePart = hash < 0 ? decoded : decoded.slice(0, hash);
    const anchor = hash < 0 ? '' : decoded.slice(hash + 1);
    const resolved = filePart ? path.resolve(path.dirname(file), filePart) : file;
    if (!isInside(boundary, resolved)) { errors.push(`引用越出安装包或仓库：${target}`); continue; }
    try {
      const info = await lstat(resolved);
      if (info.isSymbolicLink()) errors.push(`链接指向符号链接：${target}`);
      else if (anchor && info.isFile() && !anchorIds(await readText(resolved)).has(anchor)) errors.push(`锚点不存在：${target}`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      errors.push(`链接不存在：${target}`);
    }
  }
  return errors.map((message) => `${file}: ${message}`);
}

export async function validateSkill(directory, expectedName = path.basename(directory)) {
  const errors = [];
  const entry = await readText(path.join(directory, 'SKILL.md'));
  const fields = frontmatter(entry);
  if (fields.name !== expectedName) errors.push('技能名称与目录不一致。');
  if (typeof fields.description !== 'string' || !fields.description.trim() || fields.description.length > 1024) errors.push('技能描述缺失或过长。');
  if (fields.license !== 'MIT') errors.push('技能协议不是 MIT。');
  if (/\bTODO\b|\[待填写\]|\[TODO/i.test(entry)) errors.push('技能入口含未完成的占位内容。');
  const ui = await readText(path.join(directory, 'agents/openai.yaml'));
  for (const field of ['display_name', 'short_description', 'default_prompt']) {
    const match = ui.match(new RegExp(`^  ${field}: (.+)$`, 'm'));
    if (!match) { errors.push(`缺少 ${field}。`); continue; }
    let value;
    try { value = JSON.parse(match[1]); } catch { errors.push(`${field} 必须是带引号的字符串。`); continue; }
    if (typeof value !== 'string' || !value.trim()) { errors.push(`${field} 不能为空。`); continue; }
    if (field === 'short_description' && (value.length < 25 || value.length > 64)) errors.push('简短说明须为 25～64 字符。');
    if (field === 'default_prompt' && !value.includes(`$${expectedName}`)) errors.push('默认提示词缺少当前技能名称。');
  }
  if (!(await readText(path.join(directory, 'LICENSE'))).startsWith('MIT License\n')) errors.push('安装包缺少 MIT 许可证。');
  for (const file of await filesUnder(directory)) {
    if (file.endsWith('.md')) errors.push(...await validateLinks(file, directory));
  }
  return errors;
}
