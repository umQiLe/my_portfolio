import React, { useState, useEffect, useRef } from 'react';
import resumeData from '../data/resume.json';
import qaDatabase from '../data/qa.json';
import './CLIWidget.css';

const CLIWidget = ({ onTriggerMascot }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    { command: 'initial_link_up', output: 'Link up. Status 200.' },
    { command: 'help', output: 'Type \'help\' to see the manual.' },
  ]);

  // --- NEW LIVE CHAT STATES ---
  const [chatMode, setChatMode] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  
  // Create a unique session ID for this user's tab
  const sessionId = useRef(Math.random().toString(36).substring(2, 15));

  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const terminalEndRef = useRef(null);
  const inputRef = useRef(null);
  const commandBatch = useRef([]);

  // Define the virtual file system based on your JSON keys
  const availableFiles = [
    'about.txt', 
    'experience.log', 
    'skills.json', 
    'projects.txt', 
    'certifications.txt',
    'awards.txt',
    'activities.log',
    'resume.pdf'
  ];

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isThinking]);

  useEffect(() => {
    if (isOpen && !isThinking) {
      inputRef.current?.focus();
    }
  }, [isOpen, isThinking]);

  useEffect(() => {
    const handleUnload = () => {
      if (commandBatch.current.length > 0) {
        // Package the data
        const payload = JSON.stringify({ 
          sessionTime: new Date().toISOString(),
          logs: commandBatch.current 
        });
      
        // sendBeacon is reliable for firing during page close
        navigator.sendBeacon('/api/logCommand', payload);
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  const handleKeyDown = (e) => {
    // Tab Completion Logic
    if (e.key === 'Tab') {
      e.preventDefault(); // Prevent focus shifting
      const args = input.split(' ');
      
      // Only autocomplete if there is a command (like 'cat') and a partial file name
      if (args.length > 1) {
        const target = args[args.length - 1];
        const matches = availableFiles.filter(f => f.startsWith(target));
        
        if (matches.length === 1) {
          // Exact match found, complete the string
          args[args.length - 1] = matches[0];
          setInput(args.join(' '));
        } else if (matches.length > 1) {
          // Multiple matches: show options in terminal history
          setHistory((prev) => [
            ...prev, 
            { command: input, output: matches.join('   ') }
          ]);
        }
      }
    } 
    // Up Arrow History
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const newIndex = historyIndex === -1 ? cmdHistory.length - 1 : Math.max(historyIndex - 1, 0);
        setHistoryIndex(newIndex);
        setInput(cmdHistory[newIndex]);
      }
    } 
    // Down Arrow History
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= cmdHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(cmdHistory[newIndex]);
        }
      }
    }
  };

  // Helper function to format JSON arrays into neat terminal output
  const formatJsonData = (dataNode) => {
    return dataNode.children.map(item => `[${item.label}] ${item.desc}`).join('\n\n');
  };

  // --- SIMPLE NLP ENGINE ---
  const findBotResponse = (userInput) => {
    const userWords = userInput.toLowerCase().replace(/[^\w\s]/gi, '').split(' ');
    
    let bestMatch = null;
    let highestScore = 0;

    for (const qa of qaDatabase) {
      // Count how many keywords from the database exist in the user's sentence
      const score = qa.keywords.filter(keyword => userWords.includes(keyword)).length;
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = qa.response;
      }
    }

    // Default fallback if no keywords match
    return bestMatch || "I'm not quite sure I understand. Try asking about Qi Le's 'skills', 'experience', 'projects', or 'hiring' status!";
  };

  const handleCommandSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) {
      setHistory((prev) => [...prev, { command: '', output: '' }]);
      setInput('');
      return;
    }

    const currentInput = input.trim();

    // Save to our batch array quietly in the background
    commandBatch.current.push({
      mode: chatMode ? 'ASSISTANT_QUERY' : 'TERMINAL_CMD',
      text: currentInput
    });
    
    setCmdHistory((prev) => [...prev, currentInput]);
    setHistoryIndex(-1);
    setInput('');

    // ==========================================
    // LOGIC BRANCH A: CHATBOT MODE
    // ==========================================
    if (chatMode) {
      if (currentInput.toLowerCase() === 'exit') {
        setChatMode(false);
        setHistory((prev) => [...prev, { command: currentInput, output: 'Disconnected from Auto-Assistant. Returning to local shell.' }]);
        return;
      }

      setHistory((prev) => [...prev, { command: currentInput, output: '' }]);
      setIsThinking(true);

      // Simulate a network delay so it feels like a real bot typing
      const typingDelay = Math.floor(Math.random() * 1000) + 1000; // Random delay between 1s and 2s

      setTimeout(() => {
        const reply = findBotResponse(currentInput);
        
        setHistory((prev) => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].output = `[ASSISTANT]: ${reply}`;
          return newHistory;
        });
        
        setIsThinking(false);
      }, typingDelay);

      return;
    }

    // ==========================================
    // LOGIC BRANCH B: NORMAL TERMINAL MODE
    // ==========================================
    const args = currentInput.split(' ');
    const cmd = args[0].toLowerCase();
    let output = '';

    switch (cmd) {

      case 'qile':
        if (args[1] === 'come') {
          if (onTriggerMascot) onTriggerMascot('open');
          output = 'Deploying desktop mascot companion...';
        } else if (args[1] === 'bye') {
          if (onTriggerMascot) onTriggerMascot('close');
          output = 'Mascot returning to system tray. Goodbye!';
        } else {
          output = 'Usage: qile come  |  qile bye';
        }
        break;

      case 'ssh':
        if (args[1] === 'admin@host') {
          setChatMode(true);
          output = 'Establishing secure socket layer...\nConnected to Virtual Assistant.\nType your question below. Type \'exit\' to disconnect.';
        } else {
          output = `ssh: Could not resolve hostname ${args[1] || ''}: Name or service not known`;
        }
        break;

      case 'help':
        output = `NAME
    portfolio-cli - interactive command line interface

SYNOPSIS
    [COMMAND] [OPTIONS] [FILE]

DESCRIPTION
    This shell provides text-based access to the portfolio database.
    Use standard UNIX commands or dedicated shortcuts to navigate.
    * Hint: Use [TAB] to autocomplete filenames.

COMMANDS
    cat <file>   Concatenate files and print on the standard output.
    ls           List directory contents.
    pwd          Print name of current working directory.
    whoami       Print effective userid.
    date         Print the system date and time.
    echo <text>  Display a line of text.
    clear        Clear the terminal screen.

SHORTCUTS
    about, skills, exp, projects, contact`;
        break;

      case 'ls': output = availableFiles.join('   '); break;
      case 'cat':
        const file = args[1];
        if (!file) output = 'cat: missing file operand\nTry \'ls\' to see available files.';
        else if (file === 'about.txt') output = formatJsonData(resumeData.core);
        else if (file === 'experience.log') output = formatJsonData(resumeData.experience);
        else if (file === 'skills.json') output = formatJsonData(resumeData.skills);
        else if (file === 'projects.txt') output = formatJsonData(resumeData.projects);
        else if (file === 'certifications.txt') output = formatJsonData(resumeData.certifications);
        else if (file === 'awards.txt') output = formatJsonData(resumeData.awards);
        else if (file === 'activities.log') output = formatJsonData(resumeData.activities);
        else if (file === 'resume.pdf') output = 'Error: Cannot print binary PDF to terminal.';
        else output = `cat: ${file}: No such file or directory`;
        break;

      case 'about': output = formatJsonData(resumeData.core); break;
      case 'exp': output = formatJsonData(resumeData.experience); break;
      case 'skills': output = formatJsonData(resumeData.skills); break;
      case 'projects': output = formatJsonData(resumeData.projects); break;
      case 'contact': output = resumeData.core.children.find(c => c.id === 'c3').desc; break;
      case 'pwd': output = '/home/guest/portfolio'; break;
      case 'whoami': output = 'guest_user'; break;
      case 'date': output = new Date().toString(); break;
      case 'echo': output = args.slice(1).join(' '); break;
      case 'sudo': output = 'guest_user is not in the sudoers file. This incident will be reported.'; break;
      case 'clear': setHistory([]); return;
      default: output = `bash: ${cmd}: command not found`;
    }

    setHistory((prev) => [...prev, { command: currentInput, output }]);
  };

  return (
    <div className={`cli-widget-container ${isOpen ? 'open' : 'closed'}`}>
      <div className="cli-header" onClick={() => setIsOpen(!isOpen)}>
        {/* Dynamic header text based on mode */}
        <span className="terminal-title">{chatMode ? 'SECURE_CHANNEL // AUTO_ASSISTANT' : 'cli@guest_session:~'}</span>
        <span className="toggle-icon">{isOpen ? '▼' : '▲'}</span>
      </div>

      <div className="cli-body" onClick={() => !isThinking && inputRef.current?.focus()}>
        {history.map((item, index) => (
          <div key={index} className="history-item">
            <div className="command-line">
              <span className="prompt">{item.command === 'exit' ? 'guest@portfolio:~$ ' : (chatMode || item.output?.includes('Connected to Virtual Assistant') ? 'message> ' : 'guest@portfolio:~$ ')}</span>
              <span className="cmd-text">{item.command}</span>
            </div>
            {item.output && <div className="output-text">{item.output}</div>}
          </div>
        ))}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="history-item">
            <div className="output-text blink-text" style={{ color: 'var(--accent-green)' }}>[ASSISTANT] is typing...</div>
          </div>
        )}

        {/* Input Form (Hidden while thinking) */}
        {!isThinking && (
          <form onSubmit={handleCommandSubmit} className="input-form">
            <span className="prompt">{chatMode ? 'message> ' : 'guest@portfolio:~$ '}</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck="false"
              autoComplete="off"
            />
          </form>
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};

export default CLIWidget;