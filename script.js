const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const nextBtn = document.getElementById('next-btn');
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const endScreen = document.getElementById('end-screen');
const questionText = document.getElementById('question-text');
const answersDiv = document.getElementById('answers');
const feedback = document.getElementById('feedback');
const questionCountText = document.getElementById('question-count');
const currentScoreText = document.getElementById('current-score');
const finalScoreText = document.getElementById('final-score');
const progressBar = document.getElementById('progress-bar'); // New

let questions = [];
let currentQuestionIndex = 0;
let score = 0;

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

function decodeHTML(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

async function fetchQuestions(amount = 5) {
  const category = document.getElementById('category-select').value;
  const difficulty = document.getElementById('difficulty-select').value;
  
  let url = `https://opentdb.com/api.php?amount=${amount}&type=multiple`;
  if (category) url += `&category=${category}`;
  if (difficulty) url += `&difficulty=${difficulty}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    return data.results;
  } catch (error) {
    console.error('Fetch error:', error);
    alert('Could not load questions. Please try again later.');
    return [];
  }
}

function showQuestion() {
  feedback.textContent = '';
  nextBtn.classList.add('hidden');
  currentScoreText.textContent = `Score: ${score}`;
  
  // Update Progress Bar
  const progressPercentage = (currentQuestionIndex / questions.length) * 100;
  progressBar.style.width = `${progressPercentage}%`;
  
  const q = questions[currentQuestionIndex];
  questionText.innerHTML = decodeHTML(q.question);

  const options = shuffleArray([q.correct_answer, ...q.incorrect_answers]).map(opt => decodeHTML(opt));
  answersDiv.innerHTML = '';
  
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    // Premium styling for answer buttons
    btn.className = 'answer-btn block w-full text-left border-2 border-gray-200 px-5 py-4 rounded-xl font-semibold text-gray-700 hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 shadow-sm';
    
    btn.addEventListener('click', () => checkAnswer(opt, btn));
    answersDiv.appendChild(btn);
  });

  questionCountText.textContent = `Question ${currentQuestionIndex + 1} / ${questions.length}`;
}

function checkAnswer(selected, clickedBtn) {
  const correct = decodeHTML(questions[currentQuestionIndex].correct_answer);
  
  const allBtns = document.querySelectorAll('.answer-btn');
  allBtns.forEach(btn => {
    btn.disabled = true;
    btn.classList.remove('hover:border-indigo-500', 'hover:bg-indigo-50');
    btn.classList.add('cursor-not-allowed', 'opacity-70');
    
    // Highlight correct answer
    if (btn.textContent === correct) {
      btn.classList.remove('border-gray-200', 'text-gray-700');
      btn.classList.add('bg-green-100', 'border-green-500', 'text-green-800');
    }
  });

  if (selected === correct) {
    feedback.textContent = '🎉 Correct!';
    feedback.className = "text-green-600 font-extrabold text-xl animate-bounce";
    score++;
    currentScoreText.textContent = `Score: ${score}`;
  } else {
    feedback.textContent = `❌ Incorrect!`;
    feedback.className = "text-red-500 font-extrabold text-xl";
    // Highlight wrong answer clicked
    clickedBtn.classList.remove('border-gray-200', 'text-gray-700');
    clickedBtn.classList.add('bg-red-100', 'border-red-500', 'text-red-800');
  }

  nextBtn.classList.remove('hidden');
  if (currentQuestionIndex === questions.length - 1) {
    nextBtn.textContent = "Finish Quiz 🏁";
  } else {
    nextBtn.textContent = "Next Question ➡️";
  }
}

nextBtn.addEventListener('click', () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    endQuiz();
  }
});

startBtn.addEventListener('click', async () => {
  const numQuestions = parseInt(document.getElementById('num-questions').value) || 5;
  
  const originalText = startBtn.textContent;
  startBtn.textContent = 'Loading Questions... ⏳';
  startBtn.disabled = true;
  startBtn.classList.add('animate-pulse'); // Add a loading pulse effect

  questions = await fetchQuestions(numQuestions);
  
  startBtn.textContent = originalText;
  startBtn.disabled = false;
  startBtn.classList.remove('animate-pulse');

  if (questions.length === 0) return;

  startScreen.classList.add('hidden');
  quizScreen.classList.remove('hidden');

  currentQuestionIndex = 0;
  score = 0;
  showQuestion();
});

function endQuiz() {
  quizScreen.classList.add('hidden');
  endScreen.classList.remove('hidden');
  
  // Max out progress bar
  progressBar.style.width = '100%';
  
  const percentage = Math.round((score / questions.length) * 100);
  finalScoreText.innerHTML = `You scored <span class="text-4xl text-black">${score}</span> out of ${questions.length}<br><span class="text-lg text-gray-500 mt-2 block">(${percentage}% Accuracy)</span>`;
}

restartBtn.addEventListener('click', () => {
  endScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
  // Reset select dropdowns and inputs (optional)
  document.getElementById('category-select').value = "";
  document.getElementById('difficulty-select').value = "";
  document.getElementById('num-questions').value = "5";
});