// Access to GRADING_SCALE and SYLLABUS_DATA objects defined in data.js
const branchSelect = document.getElementById('branch-select');
const semesterSelect = document.getElementById('semester-select');
const courseInputSection = document.getElementById('course-input-section');
const coursesList = document.getElementById('courses-list');
const calculateBtn = document.getElementById('calculate-btn');
const targetCalculateBtn = document.getElementById('target-calculate-btn');

// --- Main UI Logic ---
branchSelect.addEventListener('change', () => {
    populateSemesters();
    coursesList.innerHTML = '';
    courseInputSection.style.display = 'none';
});

semesterSelect.addEventListener('change', () => {
    populateCourses();
});

function populateSemesters() {
    const branch = branchSelect.value;
    semesterSelect.innerHTML = '<option value="">-- Choose Semester --</option>';
    if (branch && SYLLABUS_DATA[branch]) {
        const semesters = Object.keys(SYLLABUS_DATA[branch]).sort();
        semesters.forEach(sem => {
            const option = document.createElement('option');
            option.value = sem;
            option.textContent = sem;
            semesterSelect.appendChild(option);
        });
    }
}

function populateCourses() {
    const branch = branchSelect.value;
    const semester = semesterSelect.value;
    coursesList.innerHTML = '';
    courseInputSection.style.display = 'block';

    if (branch && semester) {
        const courses = SYLLABUS_DATA[branch][semester];
        courses.forEach((course, index) => {
            if (!course.is_sgpa) return; // Skip non-SGPA courses (MCN)

            const row = document.createElement('div');
            row.className = 'course-row';
            row.dataset.index = index;

            let courseNameDisplay = `<span class="col-name">${course.code} - ${course.name}</span>`;
            if (course.is_elective && course.options.length > 0) {
                const selectId = `elective-select-${index}`;
                let optionsHtml = `<select id="${selectId}" class="elective-select">`;
                course.options.forEach(opt => {
                    optionsHtml += `<option value="${opt.code}">${opt.code} - ${opt.name}</option>`;
                });
                optionsHtml += '</select>';
                courseNameDisplay = `<span class="col-name elective-title">${course.name}: ${optionsHtml}</span>`;
            }

            const inputMaxCA = course.max_ca;
            const inputMaxUE = course.max_ue;
            const maxCaDisplay = inputMaxCA > 0 ? `Max ${inputMaxCA}` : '';
            const maxUeDisplay = inputMaxUE > 0 ? `Max ${inputMaxUE}` : '';

            row.innerHTML = `
                <div class="input-group">
                    <input type="radio" name="target-subject" data-index="${index}" value="${course.code}">
                </div>
                ${courseNameDisplay}
                <span class="col-credits">${course.credits}</span>
                <div class="input-group">
                    <input type="number" class="ca-input" data-index="${index}" min="0" max="${inputMaxCA}" value="">
                    <small>(${maxCaDisplay})</small>
                </div>
                <div class="input-group">
                    <input type="number" class="ue-input" data-index="${index}" min="0" max="${inputMaxUE}" value="">
                    <small>(${maxUeDisplay})</small>
                </div>
                <span class="col-grade" data-index="${index}">--</span>
                <span class="col-gp" data-index="${index}">--</span>
            `;
            coursesList.appendChild(row);
        });

        document.querySelectorAll('.ca-input, .ue-input, .elective-select').forEach(input => {
            input.addEventListener('input', updateCourseRow);
        });
    }
}

// --- Calculation Logic ---
function getGradeInfo(totalMarks, maxTotalMarks, ueMarks, maxUeMarks) {
    if (totalMarks === null || totalMarks < 0 || maxTotalMarks === 0) {
        return { grade: '--', gp: '--', status: '' };
    }

    const percentage = (totalMarks / maxTotalMarks) * 100;

    // 1. Check ESE Passing Criteria (UE < 40% of Max UE is FAIL)
    if (maxUeMarks > 0 && ueMarks !== null && ueMarks < (0.4 * maxUeMarks)) {
        return { grade: 'F', gp: 0.0, status: 'FAIL (UE < 40%)' };
    }

    // 2. Check Overall Passing Criteria (Total < 50% is FAIL)
    if (percentage < 50) {
        return { grade: 'F', gp: 0.0, status: 'FAIL (Total < 50%)' };
    }

    // 3. Determine Grade Point
    let result = { grade: 'F', gp: 0.0, status: 'FAIL' };
    for (let scale of GRADING_SCALE) {
        if (percentage >= scale.min_percent) {
            result = { grade: scale.grade, gp: scale.gp, status: 'PASS' };
            break;
        }
    }
    return result;
}

function updateCourseRow(event) {
    const index = event.target.dataset.index;
    const caInput = document.querySelector(`.ca-input[data-index="${index}"]`);
    const ueInput = document.querySelector(`.ue-input[data-index="${index}"]`);
    const gradeSpan = document.querySelector(`.col-grade[data-index="${index}"]`);
    const gpSpan = document.querySelector(`.col-gp[data-index="${index}"]`);

    const ca = parseFloat(caInput.value) || 0;
    const ue = parseFloat(ueInput.value);
    const course = getCurrentCourse(index);
    if (!course) return;

    const maxTotal = course.max_ca + course.max_ue;
    const totalMarks = ca + (isNaN(ue) ? 0 : ue);

    const gradeInfo = getGradeInfo(totalMarks, maxTotal, isNaN(ue) ? null : ue, course.max_ue);
    gradeSpan.textContent = gradeInfo.grade;
    gradeSpan.className = `col-grade ${gradeInfo.grade === 'F' ? 'fail-status' : 'pass-status'}`;
    gpSpan.textContent = gradeInfo.gp;
    gpSpan.className = `col-gp ${gradeInfo.grade === 'F' ? 'fail-status' : 'pass-status'}`;

    calculateSGPA();
}

function calculateSGPA() {
    let totalCredits = 0;
    let totalGradePoints = 0;
    let hasFail = false;

    const courseRows = document.querySelectorAll('.course-row');
    courseRows.forEach(row => {
        const index = row.dataset.index;
        const course = getCurrentCourse(index);
        if (!course || !course.is_sgpa) return;

        const credits = course.credits;
        const gp = parseFloat(document.querySelector(`.col-gp[data-index="${index}"]`).textContent);

        if (!isNaN(gp) && gp >= 0) {
            totalCredits += credits;
            totalGradePoints += credits * gp;
            if (gp === 0) hasFail = true;
        } else if (document.querySelector(`.ca-input[data-index="${index}"]`).value !== '' ||
                   document.querySelector(`.ue-input[data-index="${index}"]`).value !== '') {
            hasFail = true;
        }
    });

    const sgpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '0.00';
    document.getElementById('sgpa-result').textContent = sgpa;
    document.getElementById('total-credits').textContent = totalCredits;
    document.getElementById('fail-warning').textContent = hasFail ? "⚠️ Warning: One or more subjects failed (GP = 0.0)." : "";
}

// --- Target SGPA Logic ---
targetCalculateBtn.addEventListener('click', calculateTargetMarks);

function getCurrentCourse(index) {
    const branch = branchSelect.value;
    const semester = semesterSelect.value;
    if (!branch || !semester) return null;
    return SYLLABUS_DATA[branch][semester][index];
}

function getGradePoint(percentage) {
    for (let scale of GRADING_SCALE) {
        if (percentage >= scale.min_percent) {
            return scale.gp;
        }
    }
    return 0.0;
}

function calculateTargetMarks() {
    const targetSGPA = parseFloat(document.getElementById('target-sgpa').value);
    const selectedRadio = document.querySelector('input[name="target-subject"]:checked');

    if (!selectedRadio) {
        document.getElementById('target-unreachable').textContent = "Please select a subject.";
        return;
    }

    const index = selectedRadio.dataset.index;
    const course = getCurrentCourse(index);
    if (!course) return;

    // Current grade points excluding selected subject
    let currentGradePoints = 0;
    let totalCredits = 0;
    const courseRows = document.querySelectorAll('.course-row');
    courseRows.forEach(row
