const questions = [
    {
      question: "Qual é a forma correta do verbo 'to be' para a frase: 'She ___ a doctor.'?",
      options: ["am", "is", "are", "be"],
      correct: 1,
      rationale: "Usamos 'is' para os pronomes da terceira pessoa do singular (he, she, it)."
    },
    {
      question: "Qual das palavras abaixo é o plural correto de 'child'?",
      options: ["childs", "childrens", "children", "childes"],
      correct: 2,
      rationale: "'Child' possui um plural irregular: 'children' (sem o 's' no final)."
    },
    {
      question: "Como se diz 'Amanhã de manhã' em inglês?",
      options: ["Tomorrow morning", "Yesterday morning", "Today morning", "Tonight morning"],
      correct: 0,
      rationale: "'Tomorrow' significa amanhã e 'morning' significa manhã."
    },
    {
      question: "Escolha a frase correta no presente simples (Simple Present):",
      options: ["He like apples.", "He likes apples.", "He is like apples.", "He liking apples."],
      correct: 1,
      rationale: "No Simple Present, adicionamos '-s' ou '-es' ao verbo principal para 'he', 'she' e 'it'."
    },
    {
      question: "Qual o oposto da palavra 'Hot'?",
      options: ["Warm", "Dry", "Cold", "Tall"],
      correct: 2,
      rationale: "'Hot' significa quente e seu oposto direto é 'Cold' (frio)."
    },
    {
      question: "Qual artigo indefinido deve ser usado antes de 'apple'?",
      options: ["a", "an", "the", "some"],
      correct: 1,
      rationale: "Usamos o artigo 'an' antes de palavras que começam com som de vogal."
    },
    {
      question: "Qual é a pergunta correta para saber a hora em inglês?",
      options: ["What time is it?", "How many hours it is?", "What hour you have?", "Which time is?"],
      correct: 0,
      rationale: "'What time is it?' é a expressão padrão para perguntar as horas."
    },
    {
      question: "Qual é o passado simples do verbo 'to go'?",
      options: ["goed", "gone", "went", "going"],
      correct: 2,
      rationale: "'Go' é um verbo irregular. Seu passado simples é 'went'."
    },
    {
      question: "Complete a frase: 'They ___ playing soccer right now.'",
      options: ["is", "are", "am", "be"],
      correct: 1,
      rationale: "Usamos 'are' para a terceira pessoa do plural ('they') no Present Continuous."
    },
    {
      question: "Qual destas palavras representa um dia da semana?",
      options: ["January", "Monday", "Summer", "Tomorrow"],
      correct: 1,
      rationale: "'Monday' (segunda-feira) é um dia da semana. 'January' é mês e 'Summer' é estação."
    }
  ];
  
  let currentQuestionIndex = 0;
  let score = 0;
  let lives = 3;
  let has5050 = true;
  let answered = false;
  
  // Controle de tempo
  const QUESTION_TIME_LIMIT = 60;
  let timeLeft = QUESTION_TIME_LIMIT;
  let timerInterval = null;
  
  // Áudio via Web Audio API
  let audioCtx = null;
  
  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }
  
  function playSound(type) {
    initAudio();
    if (!audioCtx) return;
  
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
  
    const now = audioCtx.currentTime;
  
    if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'tick') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'victory') {
      // Sequência de notas de vitória
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const noteOsc = audioCtx.createOscillator();
        const noteGain = audioCtx.createGain();
        noteOsc.connect(noteGain);
        noteGain.connect(audioCtx.destination);
        noteOsc.frequency.value = freq;
        noteGain.gain.setValueAtTime(0.15, now + i * 0.12);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.25);
        noteOsc.start(now + i * 0.12);
        noteOsc.stop(now + i * 0.12 + 0.25);
      });
    }
  }
  
  // Inicializar e carregar Recorde
  document.addEventListener("DOMContentLoaded", () => {
    loadHighScore();
  });
  
  function loadHighScore() {
    const savedScore = localStorage.getItem("quiz_high_score") || 0;
    document.getElementById("high-score").innerText = `${savedScore} / ${questions.length}`;
  }
  
  function updateHighScore() {
    const savedScore = parseInt(localStorage.getItem("quiz_high_score") || 0);
    if (score > savedScore) {
      localStorage.setItem("quiz_high_score", score);
      loadHighScore();
    }
  }
  
  function startQuiz() {
    initAudio();
    currentQuestionIndex = 0;
    score = 0;
    lives = 3;
    has5050 = true;
  
    updateLivesDisplay();
    reset5050Button();
  
    document.getElementById("start-screen").classList.add("hidden");
    document.getElementById("result-screen").classList.add("hidden");
    document.getElementById("quiz-screen").classList.remove("hidden");
    showQuestion();
  }
  
  function updateLivesDisplay() {
    for (let i = 1; i <= 3; i++) {
      const heart = document.getElementById(`heart-${i}`);
      if (i <= lives) {
        heart.innerText = "❤️";
        heart.classList.remove("opacity-20");
      } else {
        heart.innerText = "🖤";
        heart.classList.add("opacity-20");
      }
    }
  }
  
  function reset5050Button() {
    const btn = document.getElementById("help-5050-btn");
    btn.disabled = false;
    btn.classList.remove("opacity-40", "cursor-not-allowed");
    document.getElementById("help-badge").innerText = "1";
  }
  
  function use5050() {
    if (!has5050 || answered) return;
    has5050 = false;
  
    const btn = document.getElementById("help-5050-btn");
    btn.disabled = true;
    btn.classList.add("opacity-40", "cursor-not-allowed");
    document.getElementById("help-badge").innerText = "0";
  
    const q = questions[currentQuestionIndex];
    const buttons = document.getElementById("options-container").children;
  
    let wrongIndexes = [];
    q.options.forEach((_, idx) => {
      if (idx !== q.correct) wrongIndexes.push(idx);
    });
  
    // Embaralhar e escolher 2 erradas para esconder
    wrongIndexes.sort(() => Math.random() - 0.5);
    const toHide = wrongIndexes.slice(0, 2);
  
    toHide.forEach(idx => {
      buttons[idx].classList.add("option-hidden");
      buttons[idx].disabled = true;
    });
  }
  
  function startTimer() {
    clearInterval(timerInterval);
    timeLeft = QUESTION_TIME_LIMIT;
    updateTimerDisplay();
  
    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
  
      // Som de tique-taque nos últimos 10 segundos
      if (timeLeft <= 10 && timeLeft > 0) {
        playSound('tick');
      }
  
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        handleTimeOut();
      }
    }, 1000);
  }
  
  function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    
    const timerElem = document.getElementById("timer-display");
    timerElem.innerText = `⏱️ ${formattedMinutes}:${formattedSeconds}`;
  
    if (timeLeft <= 10) {
      timerElem.classList.remove("bg-amber-500/10", "text-amber-400", "border-amber-500/20");
      timerElem.classList.add("bg-rose-500/20", "text-rose-400", "border-rose-500/30", "animate-pulse");
    } else {
      timerElem.classList.remove("bg-rose-500/20", "text-rose-400", "border-rose-500/30", "animate-pulse");
      timerElem.classList.add("bg-amber-500/10", "text-amber-400", "border-amber-500/20");
    }
  }
  
  function handleTimeOut() {
    if (answered) return;
    answered = true;
  
    playSound('wrong');
    deductLife();
  
    const q = questions[currentQuestionIndex];
    const buttons = document.getElementById("options-container").children;
  
    buttons[q.correct].classList.remove("bg-slate-700/60", "border-slate-600");
    buttons[q.correct].classList.add("bg-emerald-600/20", "border-emerald-500", "text-emerald-300");
  
    for (let btn of buttons) {
      btn.classList.add("cursor-default");
    }
  
    document.getElementById("explanation-text").innerText = `Tempo esgotado! ${q.rationale}`;
    document.getElementById("explanation").classList.remove("hidden");
    document.getElementById("next-btn").classList.remove("hidden");
  }
  
  function showQuestion() {
    answered = false;
    const q = questions[currentQuestionIndex];
  
    const progressPercent = (currentQuestionIndex / questions.length) * 100;
    document.getElementById("progress-bar").style.width = `${progressPercent}%`;
  
    document.getElementById("question-number").innerText = `Pergunta ${currentQuestionIndex + 1} de ${questions.length}`;
    document.getElementById("score-count").innerText = `Pontos: ${score}`;
    document.getElementById("question-text").innerText = q.question;
  
    const optionsContainer = document.getElementById("options-container");
    optionsContainer.innerHTML = "";
  
    document.getElementById("explanation").classList.add("hidden");
    document.getElementById("next-btn").classList.add("hidden");
  
    q.options.forEach((opt, idx) => {
      const btn = document.createElement("button");
      btn.className = "w-full text-left p-4 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-100 font-medium border border-slate-600 transition-all flex justify-between items-center";
      btn.innerHTML = `<span>${opt}</span><span id="icon-${idx}"></span>`;
      btn.onclick = () => selectOption(idx);
      optionsContainer.appendChild(btn);
    });
  
    startTimer();
  }
  
  function deductLife() {
    lives--;
    updateLivesDisplay();
  
    if (lives <= 0) {
      setTimeout(() => {
        showResults(true); // Game Over
      }, 1500);
    }
  }
  
  function selectOption(index) {
    if (answered) return;
    answered = true;
    clearInterval(timerInterval);
  
    const q = questions[currentQuestionIndex];
    const buttons = document.getElementById("options-container").children;
  
    if (index === q.correct) {
      score++;
      playSound('correct');
      buttons[index].classList.remove("bg-slate-700/60", "border-slate-600");
      buttons[index].classList.add("bg-emerald-600/20", "border-emerald-500", "text-emerald-300");
      document.getElementById(`icon-${index}`).innerHTML = '✓';
    } else {
      playSound('wrong');
      deductLife();
  
      buttons[index].classList.remove("bg-slate-700/60", "border-slate-600");
      buttons[index].classList.add("bg-rose-600/20", "border-rose-500", "text-rose-300");
      document.getElementById(`icon-${index}`).innerHTML = '✗';
  
      buttons[q.correct].classList.remove("bg-slate-700/60", "border-slate-600");
      buttons[q.correct].classList.add("bg-emerald-600/20", "border-emerald-500", "text-emerald-300");
    }
  
    for (let btn of buttons) {
      btn.classList.add("cursor-default");
    }
  
    document.getElementById("explanation-text").innerText = q.rationale;
    document.getElementById("explanation").classList.remove("hidden");
  
    if (lives > 0) {
      document.getElementById("next-btn").classList.remove("hidden");
    }
    document.getElementById("score-count").innerText = `Pontos: ${score}`;
  }
  
  function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length && lives > 0) {
      showQuestion();
    } else {
      showResults(false);
    }
  }
  
  function showResults(gameOver = false) {
    clearInterval(timerInterval);
    updateHighScore();
  
    document.getElementById("progress-bar").style.width = "100%";
    document.getElementById("quiz-screen").classList.add("hidden");
    document.getElementById("result-screen").classList.remove("hidden");
  
    document.getElementById("final-score").innerText = `${score} / ${questions.length}`;
  
    const iconContainer = document.getElementById("result-icon");
    const title = document.getElementById("result-title");
    const msg = document.getElementById("result-message");
    const tipsList = document.getElementById("study-tips");
    tipsList.innerHTML = "";
  
    let tips = [];
  
    if (gameOver) {
      iconContainer.className = "inline-flex p-4 bg-rose-500/10 text-rose-400 rounded-full mb-4";
      iconContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>`;
      title.innerText = "Game Over!";
      msg.innerText = "Suas vidas acabaram antes de completar todas as perguntas.";
      tips = [
        "Revise o conteúdo com calma e tente responder sem pressa.",
        "Use o botão de Ajuda 50:50 em perguntas onde tiver dúvida.",
        "A prática constante ajudará você a responder mais rápido."
      ];
    } else {
      if (score >= 7) {
        playSound('victory');
        // Lança os confetes
        if (typeof confetti === 'function') {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
      }
  
      iconContainer.className = "inline-flex p-4 bg-emerald-500/10 text-emerald-400 rounded-full mb-4";
      iconContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
      title.innerText = "Quiz Concluído!";
  
      if (score === 10) {
        msg.innerText = "Incrível! Pontuação perfeita!";
        tips = [
          "Pratique conversação lendo artigos ou notícias em inglês.",
          "Assista a vídeos curtos com áudio e legendas em inglês.",
          "Explore temas intermediários como Present Perfect e Phrasal Verbs."
        ];
      } else if (score >= 7) {
        msg.innerText = "Muito bem! Você tem uma excelente base no idioma.";
        tips = [
          "Revise verbos no passado irregular (ex: 'go' -> 'went').",
          "Pratique o uso dos artigos 'a' e 'an' em frases.",
          "Ouça músicas em inglês acompanhando a letra."
        ];
      } else {
        msg.innerText = "Bom esforço! Continue treinando para alcançar notas maiores.";
        tips = [
          "Revisite o Verbo To Be e a regra do '-s' no Simple Present.",
          "Faça cartões de memória (flashcards) para os dias da semana e vocabulário.",
          "Dedique 10 a 15 minutos diários de estudo."
        ];
      }
    }
  
    tips.forEach(tip => {
      const li = document.createElement("li");
      li.innerText = tip;
      tipsList.appendChild(li);
    });
  }
  
  function restartQuiz() {
    startQuiz();
  }