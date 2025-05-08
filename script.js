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
let currentTutorialIndex = 0;
let chaptersData = [];
let currentQuestionIndex = 0;
let chapterQuestions = [];
let tutorialChapters = [];

// Load chapters data
let foldersData = null;

// Load JSON data using XMLHttpRequest instead of fetch
function loadJSONData() {
    console.log("Attempting to load JSON data...");
    
    // First try loading from a global variable if it exists (used for inline JSON)
    if (typeof window.inlineJsonData !== 'undefined' && window.inlineJsonData) {
        console.log("Found inline JSON data, using it");
        try {
            foldersData = window.inlineJsonData;
            console.log(`Found ${foldersData.files.length} chapters in inline JSON`);
            generateQuestionsChapters();
            generateTutorialsChapters();
            return;
        } catch (e) {
            console.error("Error using inline JSON:", e);
        }
    }
    
    // Then try loading from files
    tryLoadingJSON('foolders_utf8.json', function(success) {
        if (!success) {
            tryLoadingJSON('foolders_fixed.json', function(success) {
                if (!success) {
                    tryLoadingJSON('foolders.json', function(success) {
                        if (!success) {
                            console.error("Failed to load any JSON file");
                            fallbackToDefaultChapters();
                        }
                    });
                }
            });
        }
    });
}

// Try loading a specific JSON file
function tryLoadingJSON(filename, callback) {
    console.log(`Attempting to load ${filename}`);
    const xhr = new XMLHttpRequest();
    xhr.overrideMimeType("application/json;charset=UTF-8");
    xhr.open('GET', filename, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    // Check if response is empty
                    if (!xhr.responseText || xhr.responseText.trim() === '') {
                        console.error(`${filename} loaded but is empty`);
                        callback(false);
                        return;
                    }
                    
                    // Log response details for debugging
                    console.log(`Response received for ${filename}, length:`, xhr.responseText.length);
                    console.log(`First few characters:`, xhr.responseText.substring(0, 50));
                    
                    // Check for BOM characters that might cause parsing issues
                    const firstChar = xhr.responseText.charCodeAt(0);
                    if (firstChar === 0xFEFF || firstChar === 0xEFBBBF) {
                        console.warn(`BOM character detected in ${filename}, removing it`);
                        // Remove BOM character
                        const cleanText = xhr.responseText.slice(1);
                        try {
                            foldersData = JSON.parse(cleanText);
                            console.log(`JSON data loaded successfully from ${filename} (after BOM removal)`);
                        } catch(e) {
                            console.error(`Error parsing JSON even after BOM removal from ${filename}:`, e);
                            callback(false);
                            return;
                        }
                    } else {
                        // Parse JSON
                        foldersData = JSON.parse(xhr.responseText);
                        console.log(`JSON data loaded successfully from ${filename}`);
                    }
                    
                    if (foldersData && foldersData.files && foldersData.files.length > 0) {
                        console.log(`Found ${foldersData.files.length} chapters in ${filename}`);
                        
                        // Debug: Log the first few chapter names
                        console.log("First 3 chapter names:");
                        for (let i = 0; i < Math.min(3, foldersData.files.length); i++) {
                            console.log(`- ${foldersData.files[i].name}`);
                        }
                        
                        // Generate UI with data
                        generateQuestionsChapters();
                        generateTutorialsChapters();
                        callback(true);
                    } else {
                        console.error(`JSON data loaded from ${filename} but no files found`);
                        callback(false);
                    }
                } catch (e) {
                    console.error(`Error parsing JSON from ${filename}:`, e);
                    // Show more details about the error
                    if (e instanceof SyntaxError) {
                        const errorPos = e.message.match(/position (\d+)/);
                        if (errorPos && errorPos[1]) {
                            const pos = parseInt(errorPos[1]);
                            const start = Math.max(0, pos - 20);
                            const end = Math.min(xhr.responseText.length, pos + 20);
                            console.error(`JSON syntax error near: "${xhr.responseText.substring(start, end)}"`);
                        }
                    }
                    callback(false);
                }
            } else {
                console.error(`Failed to load ${filename}, status:`, xhr.status);
                callback(false);
            }
        }
    };
    xhr.onerror = function() {
        console.error(`Request error while loading ${filename}`);
        callback(false);
    };
    xhr.send();
}

// Fallback function for when JSON loading fails
function fallbackToDefaultChapters() {
    console.warn("Using fallback chapter data");
    foldersData = null;
    generateQuestionsChapters();
    generateTutorialsChapters();
}

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

// Update navigation buttons state
function updateNavigationButtons() {
    const prevQuestionBtn = document.getElementById('prevQuestionBtn');
    const nextQuestionBtn = document.getElementById('nextQuestionBtn');
    
    if (chapterQuestions.length > 0) {
        prevQuestionBtn.disabled = currentQuestionIndex <= 0;
        nextQuestionBtn.disabled = currentQuestionIndex >= chapterQuestions.length - 1;
    } else {
        prevQuestionBtn.disabled = true;
        nextQuestionBtn.disabled = true;
    }
}

function updateTutorialNavigationButtons() {
    const prevTutorialBtn = document.getElementById('prevTutorialBtn');
    const nextTutorialBtn = document.getElementById('nextTutorialBtn');
    
    if (tutorialChapters.length > 0) {
        prevTutorialBtn.disabled = currentTutorialIndex <= 0;
        nextTutorialBtn.disabled = currentTutorialIndex >= tutorialChapters.length - 1;
    } else {
        prevTutorialBtn.disabled = true;
        nextTutorialBtn.disabled = true;
    }
}

// Generate chapters for Questions
function generateQuestionsChapters() {
    questionsChaptersList.innerHTML = '';
    
    if (foldersData && foldersData.files && foldersData.files.length > 0) {
        console.log("Generating chapters from JSON data");
        // Use data from JSON file
        
        // Sort chapters by number (extract number from chapter name)
        const sortedChapters = [...foldersData.files].sort((a, b) => {
            // Extract numbers from chapter names (e.g., "فصل 3" -> 3)
            const numA = parseInt(a.name.match(/\d+/)?.[0] || "0");
            const numB = parseInt(b.name.match(/\d+/)?.[0] || "0");
            return numA - numB; // Ascending order (low to high)
        });
        
        sortedChapters.forEach((chapter, index) => {
            const chapterElement = document.createElement('div');
            chapterElement.className = 'chapter-card';
            chapterElement.innerHTML = `
                <div class="chapter-icon">
                    <span class="material-icons">auto_stories</span>
                </div>
                <h3>${chapter.name}</h3>
                <div class="chapter-description">حل مسائل</div>
            `;
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
            chapter.innerHTML = `
                <div class="chapter-icon">
                    <span class="material-icons">auto_stories</span>
                </div>
                <h3>فصل ${i}</h3>
                <div class="chapter-description">حل مسائل</div>
            `;
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
    tutorialChapters = [];
    
    if (foldersData && foldersData.files && foldersData.files.length > 0) {
        console.log("Generating tutorial chapters from JSON data");
        // Use data from JSON file
        
        // Sort chapters by number (extract number from chapter name)
        const sortedChapters = [...foldersData.files].sort((a, b) => {
            // Extract numbers from chapter names (e.g., "فصل 3" -> 3)
            const numA = parseInt(a.name.match(/\d+/)?.[0] || "0");
            const numB = parseInt(b.name.match(/\d+/)?.[0] || "0");
            return numA - numB; // Ascending order (low to high)
        });
        
        tutorialChapters = sortedChapters;
        
        sortedChapters.forEach((chapter, index) => {
            const chapterElement = document.createElement('div');
            chapterElement.className = 'chapter-card';
            chapterElement.innerHTML = `
                <div class="chapter-icon">
                    <span class="material-icons">menu_book</span>
                </div>
                <h3>${chapter.name}</h3>
                <div class="chapter-description">آموزش‌ها</div>
            `;
            chapterElement.addEventListener('click', () => {
                showTutorialDetails(chapter, index);
            });
            tutorialsChaptersList.appendChild(chapterElement);
        });
    } else {
        console.log("Falling back to numbered tutorial chapters");
        // Fallback to numbered chapters
        const defaultChapters = [];
        
        for (let i = 1; i <= 20; i++) {
            defaultChapters.push({
                name: `فصل ${i}`,
                id: null
            });
        }
        
        tutorialChapters = defaultChapters;
        
        defaultChapters.forEach((chapter, index) => {
            const chapterElement = document.createElement('div');
            chapterElement.className = 'chapter-card';
            chapterElement.innerHTML = `
                <div class="chapter-icon">
                    <span class="material-icons">menu_book</span>
                </div>
                <h3>${chapter.name}</h3>
                <div class="chapter-description">آموزش‌ها</div>
            `;
            chapterElement.addEventListener('click', () => {
                showTutorialDetails(chapter, index);
            });
            tutorialsChaptersList.appendChild(chapterElement);
        });
    }
}

// Generate questions
function generateQuestions(chapter) {
    questionsList.innerHTML = '';
    chapterQuestions = [];
    
    if (chapter && chapter.subjects) {
        // Find questions subject
        const questionsSubject = chapter.subjects.find(subject => subject.name.includes("مسائل کتاب هالیدی"));
        
        if (questionsSubject && questionsSubject.questions && questionsSubject.questions.length > 0) {
            console.log(`Found ${questionsSubject.questions.length} questions for chapter`, chapter.name);
            // Sort questions by name (to ensure proper order)
            const sortedQuestions = [...questionsSubject.questions].sort((a, b) => {
                // Extract numbers from question names (e.g., "سوال 45" -> 45)
                const numA = parseInt(a.name.match(/\d+/)?.[0] || "0");
                const numB = parseInt(b.name.match(/\d+/)?.[0] || "0");
                return numA - numB; // Ascending order (low to high)
            });
            
            chapterQuestions = sortedQuestions;
            
            sortedQuestions.forEach((q, index) => {
                const question = document.createElement('div');
                question.className = 'question-card';
                question.innerHTML = `
                    <div class="question-icon">
                        <span class="material-icons">help_outline</span>
                    </div>
                    <h3>${q.name}</h3>
                `;
                question.addEventListener('click', () => {
                    showQuestionDetails(q, index, chapter);
                });
                questionsList.appendChild(question);
            });
        } else {
            console.log("No questions found for chapter, falling back to default questions");
            const noQuestions = document.createElement('div');
            noQuestions.className = 'no-questions';
            noQuestions.textContent = `هیچ سوالی برای ${chapter.name} یافت نشد.`;
            questionsList.appendChild(noQuestions);
        }
    } else {
        console.log("No chapter data, falling back to default questions");
        // Fallback to default 100 questions
        const defaultQuestions = [];
        for (let i = 1; i <= 100; i++) {
            defaultQuestions.push({
                name: `سوال ${i}`,
                id: null
            });
        }
        
        chapterQuestions = defaultQuestions;
        
        defaultQuestions.forEach((q, index) => {
            const question = document.createElement('div');
            question.className = 'question-card';
            question.innerHTML = `
                <div class="question-icon">
                    <span class="material-icons">help_outline</span>
                </div>
                <h3>${q.name}</h3>
            `;
            question.addEventListener('click', () => {
                showQuestionDetails(q, index);
            });
            questionsList.appendChild(question);
        });
    }
}

// Show question details
function showQuestionDetails(question, index, chapter) {
    currentQuestionIndex = index;
    currentQuestion = question.name;
    
    if (chapter) {
        questionDetailTitle.innerHTML = `<span class="material-icons">help_outline</span>${chapter.name} - ${currentQuestion}`;
        
        if (question.id) {
            const driveLink = `https://drive.google.com/file/d/${question.id}/view`;
            questionText.innerHTML = `<a href="${driveLink}" target="_blank" class="drive-link">برای مشاهده ${currentQuestion} از ${chapter.name} اینجا کلیک کنید</a>`;
        } else {
            questionText.textContent = `لینک سوال برای ${chapter.name} - ${currentQuestion} در دسترس نیست.`;
        }
    } else {
        questionDetailTitle.innerHTML = `<span class="material-icons">help_outline</span>${currentChapter} - ${currentQuestion}`;
        questionText.textContent = `لینک سوال برای ${currentChapter} - ${currentQuestion} در دسترس نیست.`;
    }
    
    updateNavigationButtons();
    showScreen('questionDetailScreen');
}

// Show tutorial details
function showTutorialDetails(chapter, index) {
    currentTutorialIndex = index;
    currentTutorialChapter = chapter;
    
    tutorialDetailTitle.innerHTML = `<span class="material-icons">menu_book</span>${chapter.name}`;
    
    if (chapter.subjects) {
        // Find tutorial subject
        const tutorialSubject = chapter.subjects.find(subject => subject.name.includes("درسنامه"));
        if (tutorialSubject && tutorialSubject.id) {
            const driveLink = `https://drive.google.com/file/d/${tutorialSubject.id}/view`;
            tutorialText.innerHTML = `<a href="${driveLink}" target="_blank" class="drive-link">برای مشاهده درسنامه ${chapter.name} اینجا کلیک کنید</a>`;
        } else {
            tutorialText.textContent = `درسنامه برای ${chapter.name} در دسترس نیست.`;
        }
    } else {
        tutorialText.textContent = `درسنامه برای ${chapter.name} در دسترس نیست.`;
    }
    
    updateTutorialNavigationButtons();
    showScreen('tutorialDetailScreen');
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

// Navigation buttons event listeners
document.getElementById('prevQuestionBtn').addEventListener('click', () => {
    if (currentQuestionIndex > 0 && chapterQuestions.length > 0) {
        showQuestionDetails(chapterQuestions[currentQuestionIndex - 1], currentQuestionIndex - 1, currentChapter);
    }
});

document.getElementById('nextQuestionBtn').addEventListener('click', () => {
    if (currentQuestionIndex < chapterQuestions.length - 1) {
        showQuestionDetails(chapterQuestions[currentQuestionIndex + 1], currentQuestionIndex + 1, currentChapter);
    }
});

document.getElementById('prevTutorialBtn').addEventListener('click', () => {
    if (currentTutorialIndex > 0 && tutorialChapters.length > 0) {
        showTutorialDetails(tutorialChapters[currentTutorialIndex - 1], currentTutorialIndex - 1);
    }
});

document.getElementById('nextTutorialBtn').addEventListener('click', () => {
    if (currentTutorialIndex < tutorialChapters.length - 1) {
        showTutorialDetails(tutorialChapters[currentTutorialIndex + 1], currentTutorialIndex + 1);
    }
});

// Call the JSON loading function when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadJSONData();
    
    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('.material-icons');
    
    // Check for saved theme preference or use default dark theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    
    // Toggle theme when the button is clicked
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });
    
    // Function to set the theme
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update icon based on theme
        if (theme === 'dark') {
            themeIcon.textContent = 'light_mode'; // Show light mode icon when in dark mode
        } else {
            themeIcon.textContent = 'dark_mode'; // Show dark mode icon when in light mode
        }
    }
});

// Back to top button functionality
const backToTopButton = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopButton.classList.add('visible');
    } else {
        backToTopButton.classList.remove('visible');
    }
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});