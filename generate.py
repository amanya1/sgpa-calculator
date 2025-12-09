import json

# --- Helper Functions ---
def get_max_marks(code, credits, l_t_p):
    if code.startswith('MCN'):
        return 0, 0, False  # Non-credit
    elif credits == 0:
        return 0, 0, False
    elif '0-0-' in l_t_p:
        if 'PROJECT' in code.upper() and credits > 2:
            return 75, 75, True
        return 75, 75, True
    elif credits == 1 and (code.endswith('08') or code.endswith('16')):
        return 50, 0, True
    return 50, 100, True

# --- Syllabus Data Extraction ---
# (IT, CSE, ECE syllabus dictionaries here — keep them as in your docx)

syllabus_data = {
    "IT": it_syllabus,
    "CSE": cse_syllabus,
    "ECE": ece_syllabus
}

formatted_data = {}
for branch, semesters in syllabus_data.items():
    formatted_data[branch] = {}
    for sem, courses in semesters.items():
        formatted_data[branch][sem] = []
        for course in courses:
            code, name, credits, ltp, category, is_elective = course[0:6]
            max_ca, max_ue, is_sgpa = get_max_marks(code, credits, ltp)
            course_entry = {
                "code": code,
                "name": name,
                "credits": credits,
                "l_t_p": ltp,
                "max_ca": max_ca,
                "max_ue": max_ue,
                "is_sgpa": is_sgpa,
            }
            if is_elective:
                options = []
                if len(course) > 6:
                    for opt_code, opt_name in course[6]:
                        options.append({"code": opt_code, "name": opt_name})
                course_entry["is_elective"] = True
                course_entry["options"] = options
            else:
                course_entry["is_elective"] = False

            if credits == 0:
                course_entry["is_sgpa"] = False
                course_entry["max_ca"] = 50
                course_entry["max_ue"] = 0

            if code in ["ITT207", "CST207"]:
                course_entry["code"] = "EST200 / HUT200"
                course_entry["name"] = "DESIGN & ENGINEERING / PROFESSIONAL ETHICS"

            if is_sgpa:
                formatted_data[branch][sem].append(course_entry)

grading_scale = [
    {"min_percent": 90, "max_percent": 101, "grade": "S", "gp": 10.0, "min_mark": 135},
    {"min_percent": 85, "max_percent": 90, "grade": "A+", "gp": 9.0, "min_mark": 127.5},
    {"min_percent": 80, "max_percent": 85, "grade": "A", "gp": 8.5, "min_mark": 120},
    {"min_percent": 75, "max_percent": 80, "grade": "B+", "gp": 8.0, "min_mark": 112.5},
    {"min_percent": 70, "max_percent": 75, "grade": "B", "gp": 7.5, "min_mark": 105},
    {"min_percent": 65, "max_percent": 70, "grade": "C+", "gp": 7.0, "min_mark": 97.5},
    {"min_percent": 60, "max_percent": 65, "grade": "C", "gp": 6.5, "min_mark": 90},
    {"min_percent": 55, "max_percent": 60, "grade": "D", "gp": 6.0, "min_mark": 82.5},
    {"min_percent": 50, "max_percent": 55, "grade": "P", "gp": 5.5, "min_mark": 75},
    {"min_percent": 0, "max_percent": 50, "grade": "F", "gp": 0.0, "min_mark": 0}
]

js_content = f"const GRADING_SCALE = {json.dumps(grading_scale, indent=4)};\n\n"
js_content += f"const SYLLABUS_DATA = {json.dumps(formatted_data, indent=4)};\n"

with open("data.js", "w") as f:
    f.write(js_content)
