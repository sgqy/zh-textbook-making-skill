import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { root, readText, filesUnder, readCollection } from './lib.mjs';

export async function build(projectRoot = root, { check = false } = {}) {
  const names = await readCollection(projectRoot);
  const source = path.join(projectRoot, 'authoring/references');
  const sourceFiles = await filesUnder(source);
  if (!sourceFiles.length) throw new Error('共用参考资料为空。');
  await filesUnder(path.join(projectRoot, 'skills'));
  const license = await readText(path.join(projectRoot, 'LICENSE'));
  const problems = [];
  for (const name of names) {
    const destination = path.join(projectRoot, 'skills', name);
    await readText(path.join(destination, 'SKILL.md'));
    const expected = new Map([['LICENSE', license]]);
    for (const file of sourceFiles) expected.set(path.join('references', path.relative(source, file)), await readText(file));
    let installed = [];
    try { installed = await filesUnder(path.join(destination, 'references')); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    const extra = installed.filter((file) => !expected.has(path.relative(destination, file)));
    if (extra.length) throw new Error(`发现不再由源文件生成的参考资料，请核对后手动移除：\n${extra.join('\n')}`);
    for (const [relative, content] of expected) {
      const output = path.join(destination, relative);
      let current;
      try { current = await readText(output); } catch (error) { if (error.code !== 'ENOENT') throw error; }
      if (current === content) continue;
      if (check) problems.push(path.relative(projectRoot, output));
      else {
        await mkdir(path.dirname(output), { recursive: true });
        await writeFile(output, content, 'utf8');
      }
    }
  }
  if (problems.length) throw new Error(`安装包副本已过期，请运行 npm run build：\n${problems.join('\n')}`);
  return names.length;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2);
    if (args.some((arg) => arg !== '--check')) throw new Error('仅支持 --check 参数。');
    const count = await build(root, { check: args.includes('--check') });
    console.log(`${args.includes('--check') ? '已核对' : '已生成'} ${count} 个独立技能包的参考资料和许可证。`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
