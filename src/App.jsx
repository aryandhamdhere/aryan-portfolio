import React, { useState, useEffect, useRef } from 'react';

const useReveal = () => {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);
  return ref;
};

const TiltWrapper = ({ children, style, multiplier = 20 }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -multiplier;
    const rotateY = ((x - centerX) / centerX) * multiplier;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.1, 1.1, 1.1)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  return (
    <div ref={cardRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} 
         style={{ display: 'inline-block', transition: 'transform 0.1s ease-out', willChange: 'transform', transformStyle: 'preserve-3d', ...style }}>
      {children}
    </div>
  );
};

const Cursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const requestRef = useRef();
  
  const mouse = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const hoveringRef = useRef(false);

  useEffect(() => {
    const onMouseMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };
    
    const onMouseOver = (e) => {
      const tagName = e.target.tagName?.toLowerCase();
      if (tagName === 'a' || tagName === 'button' || e.target.closest('a') || e.target.closest('button')) {
        hoveringRef.current = true;
      } else {
        hoveringRef.current = false;
      }
    };

    const update = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * 0.15;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.15;
      
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) scale(${hoveringRef.current ? 2 : 1})`;
        ringRef.current.style.backgroundColor = hoveringRef.current ? 'rgba(0, 255, 178, 0.1)' : 'transparent';
      }
      requestRef.current = requestAnimationFrame(update);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);
    requestRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <>
      <div 
        ref={ringRef} 
        style={{
          position: 'fixed', top: -16, left: -16, width: 32, height: 32,
          border: '1px solid #00FFB2', borderRadius: '50%',
          pointerEvents: 'none', zIndex: 9999,
          transition: 'background-color 0.2s, transform 0.1s ease-out',
          willChange: 'transform',
          mixBlendMode: 'difference'
        }}
      />
      <div 
        ref={dotRef}
        style={{
          position: 'fixed', top: -3, left: -3, width: 6, height: 6,
          backgroundColor: '#00FFB2', borderRadius: '50%',
          pointerEvents: 'none', zIndex: 10000,
          willChange: 'transform',
          mixBlendMode: 'difference'
        }}
      />
    </>
  );
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '20px 5%',
      backgroundColor: scrolled ? 'rgba(1,1,10,0.85)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      transition: 'background-color 0.3s, backdrop-filter 0.3s',
      borderBottom: scrolled ? '1px solid rgba(0,255,178,0.1)' : '1px solid transparent'
    }}>
      <a href="#" className="bebas glitch-wrapper" style={{ fontSize: 42, letterSpacing: '2px' }}>
        <span className="glitch" data-text="ARYAN" style={{ color: '#fff' }}>ARYAN</span>
      </a>
      <div className="nav-links" style={{ display: 'flex', gap: '20px' }}>
        {['EXPERIENCE', 'LEADERSHIP', 'WORK', 'CONTACT'].map(item => (
          <a key={item} href={`#${item.toLowerCase()}`} className="nav-btn-neon" style={{
            fontFamily: 'DM Mono', fontSize: 13, letterSpacing: '0.1em'
          }}>
            {item}
          </a>
        ))}
      </div>
    </nav>
  );
};

const Hero = () => {
  const [text, setText] = useState('');
  const [phase, setPhase] = useState('typing');
  const [index, setIndex] = useState(0);
  const phrases = ["IIT Bombay.", "Shark Tank India.", "WorldQuant Research.", "Building at the edge."];

  useEffect(() => {
    let timeout;
    const currentPhrase = phrases[index];
    
    if (phase === 'typing') {
      if (text.length < currentPhrase.length) {
        timeout = setTimeout(() => setText(currentPhrase.slice(0, text.length + 1)), 100);
      } else {
        timeout = setTimeout(() => setPhase('deleting'), 2000);
      }
    } else if (phase === 'deleting') {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(currentPhrase.slice(0, text.length - 1)), 50);
      } else {
        setIndex((i) => (i + 1) % phrases.length);
        setPhase('typing');
      }
    }
    return () => clearTimeout(timeout);
  }, [text, phase, index]);

  return (
    <section id="hero" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '120px 5% 40px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100vw', height: '100vh', background: 'radial-gradient(circle at 40% 50%, rgba(0,255,178,0.1) 0%, rgba(1,1,10,1) 60%)', zIndex: 0, pointerEvents: 'none' }}></div>
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.05, pointerEvents: 'none', zIndex: 0 }}>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 40 M 0 0 L 40 40" fill="none" stroke="#00FFB2" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ color: '#fff', fontSize: 'clamp(20px, 3vw, 32px)', marginBottom: '10px', fontWeight: 500 }}>
          Hey, I'm Aryan Dhamdhere, a
        </div>
        <h1 className="bebas glitch" data-text="STUDENT FOUNDER / STRATEGY AND FINANCE / CONSULTING" style={{ fontSize: 'clamp(24px, 5vw, 80px)', lineHeight: 1.1, marginBottom: '20px', color: '#fff' }}>
          STUDENT FOUNDER / STRATEGY AND FINANCE / CONSULTING
        </h1>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(14px, 1.5vw, 18px)', marginBottom: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>
          IIT Bombay, 3rd Year · Metallurgical Eng. & Materials Science
        </div>
        <div style={{ fontSize: 'clamp(16px, 2vw, 24px)', color: '#00FFB2', minHeight: '36px', marginBottom: '60px' }}>
          &gt; {text}<span className="blink">|</span>
        </div>
        <div className="hero-buttons" style={{ display: 'flex', gap: '20px' }}>
          <a href="#work" className="btn-neon">VIEW WORK</a>
          <a href="https://drive.google.com/file/d/1EhClPJtd_DbbdM5RCNbmMrB5790vV8TQ/view?usp=drive_link" target="_blank" rel="noopener noreferrer" className="btn-ghost">DOWNLOAD CV</a>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginTop: '60px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '40px' }}>
        {[
          { num: '01', title: 'Brand Strategy & Growth' },
          { num: '02', title: 'AI/ML Development' },
          { num: '03', title: 'Algorithmic Trading' },
          { num: '04', title: 'Supply Chain Research' }
        ].map(item => (
          <TiltWrapper key={item.num} style={{ flex: '1 1 200px' }} multiplier={15}>
            <div style={{ color: '#FF3CAC', fontSize: '14px', marginBottom: '8px', fontWeight: 'bold' }}>#{item.num}</div>
            <div style={{ color: '#fff', fontSize: '16px' }}>{item.title}</div>
          </TiltWrapper>
        ))}
      </div>
    </section>
  );
};

const Ticker = () => {
  const content = "SHARK TANK INDIA S5 FINALIST ◆ 60K+ APPLICANTS OUTPERFORMED ◆ ₹2.5L REVENUE ◆ YEAR ONE ◆ 5000+ STUDENTS MENTORED ◆ WORLDQUANT GOLD CERTIFIED ◆ 99.2 JEE PERCENTILE ◆ 73% ML TRADING ACCURACY ◆ 8M+ FESTIVAL REACH ◆ ";
  return (
    <div style={{ width: '100%', background: '#00FFB2', color: '#01010A', overflow: 'hidden', padding: '10px 0', display: 'flex' }}>
      <div className="ticker-content" style={{ display: 'flex', whiteSpace: 'nowrap' }}>
        <div style={{ paddingRight: '20px' }} className="bebas">{content}</div>
        <div style={{ paddingRight: '20px' }} className="bebas">{content}</div>
        <div style={{ paddingRight: '20px' }} className="bebas">{content}</div>
      </div>
    </div>
  );
};

const ExperienceItem = ({ role, org, date, bullets }) => {
  const ref = useReveal();
  const [hover, setHover] = useState(false);
  
  return (
    <div ref={ref} className="reveal" style={{ position: 'relative', marginBottom: '40px', paddingLeft: '40px' }}
         onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div style={{
        position: 'absolute', left: '-6px', top: '10px', width: '12px', height: '12px',
        backgroundColor: '#00FFB2', borderRadius: '50%',
        boxShadow: hover ? '0 0 15px 5px rgba(0,255,178,0.4)' : '0 0 5px rgba(0,255,178,0)',
        transform: hover ? 'scale(1.5)' : 'scale(1)',
        transition: 'all 0.3s ease',
        zIndex: 2
      }}></div>
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid', borderColor: hover ? 'rgba(0,255,178,0.3)' : 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '4px', transition: 'transform 0.3s, border-color 0.3s', transform: hover ? 'translateX(10px)' : 'none' }}>
        <h3 style={{ fontSize: '20px', color: '#fff', marginBottom: '4px' }} className="bebas">{role}</h3>
        <div style={{ color: '#00FFB2', fontSize: '13px', marginBottom: '16px' }}>{org} <span style={{ color: 'rgba(255,255,255,0.4)' }}>// {date}</span></div>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {bullets.map((b, i) => (
            <li key={i} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px', display: 'flex', gap: '10px' }}>
              <span style={{ color: '#FF3CAC' }}>▹</span> {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const Experience = () => {
  const workEx = [
    { role: "Featured Entrepreneur & CEO", org: "Shark Tank India S5 + Catalyst Project", date: "Dec'24–Present", bullets: ["Incubated edtech, ₹2.5L+ revenue, 5k+ students, 20+ states.", "Outperformed 60k+ applicants to reach Season 5 Finale."] },
    { role: "Growth & Strategy Intern", org: "Masters' Union", date: "May'26–Present", bullets: ["Spearheaded growth initiatives.", "Developed high-impact strategic frameworks."] },
    { role: "Research Consultant", org: "WorldQuant", date: "Ongoing", bullets: ["Gold Certified quantitative researcher.", "Built predictive trading alphas."] },
    { role: "Supply Chain RA", org: "IIM Mumbai", date: "Jan'26–Present", bullets: ["Agentic AI + Semantic Knowledge Graphs.", "Implemented advanced supply chain solutions."] }
  ];

  const leadership = [
    { role: "Junior Consultant", org: "ShARE, IIT Bombay", date: "Jul'25–Present", bullets: ["Part of a global network across 130+ universities, 50+ countries.", "Consulting for cross-border strategic problems."] },
    { role: "Marketing Coordinator", org: "Mood Indigo", date: "Past", bullets: ["Asia's largest college fest.", "8M+ festival reach."] }
  ];

  return (
    <>
      <section id="experience" style={{ position: 'relative', padding: '80px 5% 40px', overflow: 'hidden' }}>
        <div className="section-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px' }}>
          <div>
            <div style={{ color: '#FF3CAC', fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>Behind the Journey</div>
            <h2 className="bebas" style={{ fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1, marginBottom: '30px' }}>SHAPING STRATEGIES THAT SCALE IMPACT</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px', lineHeight: 1.6 }}>
              I'm focused on building highly optimized ecosystems—from securing investments on national television to engineering algorithms that capture true market alpha.
            </p>
          </div>
          <div>
            <h2 className="bebas" style={{ fontSize: '32px', marginBottom: '40px', color: '#00FFB2' }}>WORK EXPERIENCE</h2>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '2px', background: '#00FFB2', boxShadow: '0 0 8px #00FFB2', zIndex: 1 }}></div>
              {workEx.map((e, i) => <ExperienceItem key={i} {...e} />)}
            </div>
          </div>
        </div>
      </section>
      
      <section id="leadership" style={{ position: 'relative', padding: '20px 5% 80px', overflow: 'hidden' }}>
        <div className="section-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px' }}>
          <div>
            <div style={{ color: '#FF3CAC', fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>Leading the Charge</div>
            <h2 className="bebas" style={{ fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1, marginBottom: '30px' }}>DRIVING GLOBAL INITIATIVES</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px', lineHeight: 1.6 }}>
              Whether consulting for cross-border projects or managing marketing for Asia's largest college fest, leadership is about amplifying reach and delivering excellence.
            </p>
          </div>
          <div>
            <h2 className="bebas" style={{ fontSize: '32px', marginBottom: '40px', color: '#00FFB2' }}>POSITIONS OF RESPONSIBILITY</h2>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '2px', background: '#00FFB2', boxShadow: '0 0 8px #00FFB2', zIndex: 1 }}></div>
              {leadership.map((e, i) => <ExperienceItem key={i} {...e} />)}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const ProjectCard = ({ title, desc, tag, stats, span2, icon }) => {
  const revealRef = useReveal();
  const cardRef = useRef(null);
  const [hover, setHover] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    setHover(false);
    if (!cardRef.current) return;
    cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  return (
    <div ref={revealRef} className="reveal" style={{ height: '100%' }}>
      <div ref={cardRef}
           onMouseEnter={() => setHover(true)} onMouseLeave={handleMouseLeave} onMouseMove={handleMouseMove}
           className="project-card-inner"
           style={{
             background: 'rgba(255,255,255,0.03)',
             border: '1px solid',
             borderColor: hover ? '#00FFB2' : 'rgba(255,255,255,0.1)',
             borderRadius: '8px',
             padding: '20px',
             display: 'flex',
             alignItems: 'center',
             gap: '20px',
             transition: 'border-color 0.3s ease, background 0.3s ease, transform 0.1s ease-out',
             cursor: 'none',
             height: '100%',
             willChange: 'transform',
             transformStyle: 'preserve-3d'
           }}>
      <div className="project-card-image" style={{ 
        width: '100px', height: '80px', borderRadius: '4px', flexShrink: 0,
        background: 'linear-gradient(135deg, rgba(0,255,178,0.15), rgba(255,60,172,0.15))',
        border: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', justifyContent: 'center', alignItems: 'center'
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <h3 className="bebas" style={{ fontSize: '24px', color: '#fff', marginBottom: '8px' }}>{title}</h3>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '8px' }}>{desc}</p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', perspective: '1000px' }}>
          <TiltWrapper multiplier={30}>
            <span style={{ display: 'inline-block', color: '#00FFB2', fontSize: '10px', background: 'rgba(0,255,178,0.1)', padding: '4px 8px', borderRadius: '2px' }}>{tag}</span>
          </TiltWrapper>
          {stats.map((s, i) => (
            <TiltWrapper key={i} multiplier={30}>
              <span style={{ display: 'inline-block', color: '#FF3CAC', fontSize: '10px', border: '1px solid rgba(255,60,172,0.3)', padding: '4px 8px', borderRadius: '2px' }}>{s}</span>
            </TiltWrapper>
          ))}
        </div>
      </div>
      <div className="project-card-arrow" style={{
        width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
        background: hover ? '#00FFB2' : 'rgba(255,255,255,0.05)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        transition: 'all 0.3s ease'
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={hover ? '#01010A' : '#00FFB2'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
      </div>
    </div>
  );
};

const Projects = () => {
  const projs = [
    { title: "ConsultX", tag: "STRATEGY", desc: "\"Apna Kirana\" digital ecosystem. Top 10 / 200+ teams.", stats: ["MECE model", "+8.5% EBITDA", "+208% profit"], icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg> },
    { title: "Trade Smarter", tag: "AI/ML", desc: "ML + Neural Net algo trading.", stats: ["73% win rate", "5-year backtest"], icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg> },
    { title: "Sustanium", tag: "AI", desc: "1st Prize. AI spectral classification.", stats: ["95% sorting acc.", "-25% labor cost"], icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg> },
    { title: "Agentic Supply Chain", tag: "RESEARCH", desc: "IIM Mumbai RA. Knowledge Graphs + IoT.", stats: ["real-time sync"], icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> }
  ];
  return (
    <section id="work" style={{ position: 'relative', padding: '120px 5%', overflow: 'hidden' }}>
      <div className="section-container">
        <div style={{ borderBottom: '1px solid rgba(0,255,178,0.3)', width: '60px', marginBottom: '20px' }}></div>
        <h2 className="bebas" style={{ fontSize: '48px', marginBottom: '60px' }}>WHAT I DO</h2>
        <div className="grid-2x2" style={{ display: 'grid', gap: '20px' }}>
          {projs.map((p, i) => <ProjectCard key={i} {...p} />)}
        </div>
      </div>
    </section>
  );
};

const Counter = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef();
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let startTime = null;
        const animate = (time) => {
          if (!startTime) startTime = time;
          const progress = Math.min((time - startTime) / duration, 1);
          const easeOutQuart = 1 - Math.pow(1 - progress, 4);
          setCount(Math.floor(easeOutQuart * end));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, [end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const Awards = () => {
  return (
    <section style={{ padding: '80px 5%', background: '#01010A', position: 'relative' }}>
      <div className="section-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
        <div className="reveal reveal-stagger-1" style={{ flex: '1 1 300px', background: 'rgba(255,255,255,0.02)', padding: '40px', borderTop: '2px solid #FF3CAC', textAlign: 'center' }}>
          <div className="bebas" style={{ fontSize: '72px', color: '#FF3CAC', lineHeight: 1 }}><Counter end={15000} suffix="+" /></div>
          <div style={{ color: '#00FFB2', fontSize: '14px', marginTop: '10px' }}>GLOBAL APPLICANTS</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '10px' }}>Top 5.8% (Global Recognition Award, Nov'25)</div>
        </div>
        <div className="reveal reveal-stagger-2" style={{ flex: '1 1 300px', background: 'rgba(255,255,255,0.02)', padding: '40px', borderTop: '2px solid #FF3CAC', textAlign: 'center' }}>
          <div className="bebas" style={{ fontSize: '72px', color: '#FF3CAC', lineHeight: 1 }}><Counter end={1500} suffix="+" /></div>
          <div style={{ color: '#00FFB2', fontSize: '14px', marginTop: '10px' }}>ENTREPRENEURS</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '10px' }}>Worldwide (Global Student Ent. Award, Dec'25)</div>
        </div>
      </div>
    </section>
  );
};

const Contact = () => {
  const ref = useReveal();
  return (
    <section id="contact" style={{ padding: '160px 5% 100px', position: 'relative', overflow: 'hidden' }}>
      <div className="watermark" style={{ top: '30%' }}>CONTACT</div>
      <div className="section-container">
        <div ref={ref} className="reveal" style={{ maxWidth: '640px', margin: '0 auto', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '60px 40px', textAlign: 'center' }}>
          <h2 className="bebas" style={{ fontSize: 'clamp(40px, 8vw, 64px)', marginBottom: '20px', color: '#fff' }}>LET'S BUILD SOMETHING.</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px', marginBottom: '40px' }}>
            Open to consulting, research, and high-conviction opportunities.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <a href="mailto:aryndhamdhere@gmail.com" className="btn-neon">aryndhamdhere@gmail.com</a>
            <a href="#" className="btn-neon">LinkedIn ↗</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default function App() {
  return (
    <>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background-color: #01010A; color: #fff;
  font-family: 'DM Mono', monospace;
  overflow-x: hidden; cursor: none; scroll-behavior: smooth;
}
::selection { background-color: #00FFB2; color: #01010A; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: #01010A; }
::-webkit-scrollbar-thumb { background: #00FFB2; }
h1, h2, h3, h4, h5, h6, .bebas { font-family: 'Bebas Neue', sans-serif; }
a, button { cursor: none; color: inherit; text-decoration: none; }
.reveal {
  opacity: 0; transform: translateY(40px);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal.visible { opacity: 1; transform: translateY(0); }
.reveal-stagger-1 { transition-delay: 0.1s; }
.reveal-stagger-2 { transition-delay: 0.2s; }
.reveal-stagger-3 { transition-delay: 0.3s; }
.glitch-wrapper { position: relative; display: inline-block; }
.glitch { position: relative; color: white; }
.glitch::before, .glitch::after {
  content: attr(data-text); position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: transparent;
}
.glitch::before {
  text-shadow: 2px 0 #FF3CAC;
  animation: glitch-anim 4s infinite linear alternate-reverse;
}
.glitch::after {
  text-shadow: -2px 0 #00FFB2;
  animation: glitch-anim2 4s infinite linear alternate-reverse;
}
@keyframes glitch-anim {
  0%, 90% { clip-path: rect(0, 0, 0, 0); transform: translate(0); }
  91% { clip-path: rect(10px, 9999px, 44px, 0); transform: translate(-4px); }
  93% { clip-path: rect(40px, 9999px, 70px, 0); transform: translate(4px); }
  95% { clip-path: rect(20px, 9999px, 30px, 0); transform: translate(-4px); }
  97% { clip-path: rect(60px, 9999px, 90px, 0); transform: translate(4px); }
  99%, 100% { clip-path: rect(0, 0, 0, 0); transform: translate(0); }
}
@keyframes glitch-anim2 {
  0%, 90% { clip-path: rect(0, 0, 0, 0); transform: translate(0); }
  91% { clip-path: rect(65px, 9999px, 100px, 0); transform: translate(4px); }
  93% { clip-path: rect(10px, 9999px, 20px, 0); transform: translate(-4px); }
  95% { clip-path: rect(40px, 9999px, 50px, 0); transform: translate(4px); }
  97% { clip-path: rect(80px, 9999px, 95px, 0); transform: translate(-4px); }
  99%, 100% { clip-path: rect(0, 0, 0, 0); transform: translate(0); }
}
@keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-33.3333%); } }
.watermark {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  font-family: 'Bebas Neue', sans-serif; font-size: 18vw; color: #fff;
  opacity: 0.03; pointer-events: none; white-space: nowrap; z-index: 0;
}
.section-container { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; }
.nav-btn-neon {
  padding: 10px 20px; border: 1px solid rgba(0, 255, 178, 0.3); color: #fff;
  transition: all 0.3s ease; border-radius: 2px;
}
.nav-btn-neon:hover {
  background: rgba(0, 255, 178, 0.1); border-color: #00FFB2; color: #00FFB2;
  box-shadow: 0 0 10px rgba(0,255,178,0.2);
}
.blink { animation: blink 1s infinite; }
@keyframes blink { 50% { opacity: 0; } }
.btn-neon {
  padding: 15px 30px; border: 1px solid #00FFB2; color: #00FFB2;
  font-family: 'DM Mono', monospace; font-size: 14px; letter-spacing: 1px;
  background: rgba(0, 255, 178, 0.05); transition: all 0.3s ease; display: inline-block;
}
.btn-neon:hover {
  background: #00FFB2; color: #01010A; box-shadow: 0 0 20px rgba(0,255,178,0.4);
}
.btn-ghost {
  padding: 15px 30px; border: 1px solid rgba(255, 255, 255, 0.2); color: #fff;
  font-family: 'DM Mono', monospace; font-size: 14px; letter-spacing: 1px;
  transition: all 0.3s ease; display: inline-block;
}
.btn-ghost:hover { background: rgba(255, 255, 255, 0.1); border-color: #fff; }
.ticker-content { animation: ticker 25s linear infinite; font-size: 15px; }
.grid-2x2 { grid-template-columns: 1fr; }
.project-card-inner { flex-direction: row; }
@media (min-width: 768px) { .grid-2x2 { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) {
  .nav-links { display: none !important; }
  .hero-buttons { flex-direction: column; width: 100%; }
  .btn-neon, .btn-ghost { width: 100%; text-align: center; }
  .project-card-inner { flex-direction: column !important; align-items: flex-start !important; }
  .project-card-image { width: 100% !important; height: 120px !important; }
  .project-card-arrow { align-self: flex-end; }
}
      `}</style>
      <Cursor />
      <Navbar />
      <main>
         <Hero />
         <Ticker />
         <Experience />
         <Projects />
         <Awards />
         <Contact />
      </main>
    </>
  );
}
