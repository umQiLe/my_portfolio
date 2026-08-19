import { useState, useEffect, useRef } from 'react';
import './MascotWidget.css';

const chinesePhrases = [
  "允许自己舍不得，但不要因为舍不得而停下人生；向前走，不代表背叛过去。",
  "人生真正的成长，不是变得不需要任何人，而是即使需要别人，也不会失去自己。",
  "你现在经历的迷茫，不一定是在走错路，也可能是在换一条人生的路。",
  "不要用一个人的态度，定义你自己的价值。",
  "天道酬勤，星光不负赶路人",
  "代码写得好，下班得趁早。",
  "复杂系统的问题，往往源于对基础逻辑的忽视。",
  "自动化不是为了取代人，而是为了解放出更多思考的时间。",
  "当需求出现逻辑冲突时，最先要修补的是‘思维的ACL’。",
  "最危险的不是bug，而是你以为没有bug。",
  "允许自己在实习的最初阶段犯错、焦虑或感到生疏。你是一个正在快速进化的系统，每一个版本的你，都比上一个版本更强大。"
];

const MascotWidget = ({ isVisible }) => {

  const [currentPhrase, setCurrentPhrase] = useState(chinesePhrases[0]);
  const [isTalking, setIsTalking] = useState(false);
  const [isJumping, setIsJumping] = useState(false);

  // Position on screen
  const [position, setPosition] = useState({ x: window.innerWidth - 140, y: window.innerHeight - 220 });
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    isDragging.current = true;
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y
      });
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Loop for random phrases, talking, and happy jumping
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      const randomText = chinesePhrases[Math.floor(Math.random() * chinesePhrases.length)];
      setCurrentPhrase(randomText);
      setIsTalking(true);

      // Random chance to jump happily when talking
      if (Math.random() > 0.4) {
        setIsJumping(true);
        setTimeout(() => setIsJumping(false), 1200);
      }

      setTimeout(() => {
        setIsTalking(false);
      }, 4000);

    }, 12000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div 
      className={`mascot-container ${isJumping ? 'jump-animation' : ''}`}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onMouseDown={handleMouseDown}
    >
      {/* Speech Bubble */}
      <div className="mascot-speech-bubble">
        <p>{currentPhrase}</p>
      </div>

      {/* Borderless Mascot GIF */}
      <div className="mascot-avatar-wrapper">
        <img 
          src={isTalking ? "/mascot_talk.gif" : "/mascot_blink.gif"} 
          alt="Mascot" 
          className="mascot-img"
        />
      </div>
    </div>
  );
};

export default MascotWidget;