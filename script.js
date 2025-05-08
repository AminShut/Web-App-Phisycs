// DOM Elements
const questionsBtn = document.getElementById('questionsBtn');
const tutorialsBtn = document.getElementById('tutorialsBtn');
const aboutUsBtn = document.getElementById('aboutUsBtn');
const backToMainFromQuestionsChapters = document.getElementById('backToMainFromQuestionsChapters');
const backToMainFromTutorialsChapters = document.getElementById('backToMainFromTutorialsChapters');
const backToMainFromAboutUs = document.getElementById('backToMainFromAboutUs');
const backToQuestionsChapters = document.getElementById('backToQuestionsChapters');
const backToQuestionsList = document.getElementById('backToQuestionsList');
const backToTutorialsChapters = document.getElementById('backToTutorialsChapters');
const questionsChaptersList = document.getElementById('questionsChaptersList');
const tutorialsChaptersList = document.getElementById('tutorialsChaptersList');
const questionsList = document.getElementById('questionsList');
const questionText = document.getElementById('questionText');
const tutorialText = document.getElementById('tutorialText');

// Navigation variables
let currentChapter = '';
let currentQuestion = '';
let currentTutorialChapter = '';
let chaptersData = [];

// Load chapters data from foolders.json
let foldersData = null;
fetch('foolders.json')
    .then(response => response.json())
    .then(data => {
        console.log("JSON data loaded successfully", data);
        foldersData = data;
        // Generate initial UI with loaded data
        generateQuestionsChapters();
        generateTutorialsChapters();
    })
    .catch(error => {
        console.error('Error loading data:', error);
    });

// Screens
const screens = {
    mainScreen: document.getElementById('mainScreen'),
    aboutUsScreen: document.getElementById('aboutUsScreen'),
    questionsChaptersScreen: document.getElementById('questionsChaptersScreen'),
    questionsListScreen: document.getElementById('questionsListScreen'),
    questionDetailScreen: document.getElementById('questionDetailScreen'),
    tutorialsChaptersScreen: document.getElementById('tutorialsChaptersScreen'),
    tutorialDetailScreen: document.getElementById('tutorialDetailScreen')
};

// Screen titles
const questionsListTitle = document.getElementById('questionsListTitle');
const questionDetailTitle = document.getElementById('questionDetailTitle');
const tutorialDetailTitle = document.getElementById('tutorialDetailTitle');

// Navigation function
function showScreen(screenId) {
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    screens[screenId].classList.add('active');
}

// Generate chapters for Questions
function generateQuestionsChapters() {
    questionsChaptersList.innerHTML = '';
    
    if (foldersData && foldersData.files && foldersData.files.length > 0) {
        console.log("Generating chapters from JSON data");
        // Use data from JSON file
        foldersData.files.forEach((chapter, index) => {
            const chapterElement = document.createElement('div');
            chapterElement.className = 'chapter-card';
            chapterElement.innerHTML = `<h3>${chapter.name}</h3>`;
            chapterElement.addEventListener('click', () => {
                currentChapter = chapter;
                questionsListTitle.innerHTML = `<span class="material-icons">help_outline</span>${chapter.name}`;
                generateQuestions(chapter);
                showScreen('questionsListScreen');
            });
            questionsChaptersList.appendChild(chapterElement);
        });
    } else {
        console.log("Falling back to numbered chapters");
        // Fallback to numbered chapters
        for (let i = 1; i <= 20; i++) {
            const chapter = document.createElement('div');
            chapter.className = 'chapter-card';
            chapter.innerHTML = `<h3>فصل ${i}</h3>`;
            chapter.addEventListener('click', () => {
                currentChapter = `فصل ${i}`;
                questionsListTitle.innerHTML = `<span class="material-icons">help_outline</span>${currentChapter}`;
                generateQuestions();
                showScreen('questionsListScreen');
            });
            questionsChaptersList.appendChild(chapter);
        }
    }
}

// Generate chapters for Tutorials
function generateTutorialsChapters() {
    tutorialsChaptersList.innerHTML = '';
    
    if (foldersData && foldersData.files && foldersData.files.length > 0) {
        console.log("Generating tutorial chapters from JSON data");
        // Use data from JSON file
        foldersData.files.forEach((chapter, index) => {
            const chapterElement = document.createElement('div');
            chapterElement.className = 'chapter-card';
            chapterElement.innerHTML = `<h3>${chapter.name}</h3>`;
            chapterElement.addEventListener('click', () => {
                currentTutorialChapter = chapter;
                tutorialDetailTitle.innerHTML = `<span class="material-icons">menu_book</span>${chapter.name}`;
                
                // Find tutorial subject
                const tutorialSubject = chapter.subjects.find(subject => subject.name.includes("درسنامه"));
                if (tutorialSubject && tutorialSubject.id) {
                    const driveLink = `https://drive.google.com/file/d/${tutorialSubject.id}/view`;
                    tutorialText.innerHTML = `<a href="${driveLink}" target="_blank" class="drive-link">برای مشاهده درسنامه ${chapter.name} اینجا کلیک کنید</a>`;
                } else {
                    tutorialText.textContent = `درسنامه برای ${chapter.name} در دسترس نیست.`;
                }
                
                showScreen('tutorialDetailScreen');
            });
            tutorialsChaptersList.appendChild(chapterElement);
        });
    } else {
        console.log("Falling back to numbered tutorial chapters");
        // Fallback to numbered chapters
        for (let i = 1; i <= 20; i++) {
            const chapter = document.createElement('div');
            chapter.className = 'chapter-card';
            chapter.innerHTML = `<h3>فصل ${i}</h3>`;
            chapter.addEventListener('click', () => {
                currentTutorialChapter = `فصل ${i}`;
                tutorialDetailTitle.innerHTML = `<span class="material-icons">menu_book</span>${currentTutorialChapter}`;
                tutorialText.textContent = `درسنامه برای ${currentTutorialChapter} در دسترس نیست.`;
                showScreen('tutorialDetailScreen');
            });
            tutorialsChaptersList.appendChild(chapter);
        }
    }
}

// Generate questions
function generateQuestions(chapter) {
    questionsList.innerHTML = '';
    
    // Create a container for all questions
    const container = document.createElement('div');
    container.className = 'question-list';
    
    if (chapter && chapter.subjects) {
        // Find questions subject
        const questionsSubject = chapter.subjects.find(subject => subject.name.includes("مسائل کتاب هالیدی"));
        
        if (questionsSubject && questionsSubject.questions && questionsSubject.questions.length > 0) {
            console.log(`Found ${questionsSubject.questions.length} questions for chapter`, chapter.name);
            // Sort questions by name (to ensure proper order)
            const sortedQuestions = [...questionsSubject.questions].sort((a, b) => {
                // Extract numbers from question names (e.g., "سوال 45" -> 45)
                const numA = parseInt(a.name.match(/\d+/)[0]);
                const numB = parseInt(b.name.match(/\d+/)[0]);
                return numB - numA; // Reverse order (high to low)
            });
            
            sortedQuestions.forEach(q => {
                const question = document.createElement('div');
                question.className = 'question-card';
                question.innerHTML = `<h3>${q.name}</h3>`;
                question.addEventListener('click', () => {
                    currentQuestion = q.name;
                    questionDetailTitle.innerHTML = `<span class="material-icons">help_outline</span>${chapter.name} - ${currentQuestion}`;
                    
                    const driveLink = `https://drive.google.com/file/d/${q.id}/view`;
                    questionText.innerHTML = `<a href="${driveLink}" target="_blank" class="drive-link">برای مشاهده ${currentQuestion} از ${chapter.name} اینجا کلیک کنید</a>`;
                    
                    showScreen('questionDetailScreen');
                });
                container.appendChild(question);
            });
        } else {
            console.log("No questions found for chapter, falling back to default questions");
            const noQuestions = document.createElement('div');
            noQuestions.className = 'no-questions';
            noQuestions.textContent = `هیچ سوالی برای ${chapter.name} یافت نشد.`;
            container.appendChild(noQuestions);
        }
    } else {
        console.log("No chapter data, falling back to default questions");
        // Fallback to default 100 questions
        for (let i = 1; i <= 100; i++) {
            const question = document.createElement('div');
            question.className = 'question-card';
            question.innerHTML = `<h3>سوال ${i}</h3>`;
            question.addEventListener('click', () => {
                currentQuestion = `سوال ${i}`;
                questionDetailTitle.innerHTML = `<span class="material-icons">help_outline</span>${currentChapter} - ${currentQuestion}`;
                questionText.textContent = `لینک سوال برای ${currentChapter} - ${currentQuestion} در دسترس نیست.`;
                showScreen('questionDetailScreen');
            });
            container.appendChild(question);
        }
    }
    
    questionsList.appendChild(container);
}

// Event Listeners
questionsBtn.addEventListener('click', () => {
    generateQuestionsChapters();
    showScreen('questionsChaptersScreen');
});

tutorialsBtn.addEventListener('click', () => {
    generateTutorialsChapters();
    showScreen('tutorialsChaptersScreen');
});

aboutUsBtn.addEventListener('click', () => {
    showScreen('aboutUsScreen');
});

backToMainFromQuestionsChapters.addEventListener('click', () => {
    showScreen('mainScreen');
});

backToMainFromTutorialsChapters.addEventListener('click', () => {
    showScreen('mainScreen');
});

backToMainFromAboutUs.addEventListener('click', () => {
    showScreen('mainScreen');
});

backToQuestionsChapters.addEventListener('click', () => {
    showScreen('questionsChaptersScreen');
});

backToQuestionsList.addEventListener('click', () => {
    showScreen('questionsListScreen');
});

backToTutorialsChapters.addEventListener('click', () => {
    showScreen('tutorialsChaptersScreen');
});

// Initial setup - let fetch complete first
// Removed initial calls here since they are now triggered from the fetch callback 