# sgpa-calculator
A web-based SGPA (Semester Grade Point Average) calculator

This project is a **Semester Grade Point Average (SGPA) calculator** designed for Kerala University B.Tech students.  
It was **built collaboratively with AI tools (Gemini Flash 2.5, ChatGPT, and Microsoft Copilot)**.  
My role was to provide **prompt engineering and logic design at every step**, guiding the AI to generate the code and structure.

---

## ✨ Features
- 📚 Preloaded syllabus data for IT, CSE, and ECE branches  
- 🧮 Automatic grade point calculation based on CA/UE marks  
- 🎯 Target SGPA solver to estimate required marks  
- 🌐 Built with **HTML, CSS, JavaScript**, and **Python** (for generating syllabus data)

---

## 🚀 How to Run
1. Clone or download this repository.
2. Run `generate_data.py` once to create `data.js`.
   ```bash
   python generate_data.py




**********
 Prompt Engineering Notes
 This project was not hand-coded line by line. Instead, it was created through iterative prompt engineering.
Here’s how I guided the AI step by step:- 
Defining the Problem
- I explained the Kerala University SGPA system, syllabus structure, and grading rules.
- I clarified how CA (Continuous Assessment) and UE (University Exam) marks combine into grades.
Structuring the Data
- I prompted the AI to build syllabus data for IT, CSE, and ECE branches.
- Ensured electives were handled with dropdowns and options.
Logic Design
- I guided the AI to implement rules like:
- UE must be ≥ 40% to pass.
- Total marks ≥ 50% for passing.
- Grade points mapped to SGPA calculation.
Interface Building
- I asked the AI to generate HTML/CSS for a clean calculator layout.
- Ensured usability with branch/semester selectors and dynamic tables.
Target SGPA Solver
- I prompted the AI to add a feature where students can input a target SGPA and see required marks in a pending subject.
Debugging & Refinement
- Whenever errors appeared (like initialization conflicts), I adjusted prompts to fix them.
- I acted as the “logic architect,” while the AI handled code generation.

