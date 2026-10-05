/**
 * QuizPro Master Question Bank & Subject Catalog
 * Contains rich questions categorized by Departments, Subjects, Question Types,
 * and Difficulty levels (Easy, Medium, Hard).
 * Supports Question Types: 'mcq', 'true_false', 'fill_blank', 'code', 'image'
 */

const SubjectCatalog = [
    {
        id: 'Python',
        name: 'Python',
        icon: '🐍',
        category: 'Programming',
        departments: ['BCA', 'BSc', 'BCom CA', 'General'],
        description: 'Core syntax, OOP, lambdas, data structures, and standard libraries.',
        questionsCount: 15,
        difficulty: 'Medium',
        difficultyLevel: 'medium'
    },
    {
        id: 'Java',
        name: 'Java',
        icon: '☕',
        category: 'Programming',
        departments: ['BCA', 'BSc', 'General'],
        description: 'JVM architecture, OOP concepts, collections, threads, and memory models.',
        questionsCount: 12,
        difficulty: 'Hard',
        difficultyLevel: 'hard'
    },
    {
        id: 'DataStructures',
        name: 'Data Structures',
        icon: '🌳',
        category: 'Programming',
        departments: ['BCA', 'BSc', 'General'],
        description: 'Stacks, queues, trees, graphs, sorting, and Big-O algorithm analysis.',
        questionsCount: 14,
        difficulty: 'Hard',
        difficultyLevel: 'hard'
    },
    {
        id: 'DBMS',
        name: 'DBMS',
        icon: '🗄️',
        category: 'Database',
        departments: ['BCA', 'BSc', 'BCom CA', 'General'],
        description: 'SQL queries, normalization, ACID properties, transactions, and indexing.',
        questionsCount: 12,
        difficulty: 'Medium',
        difficultyLevel: 'medium'
    },
    {
        id: 'HTML',
        name: 'HTML',
        icon: '🌐',
        category: 'Web Development',
        departments: ['BCA', 'BSc', 'BCom CA', 'General'],
        description: 'HTML5 semantic elements, forms, accessibility, and DOM structure.',
        questionsCount: 10,
        difficulty: 'Easy',
        difficultyLevel: 'easy'
    },
    {
        id: 'CSS',
        name: 'CSS',
        icon: '🎨',
        category: 'Web Development',
        departments: ['BCA', 'BSc', 'BCom CA', 'General'],
        description: 'Flexbox, CSS Grid, animations, box model, and responsive media queries.',
        questionsCount: 10,
        difficulty: 'Easy',
        difficultyLevel: 'easy'
    },
    {
        id: 'JavaScript',
        name: 'JavaScript',
        icon: '⚡',
        category: 'Web Development',
        departments: ['BCA', 'BSc', 'General'],
        description: 'ES6+ syntax, asynchronous promises, closures, event loop, and DOM APIs.',
        questionsCount: 15,
        difficulty: 'Medium',
        difficultyLevel: 'medium'
    },
    {
        id: 'GeneralKnowledge',
        name: 'General Knowledge',
        icon: '🧠',
        category: 'General',
        departments: ['BCA', 'BSc', 'BCom CA', 'BBA', 'BCom', 'General'],
        description: 'Current affairs, computing history, scientific innovations, and logic.',
        questionsCount: 12,
        difficulty: 'Easy',
        difficultyLevel: 'easy'
    },
    {
        id: 'BCA',
        name: 'BCA Core Comprehensive',
        icon: '💻',
        category: 'BCA',
        departments: ['BCA', 'General'],
        description: 'Comprehensive assessment covering software engineering, OS, C++, and web systems.',
        questionsCount: 20,
        difficulty: 'Hard',
        difficultyLevel: 'hard'
    },
    {
        id: 'BSc',
        name: 'BSc Computer Science',
        icon: '🔬',
        category: 'BSc',
        departments: ['BSc', 'General'],
        description: 'Discrete mathematics, theory of computation, microprocessor 8086, and networks.',
        questionsCount: 16,
        difficulty: 'Hard',
        difficultyLevel: 'hard'
    },
    {
        id: 'BComCA',
        name: 'BCom CA (Computer Applications)',
        icon: '📊',
        category: 'BCom CA',
        departments: ['BCom CA', 'General'],
        description: 'Financial accounting systems, E-Commerce, tally concepts, and business databases.',
        questionsCount: 14,
        difficulty: 'Medium',
        difficultyLevel: 'medium'
    },
    {
        id: 'BBA',
        name: 'BBA Management & Strategy',
        icon: '📈',
        category: 'BBA',
        departments: ['BBA', 'General'],
        description: 'Organizational behavior, marketing management, human resources, and business finance.',
        questionsCount: 12,
        difficulty: 'Medium',
        difficultyLevel: 'medium'
    }
];

const defaultQuizQuestions = {
    // ==========================================
    // BCA & COMPUTING SUBJECTS
    // ==========================================

    Python: [
        { id: 'p1', type: 'mcq', difficulty: 'easy', q: 'What is the correct file extension for Python files?', options: ['.pt', '.py', '.pyt', '.python'], answer: 1, explanation: 'Python files have the extension .py' },
        { id: 'p2', type: 'mcq', difficulty: 'easy', q: 'How do you create a variable with numeric value 5 in Python?', options: ['x = 5', 'int x = 5;', 'x = int(5)', 'Both x = 5 and x = int(5) are valid'], answer: 3, explanation: 'Variables are dynamically typed in Python. Both dynamic assignment and explicit casting are valid.' },
        { id: 'p3', type: 'mcq', difficulty: 'easy', q: 'Which keyword is used to create a function in Python?', options: ['function', 'def', 'fun', 'create'], answer: 1, explanation: 'def is used to define a function in Python.' },
        { id: 'p4', type: 'mcq', difficulty: 'medium', q: 'What is the output of print(type([])) in Python?', options: ["<class 'tuple'>", "<class 'list'>", "<class 'set'>", "<class 'dict'>"], answer: 1, explanation: '[] creates a list object in Python.' },
        { id: 'p5', type: 'true_false', difficulty: 'easy', q: 'In Python, tuples are mutable data structures.', options: ['True', 'False'], answer: 1, explanation: 'Tuples are immutable; their values cannot be modified after creation.' },
        { id: 'p6', type: 'code', difficulty: 'medium', q: 'What will be the output of the following Python code snippet?', code: 'x = [1, 2, 3]\ny = x\ny.append(4)\nprint(x)', options: ['[1, 2, 3]', '[1, 2, 3, 4]', '[4]', 'Error'], answer: 1, explanation: 'Lists are reference types in Python, so modifying y also modifies x.' },
        { id: 'p7', type: 'fill_blank', difficulty: 'medium', q: 'Complete the Python keyword to handle exceptions: try...________', answer: 'except', explanation: 'Python uses try...except blocks to catch runtime exceptions.' },
        { id: 'p8', type: 'mcq', difficulty: 'hard', q: 'Which built-in module is used for regular expressions in Python?', options: ['regex', 're', 'regexp', 'match'], answer: 1, explanation: 're is the standard module for regular expressions.' },
        { id: 'p9', type: 'code', difficulty: 'hard', q: 'What is the value of result in Python?', code: 'func = lambda x: x * 2\nresult = list(map(func, [1, 2, 3]))', options: ['[2, 4, 6]', '[1, 2, 3]', '6', '[1, 4, 9]'], answer: 0, explanation: 'map applies the lambda function (x*2) to each list element.' },
        { id: 'p10', type: 'image', difficulty: 'medium', q: 'Identify the Python data structure represented in this memory layout diagram:', image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="120" viewBox="0 0 300 120"><rect width="300" height="120" rx="10" fill="%236366f1"/><text x="150" y="40" fill="white" font-family="sans-serif" font-weight="bold" font-size="16" text-anchor="middle">Key -> Value Pairs</text><rect x="30" y="60" width="110" height="40" rx="5" fill="white"/><text x="85" y="85" fill="%23333" font-size="14" text-anchor="middle">"name": "Alex"</text><rect x="160" y="60" width="110" height="40" rx="5" fill="white"/><text x="215" y="85" fill="%23333" font-size="14" text-anchor="middle">"age": 21</text></svg>', options: ['List', 'Dictionary (dict)', 'Set', 'Tuple'], answer: 1, explanation: 'Key-value mapping represents a Python Dictionary.' }
    ],

    Java: [
        { id: 'j1', type: 'mcq', difficulty: 'easy', q: 'Which keyword is used to declare a class in Java?', options: ['class', 'struct', 'interface', 'object'], answer: 0, explanation: 'The class keyword is used to declare a class in Java.' },
        { id: 'j2', type: 'mcq', difficulty: 'easy', q: 'What is the entry point method signature for a Java application?', options: ['public static void main(String[] args)', 'public void main(String args)', 'static void main()', 'void main(String[] args)'], answer: 0, explanation: 'JVM looks for public static void main(String[] args).' },
        { id: 'j3', type: 'code', difficulty: 'medium', q: 'What will this Java code print?', code: 'int x = 5;\nSystem.out.println(x++ + ++x);', options: ['10', '12', '11', '13'], answer: 1, explanation: 'x++ evaluates to 5 (x becomes 6), ++x evaluates to 7. 5 + 7 = 12.' },
        { id: 'j4', type: 'true_false', difficulty: 'easy', q: 'Java supports multiple inheritance through classes directly.', options: ['True', 'False'], answer: 1, explanation: 'Java does not support multiple inheritance with classes to avoid ambiguity; it uses interfaces instead.' },
        { id: 'j5', type: 'fill_blank', difficulty: 'medium', q: 'Which keyword prevents a class from being inherited or a method from being overridden in Java?', answer: 'final', explanation: 'The final keyword makes variables constant, methods un-overridable, and classes un-extendable.' },
        { id: 'j6', type: 'mcq', difficulty: 'hard', q: 'Which memory section stores local variables and method invocation frames in Java?', options: ['Heap Memory', 'Stack Memory', 'Method Area', 'PermGen / Metaspace'], answer: 1, explanation: 'Stack memory stores local variables and active stack frames.' }
    ],

    DataStructures: [
        { id: 'ds1', type: 'mcq', difficulty: 'easy', q: 'Which data structure follows the LIFO (Last In First Out) principle?', options: ['Queue', 'Stack', 'Linked List', 'Tree'], answer: 1, explanation: 'Stack follows Last-In, First-Out.' },
        { id: 'ds2', type: 'mcq', difficulty: 'easy', q: 'Which data structure follows the FIFO (First In First Out) principle?', options: ['Queue', 'Stack', 'Heap', 'Graph'], answer: 0, explanation: 'Queue follows First-In, First-Out.' },
        { id: 'ds3', type: 'code', difficulty: 'medium', q: 'What is the worst-case time complexity of Binary Search on a sorted array of size N?', code: '// Binary Search Algorithm\nwhile (low <= high) {\n    mid = (low + high) / 2;\n}', options: ['O(N)', 'O(N log N)', 'O(log N)', 'O(1)'], answer: 2, explanation: 'Binary Search halves the search space at each step, giving O(log N) complexity.' },
        { id: 'ds4', type: 'image', difficulty: 'medium', q: 'Which data structure traversal is illustrated below?', image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="120" viewBox="0 0 300 120"><circle cx="150" cy="30" r="18" fill="%2310b981"/><text x="150" y="35" fill="white" font-size="14" font-weight="bold" text-anchor="middle">A</text><circle cx="90" cy="90" r="18" fill="%236366f1"/><text x="90" y="95" fill="white" font-size="14" font-weight="bold" text-anchor="middle">B</text><circle cx="210" cy="90" r="18" fill="%236366f1"/><text x="210" y="95" fill="white" font-size="14" font-weight="bold" text-anchor="middle">C</text><line x1="135" y1="42" x2="105" y2="78" stroke="%23333" stroke-width="2"/><line x1="165" y1="42" x2="195" y2="78" stroke="%23333" stroke-width="2"/></svg>', options: ['Binary Tree', 'Hash Map', 'Circular Queue', 'Stack'], answer: 0, explanation: 'Hierarchical node structure with root and left/right children represents a Binary Tree.' },
        { id: 'ds5', type: 'fill_blank', difficulty: 'hard', q: 'The algorithm technique that breaks a problem into non-overlapping subproblems and solves them is called Divide and ________', answer: 'Conquer', explanation: 'Divide and Conquer algorithms include Merge Sort and Quick Sort.' }
    ],

    DBMS: [
        { id: 'db1', type: 'mcq', difficulty: 'easy', q: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Query Logic', 'Sequential Query List', 'Standard Question Language'], answer: 0, explanation: 'SQL stands for Structured Query Language.' },
        { id: 'db2', type: 'mcq', difficulty: 'medium', q: 'Which command is used to remove all records from a table without deleting the table structure?', options: ['DROP', 'TRUNCATE', 'DELETE', 'REMOVE'], answer: 1, explanation: 'TRUNCATE deletes all rows efficiently while retaining table structure.' },
        { id: 'db3', type: 'true_false', difficulty: 'easy', q: 'A Primary Key in a SQL database table can accept NULL values.', options: ['True', 'False'], answer: 1, explanation: 'Primary keys must be unique and cannot contain NULL values.' },
        { id: 'db4', type: 'code', difficulty: 'medium', q: 'What will this SQL query return?', code: 'SELECT COUNT(*)\nFROM Students\nWHERE Marks > 80;', options: ['List of student names', 'The total count of students with marks above 80', 'All student records', 'Error'], answer: 1, explanation: 'COUNT(*) aggregate function returns the total number of matching rows.' }
    ],

    // ==========================================
    // WEB TECHNOLOGY & GENERAL TOPICS
    // ==========================================

    HTML: [
        { id: 'h1', type: 'mcq', difficulty: 'easy', q: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Text Machine Language", "Hyperlinks and Text Markup Language", "Home Tool Markup Language"], answer: 0, explanation: "HTML stands for Hyper Text Markup Language." },
        { id: 'h2', type: 'mcq', difficulty: 'easy', q: "Which tag creates the largest heading in HTML?", options: ["<h6>", "<heading>", "<h1>", "<head>"], answer: 2, explanation: "<h1> tag creates the largest heading." },
        { id: 'h3', type: 'fill_blank', difficulty: 'easy', q: "The HTML element used to embed external CSS stylesheet is <________ rel='stylesheet'>", answer: 'link', explanation: "<link> tag in the <head> links external CSS files." },
        { id: 'h4', type: 'code', difficulty: 'medium', q: "What does this HTML semantic layout tag represent?", code: '<article>\n  <h2>Title</h2>\n  <p>Content...</p>\n</article>', options: ['Page Navigation', 'Self-contained Independent Article', 'Page Footer', 'Sidebar'], answer: 1, explanation: '<article> tag specifies independent, self-contained content.' }
    ],

    CSS: [
        { id: 'c1', type: 'mcq', difficulty: 'easy', q: 'What does CSS stand for?', options: ['Cascading Style Sheets', 'Creative Style System', 'Computer Style Sheet', 'Colorful Style Structure'], answer: 0, explanation: 'CSS stands for Cascading Style Sheets.' },
        { id: 'c2', type: 'code', difficulty: 'medium', q: 'What layout mode is enabled by this CSS rule?', code: '.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}', options: ['CSS Grid', 'Flexbox (Flexible Box Layout)', 'Float layout', 'Absolute positioning'], answer: 1, explanation: 'display: flex enables Flexbox.' },
        { id: 'c3', type: 'fill_blank', difficulty: 'easy', q: 'In the CSS box model, the space between the element content and its border is called ________', answer: 'padding', explanation: 'Padding is the inner spacing inside an element boundary.' }
    ],

    JavaScript: [
        { id: 'js1', type: 'mcq', difficulty: 'easy', q: 'Which keyword declares a block-scoped variable in modern JavaScript?', options: ['var', 'let', 'dim', 'define'], answer: 1, explanation: 'let and const declare block-scoped variables introduced in ES6.' },
        { id: 'js2', type: 'code', difficulty: 'medium', q: 'What is the output of this JavaScript code?', code: 'console.log(typeof NaN);', options: ['"number"', '"nan"', '"undefined"', '"object"'], answer: 0, explanation: 'NaN stands for Not-a-Number, but its Javascript type is "number".' },
        { id: 'js3', type: 'code', difficulty: 'hard', q: 'What will be logged to the console?', code: 'const arr = [1, 2, 3];\nconst [a, ...rest] = arr;\nconsole.log(rest);', options: ['1', '[2, 3]', '[1, 2, 3]', 'undefined'], answer: 1, explanation: 'Array destructuring with rest operator captures remaining elements [2, 3].' }
    ],

    GeneralKnowledge: [
        { id: 'gk1', type: 'mcq', difficulty: 'easy', q: 'Who is known as the father of modern Computer Science?', options: ['Alan Turing', 'Charles Babbage', 'John von Neumann', 'Tim Berners-Lee'], answer: 0, explanation: 'Alan Turing is widely considered to be the father of theoretical computer science and AI.' },
        { id: 'gk2', type: 'mcq', difficulty: 'easy', q: 'What does CPU stand for in computer hardware?', options: ['Central Processing Unit', 'Central Program Utility', 'Computer Power Unit', 'Core Processing Utility'], answer: 0, explanation: 'CPU stands for Central Processing Unit.' },
        { id: 'gk3', type: 'mcq', difficulty: 'medium', q: 'Which protocol is used for securely transmitting web pages across the internet?', options: ['HTTP', 'HTTPS', 'FTP', 'SMTP'], answer: 1, explanation: 'HTTPS (HyperText Transfer Protocol Secure) encrypts communication over SSL/TLS.' },
        { id: 'gk4', type: 'fill_blank', difficulty: 'easy', q: 'The binary number system consists of only two digits: 0 and ________', answer: '1', explanation: 'Binary uses base 2 consisting of 0 and 1.' }
    ],

    // ==========================================
    // DEPARTMENT COMPREHENSIVE SUBJECTS
    // ==========================================

    BCA: [
        { id: 'bca1', type: 'mcq', difficulty: 'medium', q: 'Which SDLC model follows a sequential linear flow of development phases?', options: ['Waterfall Model', 'Agile Model', 'Spiral Model', 'RAD Model'], answer: 0, explanation: 'Waterfall Model progresses linearly through requirement, design, coding, testing, and deployment.' },
        { id: 'bca2', type: 'mcq', difficulty: 'medium', q: 'In Operating Systems, what does a Semaphore primarily control?', options: ['Memory Allocation', 'Process Synchronization & Resource Access', 'Disk Scheduling', 'Network Routing'], answer: 1, explanation: 'Semaphores are synchronization tools used to control concurrent access to shared resources.' },
        { id: 'bca3', type: 'fill_blank', difficulty: 'easy', q: 'In Object-Oriented Programming, wrapping data and methods into a single unit is called ________', answer: 'encapsulation', explanation: 'Encapsulation bundles data attributes and methods together.' },
        { id: 'bca4', type: 'mcq', difficulty: 'hard', q: 'Which layer in the OSI model is responsible for end-to-end reliability and flow control?', options: ['Network Layer', 'Transport Layer', 'Data Link Layer', 'Session Layer'], answer: 1, explanation: 'The Transport Layer (TCP/UDP) handles end-to-end communication and data flow.' }
    ],

    BSc: [
        { id: 'bsc1', type: 'mcq', difficulty: 'medium', q: 'What is the Boolean logic equivalent of (A AND B)\' according to De Morgan\'s Law?', options: ['A\' OR B\'', 'A\' AND B\'', 'A OR B', 'A XOR B'], answer: 0, explanation: 'De Morgan\'s Law states that (A · B)\' = A\' + B\'.' },
        { id: 'bsc2', type: 'mcq', difficulty: 'hard', q: 'In Theoretical Computer Science, which machine can recognize context-free grammars?', options: ['Finite Automata', 'Pushdown Automata', 'Linear Bounded Automata', 'Logic Gate Array'], answer: 1, explanation: 'Pushdown Automata with a stack recognize Context-Free Languages (CFL).' },
        { id: 'bsc3', type: 'fill_blank', difficulty: 'medium', q: 'The register that holds the memory address of the next instruction to be executed in CPU is called Program ________', answer: 'Counter', explanation: 'Program Counter (PC) stores the address of the next instruction.' }
    ],

    BComCA: [
        { id: 'bcom1', type: 'mcq', difficulty: 'easy', q: 'What is the primary objective of double-entry bookkeeping in financial accounting?', options: ['Ensure every debit has a corresponding credit', 'Calculate only gross profits', 'Track employee attendance', 'Generate tax receipts only'], answer: 0, explanation: 'Double-entry bookkeeping ensures every debit entry has an equal and opposite credit entry.' },
        { id: 'bcom2', type: 'mcq', difficulty: 'medium', q: 'In database management for E-Commerce, which property ensures a transaction completes in its entirety or not at all?', options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'], answer: 0, explanation: 'Atomicity ensures "all or nothing" execution of transaction units.' },
        { id: 'bcom3', type: 'fill_blank', difficulty: 'easy', q: 'Complete the fundamental equation: Assets = Liabilities + Capital (Owner\'s ________)', answer: 'Equity', explanation: 'Assets = Liabilities + Owner\'s Equity.' }
    ],

    BBA: [
        { id: 'bba1', type: 'mcq', difficulty: 'easy', q: 'Who is regarded as the Father of Scientific Management?', options: ['Frederick Winslow Taylor', 'Henri Fayol', 'Peter Drucker', 'Elton Mayo'], answer: 0, explanation: 'F.W. Taylor introduced scientific management principles.' },
        { id: 'bba2', type: 'mcq', difficulty: 'medium', q: 'What does the SWOT matrix evaluate in strategic business management?', options: ['Strengths, Weaknesses, Opportunities, Threats', 'Sales, Work, Operations, Tasks', 'Services, Wealth, Objectives, Teams', 'Strategy, Wisdom, Options, Timing'], answer: 0, explanation: 'SWOT evaluates internal Strengths/Weaknesses and external Opportunities/Threats.' },
        { id: 'bba3', type: 'fill_blank', difficulty: 'easy', q: 'The management process function that involves guiding and motivating employees is called ________', answer: 'Directing', explanation: 'Directing includes leadership, communication, supervision, and motivation.' }
    ],

    Accounting: [
        { id: 'acc1', type: 'mcq', difficulty: 'easy', q: 'What is the Golden Rule of Accounting for Real Accounts?', options: ['Debit what comes in, Credit what goes out', 'Debit the receiver, Credit the giver', 'Debit all expenses, Credit all incomes', 'Debit total assets, Credit equity'], answer: 0, explanation: 'Real Accounts rule: Debit what comes in, Credit what goes out.' },
        { id: 'acc2', type: 'fill_blank', difficulty: 'medium', q: 'Complete the fundamental Accounting Equation: Assets = Liabilities + ________', answer: 'Equity', explanation: 'Accounting Equation: Assets = Liabilities + Owner\'s Equity.' },
        { id: 'acc3', type: 'true_false', difficulty: 'easy', q: 'Depreciation is a non-cash expense deducted from revenues.', options: ['True', 'False'], answer: 0, explanation: 'True. Depreciation allocates tangible asset cost over useful lifespan.' }
    ],

    BusinessAdmin: [
        { id: 'ba1', type: 'mcq', difficulty: 'easy', q: 'Which 4 P\'s form the traditional Marketing Mix?', options: ['Product, Price, Place, Promotion', 'Plan, People, Process, Profit', 'Production, Packaging, Positioning, Payment', 'Policy, Public, Partners, Platform'], answer: 0, explanation: 'The 4 Ps of Marketing are Product, Price, Place, and Promotion.' },
        { id: 'ba2', type: 'true_false', difficulty: 'easy', q: 'Maslow\'s Hierarchy of Needs places Self-Actualization at the highest level of psychological fulfillment.', options: ['True', 'False'], answer: 0, explanation: 'Self-Actualization is at the apex of Abraham Maslow\'s pyramid.' }
    ]
};

// Department to Subject Map mapping for Category System
const DepartmentSubjects = {
    BCA: ['Python', 'Java', 'DataStructures', 'DBMS', 'HTML', 'CSS', 'JavaScript', 'BCA'],
    BSc: ['Python', 'DataStructures', 'DBMS', 'Java', 'BSc'],
    'BCom CA': ['BComCA', 'DBMS', 'HTML', 'CSS', 'Python', 'Accounting'],
    BBA: ['BBA', 'BusinessAdmin', 'Accounting', 'GeneralKnowledge'],
    BCom: ['Accounting', 'BusinessAdmin', 'BBA', 'GeneralKnowledge'],
    General: ['Python', 'Java', 'DataStructures', 'DBMS', 'HTML', 'CSS', 'JavaScript', 'GeneralKnowledge', 'BCA', 'BSc', 'BComCA', 'BBA']
};
