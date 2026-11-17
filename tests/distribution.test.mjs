import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { root, readCollection, validateSkill, isInside } from '../scripts/lib.mjs';
import { build } from '../scripts/build.mjs';

async function temporary(t) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'zh-textbook-test-'));
  t.after(async () => {
    const resolved = path.resolve(directory);
    if (!isInside(os.tmpdir(), resolved) || !path.basename(resolved).startsWith('zh-textbook-test-')) throw new Error('临时目录超出清理范围。');
    await rm(resolved, { recursive: true, force: true });
  });
  return directory;
}

test('每个技能单独复制安装后，所有本地引用和许可证仍完整', async (t) => {
  const temp = await temporary(t);
  for (const name of await readCollection()) {
    const installed = path.join(temp, name);
    await cp(path.join(root, 'skills', name), installed, { recursive: true });
    assert.deepEqual(await validateSkill(installed, name), [], name);
  }
});

test('源资料改变后检查失败，重新构建会更新全部安装包', async (t) => {
  const temp = await temporary(t);
  for (const item of ['collection.json', 'LICENSE', 'authoring', 'skills']) await cp(path.join(root, item), path.join(temp, item), { recursive: true });
  const source = path.join(temp, 'authoring/references/chinese-writing.md');
  const changed = `${await readFile(source, 'utf8')}\n新增用于测试的修订。\n`;
  await writeFile(source, changed);
  await assert.rejects(build(temp, { check: true }), /安装包副本已过期/);
  await build(temp);
  await build(temp, { check: true });
  for (const name of await readCollection(temp)) assert.equal(await readFile(path.join(temp, 'skills', name, 'references/chinese-writing.md'), 'utf8'), changed);
});

test('独立包不能依赖仓库中的相邻文件，即使该文件存在', async (t) => {
  const temp = await temporary(t);
  const name = 'textbook-review';
  const installed = path.join(temp, name);
  await cp(path.join(root, 'skills', name), installed, { recursive: true });
  await writeFile(path.join(temp, 'private.md'), '不属于安装包的资料。');
  const entry = path.join(installed, 'SKILL.md');
  await writeFile(entry, `${await readFile(entry, 'utf8')}\n[外部本地依赖](../private.md)\n`);
  assert.ok((await validateSkill(installed, name)).some((error) => error.includes('引用越出')));
});

test('缺失参考资料能被独立包检查发现', async (t) => {
  const temp = await temporary(t);
  const name = 'textbook-write';
  const installed = path.join(temp, name);
  await cp(path.join(root, 'skills', name), installed, { recursive: true });
  await rm(path.join(installed, 'references/domains/music.md'));
  assert.ok((await validateSkill(installed, name)).some((error) => error.includes('链接不存在')));
});

test('无效集合路径在写入前被拒绝', async (t) => {
  const temp = await temporary(t);
  await mkdir(path.join(temp, 'skills'));
  await writeFile(path.join(temp, 'collection.json'), JSON.stringify({ skills: ['../outside'] }));
  await assert.rejects(build(temp), /技能名称/);
});
