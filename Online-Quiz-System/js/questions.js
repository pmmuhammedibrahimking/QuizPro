const defaultQuizQuestions = {
    HTML: [
        { id: 'h1', q: 'What does HTML stand for?', options: ['Hyper Text Preprocessor', 'Hyper Text Markup Language', 'Hyper Tool Multi Language', 'Hyper Text Multiple Language'], answer: 1, explanation: 'HTML stands for Hyper Text Markup Language.' },
        { id: 'h2', q: 'Which tag is used for the largest heading in HTML5?', options: ['<heading>', '<h6>', '<h1>', '<head>'], answer: 2, explanation: '<h1> defines the most important heading.' },
        { id: 'h3', q: 'Which attribute is used to provide an alternative text for an image?', options: ['alt', 'title', 'src', 'href'], answer: 0, explanation: 'The alt attribute provides alternative information for an image.' },
        { id: 'h4', q: 'What is the correct HTML element for inserting a line break?', options: ['<break>', '<br>', '<lb>', '<newline>'], answer: 1, explanation: '<br> inserts a single line break.' },
        { id: 'h5', q: 'Which HTML element is used to specify a footer for a document or section?', options: ['<bottom>', '<footer>', '<section>', '<div>'], answer: 1, explanation: 'The <footer> element defines a footer for a document or section.' },
        { id: 'h6', q: 'In HTML, which attribute is used to specify that an input field must be filled out?', options: ['placeholder', 'validate', 'required', 'formvalidate'], answer: 2, explanation: 'The required attribute specifies that an input field must be filled out before submitting the form.' },
        { id: 'h7', q: 'Which input type defines a slider control?', options: ['slider', 'range', 'controls', 'search'], answer: 1, explanation: '<input type="range"> defines a control for entering a number whose exact value is not important (like a slider).' },
        { id: 'h8', q: 'Which HTML element is used to define navigation links?', options: ['<nav>', '<navigate>', '<navigation>', '<links>'], answer: 0, explanation: 'The <nav> element defines a set of navigation links.' },
        { id: 'h9', q: 'What is the correct HTML for making a checkbox?', options: ['<input type="checkbox">', '<checkbox>', '<input type="check">', '<check>'], answer: 0, explanation: '<input type="checkbox"> defines a checkbox.' },
        { id: 'h10', q: 'Which tag is used to create a drop-down list?', options: ['<list>', '<dropdown>', '<select>', '<option>'], answer: 2, explanation: 'The <select> element is used to create a drop-down list.' }
    ],
    CSS: [
        { id: 'c1', q: 'What does CSS stand for?', options: ['Colorful Style Sheets', 'Creative Style Sheets', 'Cascading Style Sheets', 'Computer Style Sheets'], answer: 2, explanation: 'CSS stands for Cascading Style Sheets.' },
        { id: 'c2', q: 'Which HTML attribute is used to define inline styles?', options: ['style', 'font', 'class', 'styles'], answer: 0, explanation: 'The style attribute is used to add inline styles to an element.' },
        { id: 'c3', q: 'Which property is used to change the background color?', options: ['color', 'bgcolor', 'background-color', 'bg-color'], answer: 2, explanation: 'The background-color property is used to specify the background color of an element.' },
        { id: 'c4', q: 'How do you add a comment in a CSS file?', options: ['// this is a comment', '/* this is a comment */', '<!-- this is a comment -->', '\' this is a comment'], answer: 1, explanation: 'Comments in CSS start with /* and end with */.' },
        { id: 'c5', q: 'Which property is used to change the font of an element?', options: ['font-weight', 'font-family', 'font-style', 'font-size'], answer: 1, explanation: 'The font-family property specifies the font for an element.' },
        { id: 'c6', q: 'How do you make the text bold in CSS?', options: ['font: bold;', 'style: bold;', 'font-weight: bold;', 'text-decoration: bold;'], answer: 2, explanation: 'The font-weight property sets how thick or thin characters in text should be displayed.' },
        { id: 'c7', q: 'Which property is used to create space between the element\'s border and inner content?', options: ['margin', 'padding', 'spacing', 'border-spacing'], answer: 1, explanation: 'Padding is used to generate space around an element\'s content, inside of any defined borders.' },
        { id: 'c8', q: 'How do you select an element with id "demo"?', options: ['.demo', '#demo', '*demo', 'demo'], answer: 1, explanation: 'The #id selector styles the element with the specified id.' },
        { id: 'c9', q: 'Which property is used to change the text color of an element?', options: ['fgcolor', 'text-color', 'color', 'font-color'], answer: 2, explanation: 'The color property specifies the color of text.' },
        { id: 'c10', q: 'What is the default value of the position property?', options: ['relative', 'fixed', 'absolute', 'static'], answer: 3, explanation: 'HTML elements are positioned static by default.' }
    ],
    JavaScript: [
        { id: 'j1', q: 'Inside which HTML element do we put the JavaScript?', options: ['<javascript>', '<scripting>', '<js>', '<script>'], answer: 3, explanation: 'The <script> tag is used to embed a client-side script.' },
        { id: 'j2', q: 'Where is the correct place to insert a JavaScript?', options: ['The <head> section', 'The <body> section', 'Both <head> and <body>', 'None of the above'], answer: 2, explanation: 'Scripts can be placed in both the <body> and the <head> sections.' },
        { id: 'j3', q: 'How do you write "Hello World" in an alert box?', options: ['msgBox("Hello World");', 'alertBox("Hello World");', 'alert("Hello World");', 'msg("Hello World");'], answer: 2, explanation: 'The alert() method displays an alert box with a specified message.' },
        { id: 'j4', q: 'How do you create a function in JavaScript?', options: ['function myFunction()', 'function:myFunction()', 'function = myFunction()', 'def myFunction()'], answer: 0, explanation: 'A JavaScript function is defined with the function keyword, followed by a name, followed by parentheses ().' },
        { id: 'j5', q: 'How do you call a function named "myFunction"?', options: ['call function myFunction()', 'myFunction()', 'call myFunction()', 'execute myFunction()'], answer: 1, explanation: 'To invoke (call) a function, write its name followed by parentheses.' },
        { id: 'j6', q: 'How to write an IF statement in JavaScript?', options: ['if i = 5 then', 'if i == 5 then', 'if (i == 5)', 'if i = 5'], answer: 2, explanation: 'Use if to specify a block of code to be executed, if a specified condition is true.' },
        { id: 'j7', q: 'How does a WHILE loop start?', options: ['while i = 1 to 10', 'while (i <= 10)', 'while (i <= 10; i++)', 'until i == 10'], answer: 1, explanation: 'The while loop loops through a block of code as long as a specified condition is true.' },
        { id: 'j8', q: 'How can you add a comment in a JavaScript?', options: ['<!-- This is a comment -->', '//This is a comment', '\'This is a comment', '**This is a comment**'], answer: 1, explanation: 'Single line comments start with //.' },
        { id: 'j9', q: 'What is the correct way to write a JavaScript array?', options: ['var colors = 1 = ("red"), 2 = ("green")', 'var colors = "red", "green"', 'var colors = (1:"red", 2:"green")', 'var colors = ["red", "green"]'], answer: 3, explanation: 'Arrays use square brackets [].' },
        { id: 'j10', q: 'Which operator is used to assign a value to a variable?', options: ['*', '-', '=', 'x'], answer: 2, explanation: 'The assignment operator (=) assigns a value to a variable.' }
    ],
    ComputerFundamentals: [
        { id: 'cf1', q: 'What does CPU stand for?', options: ['Central Process Unit', 'Computer Personal Unit', 'Central Processing Unit', 'Central Processor Unit'], answer: 2, explanation: 'CPU stands for Central Processing Unit.' },
        { id: 'cf2', q: 'Which of the following is an input device?', options: ['Monitor', 'Printer', 'Keyboard', 'Speaker'], answer: 2, explanation: 'A keyboard is an input device.' },
        { id: 'cf3', q: 'What is the main function of the ALU?', options: ['To store data', 'To perform arithmetic and logic operations', 'To control the flow of data', 'To display results'], answer: 1, explanation: 'ALU (Arithmetic Logic Unit) performs arithmetic and logic operations.' },
        { id: 'cf4', q: 'Which of the following is volatile memory?', options: ['ROM', 'Hard Drive', 'RAM', 'Flash Drive'], answer: 2, explanation: 'RAM (Random Access Memory) is volatile; data is lost when power is off.' },
        { id: 'cf5', q: 'What does GUI stand for?', options: ['Graphical User Interface', 'General User Interface', 'Global User Interface', 'Graphical User Interaction'], answer: 0, explanation: 'GUI stands for Graphical User Interface.' },
        { id: 'cf6', q: 'Which of the following is an Operating System?', options: ['Microsoft Word', 'Linux', 'Google Chrome', 'Intel'], answer: 1, explanation: 'Linux is a well-known Operating System.' },
        { id: 'cf7', q: 'What is the base of the binary number system?', options: ['2', '8', '10', '16'], answer: 0, explanation: 'Binary uses base 2 (0 and 1).' },
        { id: 'cf8', q: 'Which unit is used to measure processor speed?', options: ['Bytes', 'Hertz', 'Pixels', 'Bits'], answer: 1, explanation: 'Processor speed is measured in Hertz (Hz), typically Gigahertz (GHz).' },
        { id: 'cf9', q: 'What is the smallest unit of data in a computer?', options: ['Byte', 'Bit', 'Nibble', 'Word'], answer: 1, explanation: 'A bit (binary digit) is the smallest unit of data.' },
        { id: 'cf10', q: 'What does LAN stand for?', options: ['Local Area Network', 'Large Area Network', 'Logical Area Network', 'Local Access Network'], answer: 0, explanation: 'LAN stands for Local Area Network.' }
    ],
    Aptitude: [
        { id: 'a1', q: 'If A is the brother of B; B is the sister of C; and C is the father of D, how D is related to A?', options: ['Brother', 'Sister', 'Nephew/Niece', 'Cannot be determined'], answer: 3, explanation: 'Gender of D is not specified.' },
        { id: 'a2', q: 'Find the next number in the series: 2, 5, 10, 17, ...', options: ['24', '25', '26', '27'], answer: 2, explanation: 'The differences are 3, 5, 7. Next difference is 9. 17 + 9 = 26. Or, n^2 + 1.' },
        { id: 'a3', q: 'A train 120 meters long is running with a speed of 54 km/hr. In what time will it pass a telephone pole?', options: ['6 sec', '8 sec', '10 sec', '12 sec'], answer: 1, explanation: 'Speed = 54 * (5/18) = 15 m/s. Time = Distance / Speed = 120 / 15 = 8 seconds.' },
        { id: 'a4', q: 'If 20% of a number is 50, what is the number?', options: ['150', '200', '250', '300'], answer: 2, explanation: 'Let number be x. 0.20x = 50 => x = 250.' },
        { id: 'a5', q: 'What is the average of first five prime numbers?', options: ['5.2', '5.4', '5.6', '5.8'], answer: 2, explanation: 'First five primes: 2, 3, 5, 7, 11. Sum = 28. Average = 28/5 = 5.6.' },
        { id: 'a6', q: 'A can do a work in 15 days and B in 20 days. If they work on it together for 4 days, then the fraction of the work that is left is:', options: ['1/4', '1/10', '7/15', '8/15'], answer: 3, explanation: 'A\'s 1 day work = 1/15, B\'s = 1/20. Together 1 day = 1/15+1/20 = 7/60. 4 days = 28/60 = 7/15. Left = 1 - 7/15 = 8/15.' },
        { id: 'a7', q: 'The cost price of 20 articles is the same as the selling price of x articles. If the profit is 25%, then the value of x is:', options: ['15', '16', '18', '25'], answer: 1, explanation: 'CP of 20 = SP of x. Profit % = ((20-x)/x)*100 = 25 => 20-x = x/4 => 5x/4 = 20 => x = 16.' },
        { id: 'a8', q: 'If today is Monday, what will be the day after 65 days?', options: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'], answer: 1, explanation: '65 days / 7 = 9 weeks and 2 odd days. Monday + 2 days = Wednesday.' },
        { id: 'a9', q: 'Look at this series: 36, 34, 30, 28, 24, ... What number should come next?', options: ['20', '22', '23', '26'], answer: 1, explanation: 'Alternating subtraction series: subtract 2, then 4, then 2, etc. 24 - 2 = 22.' },
        { id: 'a10', q: 'Which word does NOT belong with the others?', options: ['Tulip', 'Rose', 'Bud', 'Daisy'], answer: 2, explanation: 'Tulip, Rose, and Daisy are types of flowers; a bud is a stage of development.' }
    ]
};
