// DOM Elements
const questionsBtn = document.getElementById('questionsBtn');
const tutorialsBtn = document.getElementById('tutorialsBtn');
const aboutUsBtn = document.getElementById('aboutUsBtn');
const booksBtn = document.getElementById('booksBtn');
const backToMainFromQuestionsChapters = document.getElementById('backToMainFromQuestionsChapters');
const backToMainFromTutorialsChapters = document.getElementById('backToMainFromTutorialsChapters');
const backToMainFromAboutUs = document.getElementById('backToMainFromAboutUs');
const backToMainFromBooks = document.getElementById('backToMainFromBooks');
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

// نگهداری تاریخچه نمایش صفحات برای پشتیبانی از دکمه بازگشت مرورگر
let screenHistory = ['mainScreen'];

// Load JSON data using XMLHttpRequest instead of fetch
function loadJSONData() {
    console.log("Attempting to load JSON data...");
    
    // First try loading from files
    tryLoadingJSON('foolders.json', function(success) {
        if (!success) {
            tryLoadingJSON('foolders_fixed.json', function(success) {
                if (!success) {
                    tryLoadingJSON('foolders_utf8.json', function(success) {
                        if (!success) {
                            console.log("Failed to load JSON files, trying inline data as last resort");
                            // Try using inline data as last resort
    if (typeof window.inlineJsonData !== 'undefined' && window.inlineJsonData) {
        console.log("Found inline JSON data, using it");
        try {
            foldersData = window.inlineJsonData;
                                    console.log(`Found ${foldersData.files ? foldersData.files.length : (Array.isArray(foldersData) ? foldersData.length : 0)} chapters in inline JSON`);
            generateQuestionsChapters();
            generateTutorialsChapters();
            return;
        } catch (e) {
            console.error("Error using inline JSON:", e);
                                    fallbackToDefaultChapters();
                                }
                            } else {
                            console.error("Failed to load any JSON file");
                            fallbackToDefaultChapters();
                            }
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
    
    // Use a cache-busting technique to avoid cached responses
    const cacheBuster = new Date().getTime();
    xhr.open('GET', `${filename}?nocache=${cacheBuster}`, true);
    
    // Add more debug info
    console.log(`XHR opened for ${filename}`);
    
    xhr.onreadystatechange = function() {
        console.log(`XHR readyState changed to ${xhr.readyState} for ${filename}`);
        
        if (xhr.readyState === 4) {
            console.log(`XHR complete for ${filename}, status: ${xhr.status}`);
            
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
                    
                    // تشخیص ساختار فایل JSON - آرایه یا شیء با کلید files
                    let chapters = [];
                    if (Array.isArray(foldersData)) {
                        console.log(`Found JSON data as Array with ${foldersData.length} items`);
                        chapters = foldersData;
                    } else if (foldersData && foldersData.files && Array.isArray(foldersData.files)) {
                        console.log(`Found JSON data as Object with ${foldersData.files.length} chapters in 'files' property`);
                        chapters = foldersData.files;
                    } else {
                        console.error(`JSON data does not have the expected structure`);
                        callback(false);
                        return;
                    }
                    
                    // تنظیم داده ها به فرمت استاندارد
                    if (Array.isArray(foldersData) && !foldersData.files) {
                        // اگر داده آرایه است، آن را به فرمت مورد نظر تبدیل می‌کنیم
                        // ایجاد یک شیء با کلید files که آرایه فعلی را در بر می‌گیرد
                        const tempFoldersData = { files: foldersData };
                        foldersData = tempFoldersData;
                        console.log(`Converted array to object with 'files' property`);
                    }
                    
                    if (foldersData && foldersData.files && foldersData.files.length > 0) {
                        console.log(`Found ${foldersData.files.length} chapters in ${filename}`);
                        
                        // Debug: Log the first few chapter names
                        console.log("First 3 chapter names:");
                        for (let i = 0; i < Math.min(3, foldersData.files.length); i++) {
                            console.log(`- ${foldersData.files[i].name}`);
                            
                            // Count questions in this chapter
                            const subjects = foldersData.files[i].subjects || [];
                            let questionsCount = 0;
                            
                            for (const subject of subjects) {
                                if (subject.questions && Array.isArray(subject.questions)) {
                                    questionsCount += subject.questions.length;
                                    console.log(`  - Subject: ${subject.name}, Questions: ${subject.questions.length}`);
                                }
                            }
                            
                            console.log(`  - Total questions in chapter: ${questionsCount}`);
                        }
                        
                        console.log(`Total chapters loaded: ${foldersData.files.length}`);
                        
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
                
                // Additional debugging for status 0
                if (xhr.status === 0) {
                    console.error(`Status 0 received for ${filename}. This could indicate a CORS issue, network error, or the file doesn't exist.`);
                    console.error(`Make sure you're running this from a web server and not opening the HTML file directly.`);
                }
                
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
    booksScreen: document.getElementById('booksScreen'),
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

// Navigation function - اصلاح شده برای پشتیبانی از دکمه بازگشت مرورگر
function showScreen(screenId, addToHistory = true) {
    console.log(`Showing screen: ${screenId}, addToHistory: ${addToHistory}`);
    
    // مخفی کردن همه صفحات
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    
    // نمایش صفحه مورد نظر
    if (screens[screenId]) {
        screens[screenId].classList.add('active');
    } else {
        console.error(`Screen ${screenId} not found!`);
        // نمایش صفحه اصلی در صورت خطا
        screens.mainScreen.classList.add('active');
        screenId = 'mainScreen';
    }
    
    // اضافه کردن به تاریخچه و تاریخچه مرورگر
    if (addToHistory) {
        // اگر این صفحه قبلاً در تاریخچه بوده و آخرین صفحه نیست، حذف تکرارها
        const historyIndex = screenHistory.indexOf(screenId);
        if (historyIndex !== -1 && historyIndex !== screenHistory.length - 1) {
            // حذف این صفحه از محل قبلی تا بتوانیم آن را در انتها اضافه کنیم
            screenHistory.splice(historyIndex, 1);
        }
        
        // اضافه کردن به تاریخچه داخلی
        screenHistory.push(screenId);
        
        // اضافه کردن به تاریخچه مرورگر
        const state = { screen: screenId, history: screenHistory };
        history.pushState(state, '', `#${screenId}`);
        
        console.log(`History state: ${JSON.stringify(state)}`);
        console.log(`Current history stack: ${JSON.stringify(screenHistory)}`);
    }
    
    // اسکرول به بالای صفحه
    window.scrollTo(0, 0);
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
            chapterElement.setAttribute('data-chapter-index', index);
            
            // حذف شماره فصل از ابتدای عنوان
            let chapterTitle = chapter.name;
            if (chapterTitle.match(/^\d+\s*\.*\s*/) || chapterTitle.match(/^فصل\s*\d+\s*\.*\s*/)) {
                chapterTitle = chapterTitle.replace(/^\d+\s*\.*\s*/, '').replace(/^فصل\s*\d+\s*\.*\s*/, '');
            }
            
            chapterElement.innerHTML = `
                <div class="chapter-icon">
                    <span class="material-icons">auto_stories</span>
                </div>
                <h3>${chapterTitle}</h3>
                <div class="chapter-description">حل مسائل</div>
            `;
            chapterElement.addEventListener('click', () => {
                currentChapter = chapter;
                // حذف شماره فصل از عنوان در نمایش جزئیات هم
                let displayTitle = chapter.name;
                if (displayTitle.match(/^\d+\s*\.*\s*/) || displayTitle.match(/^فصل\s*\d+\s*\.*\s*/)) {
                    displayTitle = displayTitle.replace(/^\d+\s*\.*\s*/, '').replace(/^فصل\s*\d+\s*\.*\s*/, '');
                }
                questionsListTitle.innerHTML = `<span class="material-icons">help_outline</span>${displayTitle}`;
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
            chapter.setAttribute('data-chapter-index', i - 1);
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
            chapterElement.setAttribute('data-chapter-index', index);
            
            // حذف شماره فصل از ابتدای عنوان
            let chapterTitle = chapter.name;
            if (chapterTitle.match(/^\d+\s*\.*\s*/) || chapterTitle.match(/^فصل\s*\d+\s*\.*\s*/)) {
                chapterTitle = chapterTitle.replace(/^\d+\s*\.*\s*/, '').replace(/^فصل\s*\d+\s*\.*\s*/, '');
            }
            
            chapterElement.innerHTML = `
                <div class="chapter-icon">
                    <span class="material-icons">menu_book</span>
                </div>
                <h3>${chapterTitle}</h3>
                <div class="chapter-description">آموزش‌ها</div>
            `;
            chapterElement.addEventListener('click', () => {
                // حذف شماره فصل از عنوان در نمایش جزئیات هم
                let displayTitle = chapter.name;
                if (displayTitle.match(/^\d+\s*\.*\s*/) || displayTitle.match(/^فصل\s*\d+\s*\.*\s*/)) {
                    displayTitle = displayTitle.replace(/^\d+\s*\.*\s*/, '').replace(/^فصل\s*\d+\s*\.*\s*/, '');
                }
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
            chapterElement.setAttribute('data-chapter-index', index);
            
            // حذف شماره فصل از ابتدای عنوان
            let chapterTitle = chapter.name;
            
            chapterElement.innerHTML = `
                <div class="chapter-icon">
                    <span class="material-icons">menu_book</span>
                </div>
                <h3>${chapterTitle}</h3>
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
    
    console.log(`Generating questions for chapter: ${chapter?.name || 'unknown'}`);
    
    if (chapter && chapter.subjects) {
        console.log(`Chapter has ${chapter.subjects.length} subjects`);
        
        // Debug: log all subjects to see what we're working with
        chapter.subjects.forEach((subject, i) => {
            console.log(`Subject ${i}: ${subject.name}, has questions: ${!!(subject.questions && subject.questions.length)}`);
            if (subject.questions && subject.questions.length) {
                console.log(`  - Has ${subject.questions.length} questions`);
            }
        });
        
        // Find questions subject - try different patterns
        let questionsSubject = chapter.subjects.find(subject => 
            subject.name.includes("مسائل کتاب هالیدی") || 
            subject.name.includes("مسائل") ||
            subject.name.includes("problems") ||
            subject.name.includes("exercises")
        );
        
        if (!questionsSubject) {
            // If we still didn't find it, look for any subject with questions array
            questionsSubject = chapter.subjects.find(subject => 
                subject.questions && Array.isArray(subject.questions) && subject.questions.length > 0
            );
        }
        
        if (questionsSubject && questionsSubject.questions && questionsSubject.questions.length > 0) {
            console.log(`Found ${questionsSubject.questions.length} questions for chapter`, chapter.name);
            console.log(`Questions subject: ${questionsSubject.name}, ID: ${questionsSubject.id}`);
            
            // Sort questions by name (to ensure proper order)
            const sortedQuestions = [...questionsSubject.questions].sort((a, b) => {
                // Extract numbers from question names (e.g., "سوال 45" -> 45)
                const numA = parseInt(a.name.match(/\d+/)?.[0] || "0");
                const numB = parseInt(b.name.match(/\d+/)?.[0] || "0");
                return numA - numB; // Ascending order (low to high)
            });
            
            // Debug: Check sorted questions
            console.log(`Sorted ${sortedQuestions.length} questions. First few:`);
            sortedQuestions.slice(0, 3).forEach((q, i) => {
                console.log(`Question ${i}: ${q.name}, ID: ${q.id}`);
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
                    console.log(`Question clicked: ${q.name}, ID: ${q.id}`);
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
            
            // Debug: Show what subjects we found instead
            console.log(`Chapter subjects available instead:`);
            chapter.subjects.forEach((subject, i) => {
                console.log(`Subject ${i}: ${subject.name}`);
                console.log(`  Has ID: ${!!subject.id}`);
                console.log(`  Has questions array: ${!!subject.questions}`);
                if (subject.questions) {
                    console.log(`  Questions array length: ${subject.questions.length}`);
                }
            });
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
    
    console.log(`Showing details for question: ${question.name}, ID: ${question.id}, Index: ${index}`);
    
    if (chapter) {
        questionDetailTitle.innerHTML = `<span class="material-icons">help_outline</span>${chapter.name} - ${currentQuestion}`;
        
        if (question.id) {
            // استفاده از لینک پوشه گوگل درایو
            const driveLink = `https://drive.google.com/drive/folders/${question.id}`;
            console.log(`Created drive link for question: ${driveLink}`);
            questionText.innerHTML = `<a href="${driveLink}" target="_blank" class="drive-link">برای مشاهده ${currentQuestion} از ${chapter.name} اینجا کلیک کنید</a>`;
        } else {
            console.error(`Question ${question.name} has no ID!`);
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
    
    console.log(`Showing tutorial details for: ${chapter.name}, Index: ${index}`);
    console.log("Chapter data:", chapter);
    
    tutorialDetailTitle.innerHTML = `<span class="material-icons">menu_book</span>${chapter.name}`;
    
    // تست داده‌های فصل فعلی
    console.log(`Testing chapter data structure:`, chapter);
    if (chapter.id) {
        console.log(`Chapter ID: ${chapter.id}`);
    } else {
        console.error(`Chapter missing ID!`);
    }
    
    if (chapter.subjects) {
        console.log(`Found ${chapter.subjects.length} subjects for chapter ${chapter.name}`);
        
        // Log all subjects to see what's available
        chapter.subjects.forEach((subject, i) => {
            console.log(`Subject ${i}: ${subject.name}, ID: ${subject.id}`);
        });
        
        // Try multiple ways to find the tutorial subject
        let tutorialSubject = chapter.subjects.find(subject => 
            subject.name.includes("درسنامه") || 
            subject.name.includes("آموزش") ||
            subject.name.includes("tutorial") ||
            subject.name.includes("lesson") ||
            (subject.name.includes("فصل") && !subject.name.includes("مسائل"))
        );
        
        // If still not found, try to find any subject with an ID that's not a question
        if (!tutorialSubject) {
            tutorialSubject = chapter.subjects.find(subject => 
                subject.id && !subject.name.includes("مسائل") && !subject.name.includes("سوال")
            );
        }
        
        // If we found a tutorial subject with an ID
        if (tutorialSubject && tutorialSubject.id) {
            console.log(`Found tutorial subject: ${tutorialSubject.name}, ID: ${tutorialSubject.id}`);
            
            // استفاده از لینک پوشه گوگل درایو
            const driveLink = `https://drive.google.com/drive/folders/${tutorialSubject.id}`;
            console.log(`Created drive link: ${driveLink}`);
            tutorialText.innerHTML = `<a href="${driveLink}" target="_blank" class="drive-link">برای مشاهده ${tutorialSubject.name} از ${chapter.name} اینجا کلیک کنید</a>`;
        }
        // If we found a subject but it has no ID
        else if (tutorialSubject) {
            console.log(`Found tutorial subject but no ID: ${tutorialSubject.name}`);
            tutorialText.textContent = `درسنامه برای ${chapter.name} در دسترس نیست (شناسه فایل موجود نیست).`;
        }
        // If no suitable subject was found
        else {
            console.log(`No suitable tutorial subject found for ${chapter.name}`);
            
            // Special case for chapter 1 - try to use a hardcoded ID if available
            if (chapter.name.includes("1") || chapter.name.includes("۱") || chapter.name.includes("اول")) {
                const hardcodedChapter1ID = "1CG6yriHCwBpf0pgNs4jyHO2NUb88W3zU"; // Using the ID from the example
                if (hardcodedChapter1ID) {
                    console.log("Using hardcoded ID for Chapter 1");
                    const driveLink = `https://drive.google.com/drive/folders/${hardcodedChapter1ID}`;
                    tutorialText.innerHTML = `<a href="${driveLink}" target="_blank" class="drive-link">برای مشاهده درسنامه ${chapter.name} اینجا کلیک کنید</a>`;
                } else {
                    tutorialText.textContent = `درسنامه برای ${chapter.name} در دسترس نیست.`;
                }
            } else {
                tutorialText.textContent = `درسنامه برای ${chapter.name} در دسترس نیست.`;
            }
        }
    } else {
        console.log(`No subjects found for chapter ${chapter.name}`);
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

booksBtn.addEventListener('click', () => {
    console.log('Books button clicked - inside script.js');
    console.log('booksScreen element:', document.getElementById('booksScreen'));
    if (screens.booksScreen) {
        console.log('booksScreen exists in screens object');
        screens.booksScreen.classList.add('active');
        Object.values(screens).forEach(screen => {
            if (screen !== screens.booksScreen) {
                screen.classList.remove('active');
            }
        });
    } else {
        console.log('booksScreen does NOT exist in screens object');
    }
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

backToMainFromBooks.addEventListener('click', () => {
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
    // اضافه کردن وضعیت اولیه به تاریخچه مرورگر
    const initialScreen = 'mainScreen';
    screenHistory = [initialScreen];
    history.replaceState({ screen: initialScreen, history: screenHistory }, '', `#${initialScreen}`);
    
    // سایر کدهای DOMContentLoaded
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
        // Add a fade-out effect to the body
        document.body.style.opacity = "0.8";
        
        // Set the theme after a small delay to allow for transition
        setTimeout(() => {
            document.documentElement.setAttribute('data-theme', theme);
            document.body.setAttribute('data-theme', theme);
            
            // Update all elements with class that might need theme changes
            const themeElements = document.querySelectorAll('.app-header, .main-menu, .main-actions, .chapter-card, .question-card, .screen-title, .footer');
            themeElements.forEach(element => {
                element.setAttribute('data-theme', theme);
            });
            
            // Update icon based on current theme
            const themeIcon = document.querySelector('.theme-toggle .material-icons');
            if (theme === 'dark') {
                themeIcon.textContent = 'light_mode'; // Sun icon for dark mode
            } else {
                themeIcon.textContent = 'dark_mode'; // Moon icon for light mode
            }

            // Fade back in
            document.body.style.opacity = "1";
        }, 50);
    }
    
    // Add a timeout to check for Chapter 1 data after everything is loaded
    setTimeout(checkChapter1Data, 2000);
    
    // Handle browser back button with popstate event - بهبود یافته
    window.addEventListener('popstate', function(event) {
        console.log("Browser back button pressed", event.state);
        
        // اگر صفحه فعلی را تشخیص بدهیم
        const activeScreen = document.querySelector('.screen.active');
        if (!activeScreen) {
            // اگر صفحه‌ای فعال نیست، به صفحه اصلی برگرد
            screens.mainScreen.classList.add('active');
            screenHistory = ['mainScreen'];
            return;
        }
        
        const currentScreenId = activeScreen.id;
        console.log("Current active screen:", currentScreenId);
        
        // تشخیص دکمه بازگشت مناسب برای صفحه فعلی
        let backButtonId = null;
        
        switch (currentScreenId) {
            case 'questionsChaptersScreen':
                backButtonId = 'backToMainFromQuestionsChapters';
                break;
            case 'tutorialsChaptersScreen':
                backButtonId = 'backToMainFromTutorialsChapters';
                break;
            case 'aboutUsScreen':
                backButtonId = 'backToMainFromAboutUs';
                break;
            case 'booksScreen':
                backButtonId = 'backToMainFromBooks';
                break;
            case 'questionsListScreen':
                backButtonId = 'backToQuestionsChapters';
                break;
            case 'questionDetailScreen':
                backButtonId = 'backToQuestionsList';
                break;
            case 'tutorialDetailScreen':
                backButtonId = 'backToTutorialsChapters';
                break;
            case 'mainScreen':
                // در صفحه اصلی هستیم، اما event.state خالی نیست
                // می‌خواهیم اپلیکیشن را ترک نکنیم
                window.history.pushState({ noExit: true }, document.title);
                return;
        }
        
        // کلیک روی دکمه بازگشت مناسب
        if (backButtonId) {
            console.log("Clicking back button:", backButtonId);
            const backButton = document.getElementById(backButtonId);
            if (backButton) {
                backButton.click();
                // جلوگیری از اجرای کدهای بعدی
                return;
            }
        }
        
        // اگر دکمه بازگشت مناسب پیدا نشد یا عمل نکرد:
        
        // اگر تاریخچه داخلی وجود دارد از آن استفاده کنیم
        if (screenHistory.length > 1) {
            screenHistory.pop(); // حذف صفحه فعلی
            const previousScreen = screenHistory[screenHistory.length - 1];
            console.log("Using screenHistory to go back to:", previousScreen);
            
            // نمایش صفحه قبلی
            Object.values(screens).forEach(screen => {
                screen.classList.remove('active');
            });
            screens[previousScreen].classList.add('active');
            return;
        }
        
        // در نهایت به صفحه اصلی برگردیم
        Object.values(screens).forEach(screen => {
            screen.classList.remove('active');
        });
        screens.mainScreen.classList.add('active');
        screenHistory = ['mainScreen'];
    });
    
    // افزودن رویداد برای دکمه بازگشت بالایی
    const topBackButton = document.getElementById('topBackButton');
    if (topBackButton) {
        topBackButton.addEventListener('click', () => {
            showScreen('questionsChaptersScreen');
        });
    }
    
    // پیکربندی تاریخچه اولیه
    checkInitialHash();
    
    // اطمینان از اینکه تمام صفحات تعریف شده‌اند
    const screensValid = Object.values(screens).every(screen => screen !== null);
    if (!screensValid) {
        console.error("Some screens are not defined properly!", screens);
    } else {
        console.log("All screens initialized properly:", Object.keys(screens));
    }
});

// بررسی و تنظیم اولیه صفحه از هش URL
function checkInitialHash() {
    // بررسی صفحه اولیه از URL
    const hash = window.location.hash;
    let initialScreen = 'mainScreen';
    
    if (hash && hash.length > 1) {
        const targetScreen = hash.substring(1); // حذف کاراکتر #
        if (screens[targetScreen]) {
            initialScreen = targetScreen;
        }
    }
    
    console.log("Initial screen set to:", initialScreen);
    
    // تنظیم تاریخچه اولیه
    screenHistory = [initialScreen];
    history.replaceState({ screen: initialScreen, history: screenHistory }, '', `#${initialScreen}`);
    
    // نمایش صفحه اولیه
    showScreen(initialScreen, false);
}

// Function to specifically check Chapter 1 data
function checkChapter1Data() {
    console.log("Checking Chapter 1 data...");
    
    if (!foldersData || !foldersData.files || !foldersData.files.length) {
        console.log("No folders data available yet");
        return;
    }
    
    // Find Chapter 1
    const chapter1 = foldersData.files.find(file => 
        file.name.includes("1") || 
        file.name.includes("۱") || 
        file.name.includes("اول") || 
        file.name.toLowerCase().includes("first")
    );
    
    if (!chapter1) {
        console.log("Chapter 1 not found in data");
        return;
    }
    
    console.log("Chapter 1 data:", chapter1);
    
    if (chapter1.subjects) {
        console.log(`Chapter 1 has ${chapter1.subjects.length} subjects:`);
        chapter1.subjects.forEach((subject, i) => {
            console.log(`- Subject ${i}: ${subject.name}, ID: ${subject.id || "No ID"}`);
            
            // Log driveLink that would be used
            const driveLink = `https://drive.google.com/drive/folders/${subject.id}`;
            console.log(`  - Drive link would be: ${driveLink}`);
            
            // If this subject has questions, log them too
            if (subject.questions && subject.questions.length) {
                console.log(`  Has ${subject.questions.length} questions`);
                subject.questions.slice(0, 3).forEach((q, j) => {
                    console.log(`  - Question ${j}: ${q.name}, ID: ${q.id || "No ID"}`);
                    
                    // Log driveLink that would be used for questions
                    const questionDriveLink = `https://drive.google.com/drive/folders/${q.id}`;
                    console.log(`    - Question drive link would be: ${questionDriveLink}`);
                });
                if (subject.questions.length > 3) {
                    console.log(`  - ... and ${subject.questions.length - 3} more questions`);
                }
            }
        });
        
        // Try to find the tutorial subject using our criteria
        const tutorialSubject = chapter1.subjects.find(subject => 
            subject.name.includes("درسنامه") || 
            subject.name.includes("آموزش") ||
            subject.name.includes("tutorial") ||
            subject.name.includes("lesson") ||
            (subject.name.includes("فصل") && !subject.name.includes("مسائل"))
        );
        
        if (tutorialSubject) {
            console.log("Found potential tutorial subject:", tutorialSubject);
            console.log("Tutorial link would be:", `https://drive.google.com/drive/folders/${tutorialSubject.id}`);
        } else {
            console.log("No tutorial subject found using our criteria");
            
            // Look for any subject that might be a tutorial
            const nonQuestionSubject = chapter1.subjects.find(subject => 
                !subject.name.includes("مسائل") && !subject.name.includes("سوال")
            );
            
            if (nonQuestionSubject) {
                console.log("Found a non-question subject that could be a tutorial:", nonQuestionSubject);
            }
        }
    } else {
        console.log("Chapter 1 has no subjects");
    }
    
    // Debug check if all chapters have valid data structure
    console.log("Checking all chapters for valid data structure...");
    let valid = true;
    let chaptersWithSubjects = 0;
    let chaptersWithQuestions = 0;
    let totalQuestions = 0;
    
    foldersData.files.forEach((chapter, i) => {
        if (!chapter.id || !chapter.name) {
            console.error(`Chapter ${i} missing ID or name!`);
            valid = false;
        }
        
        if (chapter.subjects && Array.isArray(chapter.subjects)) {
            chaptersWithSubjects++;
            
            chapter.subjects.forEach((subject, j) => {
                if (!subject.id || !subject.name) {
                    console.error(`Subject ${j} in Chapter ${chapter.name} missing ID or name!`);
                    valid = false;
                }
                
                if (subject.questions && Array.isArray(subject.questions)) {
                    chaptersWithQuestions++;
                    totalQuestions += subject.questions.length;
                    
                    subject.questions.forEach((question, k) => {
                        if (!question.id || !question.name) {
                            console.error(`Question ${k} in Subject ${subject.name} in Chapter ${chapter.name} missing ID or name!`);
                            valid = false;
                        }
                    });
                }
            });
        } else {
            console.warn(`Chapter ${chapter.name} has no subjects array!`);
        }
    });
    
    console.log(`Data validation complete. Valid structure: ${valid}`);
    console.log(`Chapters with subjects: ${chaptersWithSubjects}/${foldersData.files.length}`);
    console.log(`Chapters with questions: ${chaptersWithQuestions}/${foldersData.files.length}`);
    console.log(`Total questions found: ${totalQuestions}`);
}

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

// اضافه کردن کد مربوط به مودال ارتباط با ما
const contactUsBtn = document.getElementById('contactUsBtn');
const contactModal = document.getElementById('contactModal');
const closeModal = document.querySelector('.close-modal');

// باز کردن مودال با کلیک روی دکمه ارتباط با ما
contactUsBtn.addEventListener('click', () => {
    contactModal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // جلوگیری از اسکرول صفحه پشت مودال
});

// بستن مودال با کلیک روی دکمه ضربدر
closeModal.addEventListener('click', () => {
    contactModal.style.display = 'none';
    document.body.style.overflow = 'auto'; // برگرداندن اسکرول صفحه به حالت عادی
});

// بستن مودال با کلیک خارج از محتوای مودال
window.addEventListener('click', (event) => {
    if (event.target === contactModal) {
        contactModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});