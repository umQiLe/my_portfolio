import test from 'node:test';
import assert from 'node:assert/strict';
import { buildNetwork, details, searchProfile, topics } from '../src/data/profile.js';
import { answerQuestion, completionFor, files, pages, runCommand, suggestionsFor } from '../src/lib/portfolioShell.js';

test('all network neighborhoods have valid unique nodes and links', () => {
  for (const topicId of [null, ...topics.map(topic => topic.id)]) {
    const graph = buildNetwork(topicId);
    const ids = new Set(graph.nodes.map(node => node.id));
    assert.equal(ids.size, graph.nodes.length);
    assert.equal(new Set(graph.edges.map(edge => edge.id)).size, graph.edges.length);
    graph.edges.forEach(edge => { assert.ok(ids.has(edge.source)); assert.ok(ids.has(edge.target)); });
    const visited = new Set(['profile']);
    for (let index = 0; index < graph.nodes.length; index++) graph.edges.forEach(edge => { if (visited.has(edge.source)) visited.add(edge.target); });
    assert.equal(visited.size, ids.size);
  }
});

test('every saved detail is reachable from its topic and global search', () => {
  for (const item of details) {
    assert.ok(buildNetwork(item.topicId).nodes.some(node => node.id === item.id));
    assert.ok(searchProfile(item.name).some(result => result.id === item.id));
  }
  assert.ok(searchProfile('RUST').some(item => item.id === 'p5'));
  assert.equal(searchProfile('not-a-real-profile-detail').length, 0);
  assert.equal(searchProfile('  ').length, 0);
});

test('local shell reads every advertised file and includes the current role', () => {
  for (const file of files) assert.doesNotMatch(runCommand(`cat ${file}`).output, /not found|missing/i);
  assert.match(runCommand('about').output, /ANTlabs/);
  assert.match(runCommand('exp').output, /IT & Solutions Delivery Engineer/);
  assert.match(runCommand('cat EXPERIENCE.LOG').output, /Huawei MY/);
  assert.match(runCommand('cat skills.wrong').output, /not found/i);
});

test('navigation accepts only known pages and treats input as text', () => {
  for (const [page, pane] of Object.entries(pages)) assert.equal(runCommand(`OPEN  ${page}`).navigate, pane);
  assert.equal(runCommand('open https://example.com').navigate, undefined);
  assert.equal(runCommand('open __proto__').navigate, undefined);
  assert.equal(runCommand('open constructor').navigate, undefined);
  assert.equal(runCommand('open topology; clear').navigate, undefined);
  assert.equal(runCommand('echo $(whoami)').output, '$(whoami)');
});

test('completion expands unique prefixes and leaves ambiguous or complete input alone', () => {
  assert.equal(completionFor('cat exp'), 'cat experience.log');
  assert.equal(completionFor('open top'), 'open topology');
  assert.equal(completionFor('pro'), 'projects');
  assert.equal(completionFor('cat a'), 'cat a');
  assert.equal(completionFor('help'), 'help');
  assert.equal(completionFor(''), '');
  assert.equal(completionFor('nonsense'), 'nonsense');
  assert.equal(suggestionsFor('cat a').length, 3);
});

test('FAQ uses current facts and supports local mode and clear actions', () => {
  assert.match(answerQuestion('current role'), /ANTlabs/);
  assert.doesNotMatch(answerQuestion('hiring'), /graduating|actively open/);
  assert.match(answerQuestion('Huawei'), /Huawei MY/);
  assert.equal(runCommand('ssh admin@host').chatMode, true);
  assert.equal(runCommand('exit', { chatMode: true }).chatMode, false);
  assert.equal(runCommand('exit').close, true);
  assert.equal(runCommand('clear', { chatMode: true }).clear, true);
  assert.match(runCommand('current role', { chatMode: true }).output, /ANTlabs/);
  assert.equal(runCommand('qile come').mascot, 'open');
  assert.match(runCommand('find Rust').output, /BSD/);
  assert.match(runCommand('history', { history: ['about', 'help'] }).output, /1  about\n  2  help/);
});
