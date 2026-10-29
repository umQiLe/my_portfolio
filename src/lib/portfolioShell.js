import { details, profile, searchProfile, topics } from '../data/profile.js';
import faq from '../data/qa.json' with { type: 'json' };

export const pages = { overview: 'OVERVIEW', topology: 'DASHBOARD', projects: 'PROJECTS', resume: 'RESUME', gateway: 'GATEWAY' };
export const files = ['about.txt', 'experience.log', 'skills.json', 'projects.txt', 'certifications.txt', 'awards.txt', 'activities.log'];
export const commands = [
  ['help', 'Show all commands'], ['about', 'Meet Qi Le'], ['exp', 'Current and previous roles'], ['skills', 'Technical expertise'],
  ['projects', 'Browse project details'], ['contact', 'Get in touch'], ['find', 'Search the portfolio'], ['open', 'Navigate to a page'],
  ['ask', 'Ask the local profile FAQ'], ['ls', 'List profile files'], ['cat', 'Read a profile file'], ['history', 'Recall this session'],
  ['clear', 'Clear the output'], ['whoami', 'Show the current visitor'], ['pwd', 'Show the virtual directory'], ['date', 'Show local time'],
  ['echo', 'Print text'], ['qile', 'Show or hide the mascot'], ['ssh', 'Legacy alias for the local FAQ'], ['exit', 'Leave FAQ mode or close the console'],
];
const format = items => items.map(item => `[${item.name || item.label}]\n${item.desc}`).join('\n\n');
const about = () => `${profile.name}\n${profile.role}\n${profile.company} · ${profile.department}\nFocus: ${profile.focus.join(', ')}\n\n${profile.outlook}`;

export function suggestionsFor(input) {
  const value = input.trimStart().toLowerCase();
  if (!value) return [];
  if (/^cat\s+/.test(value)) return files.filter(file => file.startsWith(value.replace(/^cat\s+/, ''))).map(file => ({ value: `cat ${file}`, description: 'Read profile file' }));
  if (/^open\s+/.test(value)) return Object.keys(pages).filter(page => page.startsWith(value.replace(/^open\s+/, ''))).map(page => ({ value: `open ${page}`, description: 'Navigate to page' }));
  if (/^qile\s+/.test(value)) return ['come', 'bye'].filter(action => action.startsWith(value.replace(/^qile\s+/, ''))).map(action => ({ value: `qile ${action}`, description: 'Mascot control' }));
  return commands.filter(([command]) => command.startsWith(value) && command !== value).map(([command, description]) => ({ value: command, description }));
}

export function completionFor(input) {
  const matches = suggestionsFor(input);
  if (!matches.length) return input;
  let prefix = matches[0].value;
  for (const match of matches.slice(1)) while (!match.value.startsWith(prefix)) prefix = prefix.slice(0, -1);
  return prefix.length > input.trimStart().length ? prefix : input;
}

export function answerQuestion(question) {
  const direct = searchProfile(question);
  if (direct.length) return format(direct.slice(0, 4));
  const words = question.toLowerCase().match(/[a-z0-9]+/g) || [];
  const ranked = faq.map(item => ({ ...item, score: item.keywords.filter(word => words.includes(word)).length })).sort((a, b) => b.score - a.score);
  return ranked[0]?.score ? ranked[0].response : 'I can answer from Qi Le’s saved profile. Try “current role”, “Huawei”, “skills” or “projects”. For a keyword search, use find <term>.';
}

// This is a local virtual shell: text is never evaluated or passed to a system shell.
export function runCommand(input, { history = [], chatMode = false, now = new Date() } = {}) {
  const text = input.trim();
  if (!text) return { output: '' };
  if (chatMode && !['exit', 'clear', 'help'].includes(text.toLowerCase())) return { output: answerQuestion(text) };
  const [rawCommand, ...args] = text.split(/\s+/);
  const command = rawCommand.toLowerCase();
  const rest = text.slice(rawCommand.length).trim();
  const topicOutput = id => format(details.filter(item => item.topicId === id));
  switch (command) {
    case 'help': return { output: `QI LE / LOCAL PORTFOLIO CONSOLE\n\n${commands.filter(([name]) => name !== 'qile').map(([name, desc]) => `${name.padEnd(12)}${desc}`).join('\n')}\n\nExamples\n  open topology\n  find cloud\n  cat experience.log\n  ask current role\n\n↑ / ↓ history · Tab complete · Escape collapse · Ctrl + \` toggle\nThis console reads saved profile data; it does not run system commands.` };
    case 'about': return { output: about() };
    case 'exp': case 'experience': return { output: topicOutput('experience') };
    case 'skills': case 'projects': return { output: topicOutput(command) };
    case 'contact': return { output: `${profile.name}\nEmail: ${profile.email}\nUse open gateway for more links.` };
    case 'ls': return { output: files.join('   ') };
    case 'cat': {
      const file = args[0]?.toLowerCase();
      if (!file) return { output: 'Usage: cat <file>\nUse ls to see the available files.' };
      if (args.length > 1) return { output: 'Read one file at a time: cat <file>' };
      if (file === 'about.txt') return { output: about() };
      const topic = topics.find(item => file.startsWith(`${item.id}.`));
      return { output: topic && files.includes(file) ? topicOutput(topic.id) : `File not found: ${args[0]}\nUse ls to list the available files.` };
    }
    case 'find': {
      if (!rest) return { output: 'Usage: find <keyword or phrase>' };
      const matches = searchProfile(rest);
      return { output: matches.length ? `${matches.length} matching connections\n\n${format(matches)}` : `No matches for “${rest}”. Try networking, Huawei or Rust.` };
    }
    case 'open': {
      const page = rest.toLowerCase();
      return Object.hasOwn(pages, page) ? { output: `Opening ${page}…`, navigate: pages[page] } : { output: `Usage: open <${Object.keys(pages).join(' | ')}>` };
    }
    case 'ask': return { output: rest ? answerQuestion(rest) : 'Usage: ask <question>\nExample: ask current role\nAnswers come from the local profile FAQ.' };
    case 'ssh': return rest === 'admin@host' ? { chatMode: true, output: 'Local profile FAQ opened. No remote connection is made.\nAsk about Qi Le’s work, skills or projects. Type exit to return.' } : { output: 'This is a local portfolio console. Use ask <question> or ssh admin@host for local FAQ mode.' };
    case 'exit': return chatMode ? { chatMode: false, output: 'Back to the local portfolio console.' } : { close: true, output: 'Console collapsed. Your session is kept until the page reloads.' };
    case 'history': return { output: history.map((entry, index) => `${String(index + 1).padStart(3)}  ${entry}`).join('\n') || 'No commands yet.' };
    case 'clear': return { clear: true, output: '' };
    case 'qile': return ['come', 'bye'].includes(rest) ? { mascot: rest === 'come' ? 'open' : 'close', output: rest === 'come' ? 'Mascot is on the way.' : 'Mascot dismissed.' } : { output: 'Usage: qile come | qile bye' };
    case 'pwd': return { output: '/home/guest/portfolio (virtual)' };
    case 'whoami': return { output: 'guest — welcome to Qi Le’s portfolio.' };
    case 'date': return { output: now.toString() };
    case 'echo': return { output: rest };
    default: return { output: `Unknown command: ${rawCommand}\nType help, or try ask ${text}` };
  }
}
