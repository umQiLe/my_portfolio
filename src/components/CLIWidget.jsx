import { useEffect, useRef, useState } from 'react';
import { commands, completionFor, runCommand, suggestionsFor } from '../lib/portfolioShell';
import './CLIWidget.css';

export default function CLIWidget({ onTriggerMascot, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [chatMode, setChatMode] = useState(false);
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef(null);
  const toggleRef = useRef(null);
  const transcriptRef = useRef(null);
  const draftRef = useRef('');
  const suggestions = chatMode ? [] : suggestionsFor(input).slice(0, 6);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus({ preventScroll: true });
  }, [isOpen]);

  useEffect(() => {
    // Scroll only the transcript; never scroll the portfolio behind the console.
    const transcript = transcriptRef.current;
    if (transcript && isOpen) transcript.scrollTop = transcript.scrollHeight;
  }, [history, isOpen]);

  useEffect(() => {
    const toggle = event => {
      if ((event.ctrlKey || event.metaKey) && event.code === 'Backquote' && !event.repeat) {
        event.preventDefault();
        setIsOpen(open => !open);
        toggleRef.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener('keydown', toggle);
    return () => window.removeEventListener('keydown', toggle);
  }, []);

  const collapse = () => { setIsOpen(false); toggleRef.current?.focus({ preventScroll: true }); };
  const chooseSuggestion = value => { setInput(value); setHistoryIndex(-1); inputRef.current?.focus({ preventScroll: true }); };
  const execute = value => {
    const command = value.trim();
    if (!command) return;
    const nextHistory = [...cmdHistory, command].slice(-100);
    const result = runCommand(command, { history: nextHistory, chatMode });
    setCmdHistory(nextHistory);
    setHistoryIndex(-1);
    draftRef.current = '';
    setInput('');
    if (result.chatMode !== undefined) setChatMode(result.chatMode);
    if (result.clear) setHistory([]);
    else setHistory(previous => [...previous, { command, output: result.output, mode: chatMode ? 'faq' : 'shell' }].slice(-60));
    if (result.mascot) onTriggerMascot?.(result.mascot);
    if (result.navigate) onNavigate?.(result.navigate);
    if (result.close) collapse();
    else inputRef.current?.focus({ preventScroll: true });
  };

  const handleKeyDown = event => {
    if (event.key === 'Tab' && !event.shiftKey && !chatMode) {
      const completed = completionFor(input);
      if (completed !== input) { event.preventDefault(); chooseSuggestion(completed); }
    } else if (event.key === 'ArrowUp' && cmdHistory.length) {
      event.preventDefault();
      if (historyIndex === -1) draftRef.current = input;
      const index = historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(index);
      setInput(cmdHistory[index]);
    } else if (event.key === 'ArrowDown' && historyIndex !== -1) {
      event.preventDefault();
      const index = historyIndex + 1;
      if (index >= cmdHistory.length) { setHistoryIndex(-1); setInput(draftRef.current); }
      else { setHistoryIndex(index); setInput(cmdHistory[index]); }
    } else if (event.ctrlKey && event.key.toLowerCase() === 'l') {
      event.preventDefault(); setHistory([]);
    }
  };

  return (
    <section className={`cli-widget-container ${isOpen ? 'open' : 'closed'}`} aria-label="Portfolio console" onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); collapse(); } }}>
      <header className="cli-header">
        <button ref={toggleRef} className="cli-toggle" type="button" aria-expanded={isOpen} aria-controls="portfolio-console-body" aria-label={isOpen ? 'Collapse portfolio console' : 'Open portfolio console'} onClick={() => setIsOpen(open => !open)}>
          <span className="cli-symbol" aria-hidden="true">&gt;_</span><span className="terminal-title">{chatMode ? 'Qi Le / profile FAQ' : 'Qi Le / portfolio console'}</span><span className="cli-toggle-hint">{isOpen ? 'COLLAPSE' : 'TRY A COMMAND'}</span><span aria-hidden="true">{isOpen ? '⌄' : '⌃'}</span>
        </button>
      </header>
      {isOpen && <div id="portfolio-console-body" className="cli-body">
        <div className="cli-session-bar"><span><i />{chatMode ? 'LOCAL PROFILE FAQ' : 'LOCAL SESSION'}</span><button type="button" onClick={() => setHistory([])} aria-label="Clear console output">Clear</button></div>
        <div className="cli-transcript" ref={transcriptRef} role="log" aria-label="Console output" aria-live="polite" aria-relevant="additions" tabIndex={0}>
          <div className="cli-welcome"><p>Explore from the command line.</p><span>{commands.length} commands · saved profile data · no setup needed</span></div>
          {!history.length && <div className="cli-quick-actions" aria-label="Quick commands">{(chatMode ? ['current role', 'skills', 'projects', 'exit'] : ['help', 'about', 'open topology', 'ask current role']).map(command => <button type="button" key={command} onClick={() => execute(command)}>{command}<span aria-hidden="true"> ↵</span></button>)}</div>}
          {history.map((item, index) => <div className="cli-history-item" key={index}><div className="cli-command-line"><span className="cli-prompt">{item.mode === 'faq' ? 'faq ›' : 'guest $'}</span><span>{item.command}</span></div>{item.output && <pre className="cli-output-text">{item.output}</pre>}</div>)}
        </div>
        {suggestions.length > 0 && <div className="cli-suggestions" aria-label="Command suggestions">{suggestions.map(item => <button key={item.value} type="button" onClick={() => chooseSuggestion(item.value)}><code>{item.value}</code><span>{item.description}</span></button>)}</div>}
        <form onSubmit={event => { event.preventDefault(); execute(input); }} className="cli-input-form">
          <label htmlFor="portfolio-command" className="cli-prompt">{chatMode ? 'faq ›' : 'guest $'}</label>
          <input id="portfolio-command" ref={inputRef} type="text" value={input} onChange={event => { setInput(event.target.value); setHistoryIndex(-1); }} onKeyDown={handleKeyDown} aria-label={chatMode ? 'Ask the local profile FAQ' : 'Portfolio command'} aria-describedby="cli-input-hint" spellCheck="false" autoComplete="off" autoCapitalize="off" autoCorrect="off" enterKeyHint="send" placeholder={chatMode ? 'Ask about Qi Le…' : 'Type help to get started…'} />
          <button type="submit" aria-label="Run command" disabled={!input.trim()}>↵</button>
        </form>
        <p id="cli-input-hint" className="cli-input-hint"><span>Tab complete · ↑ ↓ history</span><span>Esc collapse · Ctrl + ` toggle</span></p>
      </div>}
    </section>
  );
}
