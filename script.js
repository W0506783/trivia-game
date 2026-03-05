const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const endScreen = document.getElementById('end-screen');
const questionText = document.getElementById('question-text');
const answersDiv = document.getElementById('answers');
const feedback = document.getElementById('feedback');
const questionCountText = document.getElementById('question-count');
const finalScoreText = document.getElementById('final-score');

let questions = [];
let currentQuestionIndex = 0;
let score = 0;

// Shuffle array helper
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}
function decodeHTML(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}


// Fetch questions from API
async function fetchQuestions(amount = 5) {
  const category = document.getElementById('category-select').value; // Step 1: get selected category
  let url = `https://opentdb.com/api.php?amount=${amount}&type=multiple`;
  if (category) {
    url += `&category=${category}`; // add category to URL if selected
  }

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

// Show question
function showQuestion() {
  feedback.textContent = '';
  const q = questions[currentQuestionIndex];
  questionText.innerHTML = decodeHTML(q.question);

  // Combine correct + incorrect answers
  const options = shuffleArray([q.correct_answer, ...q.incorrect_answers])
  .map(opt => decodeHTML(opt));
  answersDiv.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.className = 'block w-full text-left border px-4 py-2 rounded hover:bg-gray-200';
    btn.addEventListener('click', () => checkAnswer(opt));
    answersDiv.appendChild(btn);
  });

  questionCountText.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
}

// Check answer
function checkAnswer(selected) {
  const correct = questions[currentQuestionIndex].correct_answer;
  if (selected === correct) {
    feedback.textContent = '✅ Correct!';
    score++;
  } else {
    feedback.textContent = `❌ Wrong! Correct answer: ${correct}`;
  }

  // Move to next question after short delay
  setTimeout(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      showQuestion();
    } else {
      endQuiz();
    }
  }, 1000);
}

// Start Quiz
startBtn.addEventListener('click', async () => {
  const numQuestions = parseInt(document.getElementById('num-questions').value) || 5;
  startScreen.classList.add('hidden');
  quizScreen.classList.remove('hidden');

  questions = await fetchQuestions(numQuestions);
  if (questions.length === 0) {
    startScreen.classList.remove('hidden');
    quizScreen.classList.add('hidden');
    return;
  }

  currentQuestionIndex = 0;
  score = 0;
  showQuestion();
});

// End Quiz
function endQuiz() {
  quizScreen.classList.add('hidden');
  endScreen.classList.remove('hidden');
  finalScoreText.textContent = `You scored ${score} out of ${questions.length}!`;
}

// Restart Quiz
restartBtn.addEventListener('click', () => {
  endScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
});