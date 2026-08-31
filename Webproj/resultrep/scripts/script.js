// Global storage
window.studentDirectory = {};
window.allStudentsData = [];
window.allSubjectsList = [];

// --- 1. MODAL LOGIC (General) ---
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
    }, 10);
    document.body.style.overflow = 'hidden'; 
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
        
        // Check if any other modal is open before restoring body scroll
        const anyOpen = Array.from(document.querySelectorAll('[id$="Modal"]')).some(m => !m.classList.contains('hidden'));
        if (!anyOpen) {
            document.body.style.overflow = 'auto';
        }
    }, 300);
}

// --- STUDENT PROFILE MODAL ---
function showStudentModal(rollNo) {
    const student = window.studentDirectory[rollNo];
    if (!student) return;

    // --- CALCULATE RANKS (Accounting for ties) ---
    // Overall Rank
    let overallRank = 1, prevOverallP = -1;
    for(let i=0; i<window.allStudentsData.length; i++) {
        if(window.allStudentsData[i].percentage !== prevOverallP && i !== 0) overallRank = i + 1;
        prevOverallP = window.allStudentsData[i].percentage;
        if(window.allStudentsData[i].roll === student.roll) break;
    }

    // Stream Rank
    const streamStudents = window.allStudentsData.filter(s => s.stream === student.stream);
    let streamRank = 1, prevStreamP = -1;
    for(let i=0; i<streamStudents.length; i++) {
        if(streamStudents[i].percentage !== prevStreamP && i !== 0) streamRank = i + 1;
        prevStreamP = streamStudents[i].percentage;
        if(streamStudents[i].roll === student.roll) break;
    }
    // ---------------------------------------------

    document.getElementById('modalStudentName').textContent = student.name;
    document.getElementById('modalStudentRoll').textContent = "Roll No: " + student.roll;
    document.getElementById('modalStudentStream').textContent = student.stream;
    document.getElementById('modalStudentGender').textContent = student.gender === 'M' ? 'Male' : (student.gender === 'F' ? 'Female' : 'N/A');
    
    // Populate the new Rank Badges
    document.getElementById('modalStudentOverallRank').textContent = "Overall Rank: #" + overallRank;
    document.getElementById('modalStudentStreamRank').textContent = "Stream Rank: #" + streamRank;

    document.getElementById('modalTotal').textContent = student.top5Marks;

    document.getElementById('modalPercentage').textContent = student.percentage + "%"; // default best 5
    
    const resultEl = document.getElementById('modalResult');
    resultEl.textContent = student.result;
    resultEl.className = student.result === 'PASS' 
        ? 'text-2xl font-black text-brand-accent3 tracking-widest' 
        : 'text-2xl font-black text-red-500 tracking-widest';

    const tbody = document.getElementById('modalSubjectsTable');
    tbody.innerHTML = '';

    student.subjectDetails.forEach(sub => {
        const tr = document.createElement('tr');
        tr.className = "border-b border-gray-800/50 hover:bg-gray-800/70 transition-colors cursor-pointer relative group";
        tr.title = `Click to view rank in ${sub.name}`;
        
        let totalColor = "text-white font-medium";
        if(parseInt(sub.total) >= 90) totalColor = "text-brand-accent1 font-bold";
        if(parseInt(sub.total) < 33 || sub.total.includes('RT')) totalColor = "text-red-400 font-bold";

        tr.innerHTML = `
            <td class="py-3 pr-4 group-hover:text-brand-accent1 transition-colors">${sub.name} <span class="text-xs text-gray-500 ml-1">(${sub.code})</span></td>
            <td class="py-3 text-center text-gray-400">${sub.theory}</td>
            <td class="py-3 text-center text-gray-400">${sub.prac}</td>
            <td class="py-3 text-center ${totalColor}">${sub.total}</td>
            <td class="py-3 text-right text-gray-300 font-semibold flex items-center justify-end gap-2">
                ${sub.grade} 
                <svg class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-brand-accent1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </td>
        `;

        tr.onclick = function() {
            let next = tr.nextElementSibling;
            if (next && next.classList.contains('rank-row')) {
                next.remove();
            } else {
                const allStudents = window.allStudentsData;
                let subjectStudents = allStudents
                    .filter(s => s.subjects[sub.name] !== undefined)
                    .map(s => ({ roll: s.roll, marks: s.subjects[sub.name] }))
                    .sort((a, b) => b.marks - a.marks);

                let rank = 1, prevMarks = -1;
                for(let i=0; i<subjectStudents.length; i++) {
                    if (subjectStudents[i].marks !== prevMarks && i !== 0) rank = i + 1;
                    prevMarks = subjectStudents[i].marks;
                    if(subjectStudents[i].roll === student.roll) break;
                }

                const detailTr = document.createElement('tr');
                detailTr.className = 'rank-row bg-gray-800/30 border-b border-brand-accent1/30 animate-fade-up shadow-inner';
                detailTr.innerHTML = `
                    <td colspan="5" class="py-3 px-4 text-sm text-center text-gray-300">
                        Class Rank in ${sub.name}: <span class="font-bold text-lg text-brand-accent1 mx-1">#${rank}</span> <span class="text-xs text-gray-500">out of ${subjectStudents.length}</span>
                    </td>
                `;
                tr.after(detailTr);
            }
        };

        tbody.appendChild(tr);
    });

    openModal('studentModal');
}

// --- SUBJECT LEADERBOARD MODAL ---
function showSubjectModal(subjectName) {
    const allStudents = window.allStudentsData;
    document.getElementById('modalSubjectTitle').textContent = subjectName;

    let subjectStudents = allStudents
        .filter(s => s.subjects[subjectName] !== undefined)
        .map(s => ({ name: s.name, roll: s.roll, marks: s.subjects[subjectName] }))
        .sort((a, b) => b.marks - a.marks);

    const tbody = document.getElementById('modalSubjectLeaderboardTable');
    tbody.innerHTML = '';
    let prevMarks = -1, displayRank = 1;

    subjectStudents.forEach((student, index) => {
        if (student.marks !== prevMarks && index !== 0) displayRank = index + 1;
        prevMarks = student.marks;

        const tr = document.createElement('tr');
        tr.className = "border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors cursor-pointer group";
        tr.onclick = () => { closeModal('subjectModal'); setTimeout(() => showStudentModal(student.roll), 300); };

        let markColor = "text-white font-medium";
        if(student.marks >= 90) markColor = "text-brand-accent1 font-bold group-hover:scale-110 origin-right transition-transform";
        else if(student.marks < 33) markColor = "text-red-400 font-bold";

        tr.innerHTML = `
            <td class="py-4 px-6 text-gray-400 group-hover:text-white transition-colors">${displayRank}</td>
            <td class="py-4 px-6 font-medium text-white group-hover:text-brand-accent1 transition-colors">${student.name}</td>
            <td class="py-4 px-6 text-center text-gray-400 group-hover:text-gray-200 transition-colors">${student.roll}</td>
            <td class="py-4 px-6 text-right ${markColor}">${student.marks}</td>
        `;
        tbody.appendChild(tr);
    });

    openModal('subjectModal');
}

// --- STREAM LEADERBOARD MODAL ---
function showStreamModal(streamName) {
    const allStudents = window.allStudentsData;
    document.getElementById('modalStreamTitle').textContent = streamName;

    let streamStudents = allStudents
        .filter(s => s.stream === streamName)
        .sort((a, b) => b.percentage - a.percentage);

    const tbody = document.getElementById('modalStreamLeaderboardTable');
    tbody.innerHTML = '';
    let prevPercentage = -1, displayRank = 1;

    streamStudents.forEach((student, index) => {
        if (student.percentage !== prevPercentage && index !== 0) displayRank = index + 1;
        prevPercentage = student.percentage;

        const tr = document.createElement('tr');
        tr.className = "border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors cursor-pointer group";
        tr.onclick = () => { closeModal('streamModal'); setTimeout(() => showStudentModal(student.roll), 300); };

        let markColor = "text-gray-300 font-medium";
        if(student.percentage >= 90) markColor = "text-brand-accent1 font-bold";
        else if(student.percentage >= 75) markColor = "text-brand-accent3 font-bold";
        else if(student.percentage < 50) markColor = "text-red-400 font-bold";

        tr.innerHTML = `
            <td class="py-4 px-6 text-gray-400 group-hover:text-white transition-colors">${displayRank}</td>
            <td class="py-4 px-6 font-medium text-white group-hover:text-brand-accent3 transition-colors">${student.name}</td>
            <td class="py-4 px-6 text-center text-gray-400 group-hover:text-gray-200 transition-colors">${student.roll}</td>
            <td class="py-4 px-6 text-right ${markColor}">${student.percentage}%</td>
        `;
        tbody.appendChild(tr);
    });

    openModal('streamModal');
}

// --- MASTER LIST MODAL LOGIC ---
function openMasterListModal() {
    openModal('masterListModal');
    renderMasterTable();
}

function initMasterListControls() {
    // Populate Subjects Filter & Sort & Display Fields
    const filterSubj = document.getElementById('filterSubject');
    const sortField = document.getElementById('sortField');
    const fieldsContainer = document.getElementById('fieldsContainer');

    window.allSubjectsList.forEach(sub => {
        // Add to filter
        filterSubj.insertAdjacentHTML('beforeend', `<option value="${sub}">${sub}</option>`);
        // Add to sort
        sortField.insertAdjacentHTML('beforeend', `<option value="SUB_${sub}">Mark: ${sub}</option>`);
        
        // Add to Display Fields
        const lbl = document.createElement('label');
        lbl.className = "flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white";
        lbl.innerHTML = `<input type="checkbox" id="chk_SUB_${sub}" onchange="renderMasterTable()" class="rounded bg-gray-800 border-gray-600 text-brand-accent3 focus:ring-brand-accent3"> Mark: ${sub}`;
        fieldsContainer.appendChild(lbl);
    });
}

function renderMasterTable() {
    // Get filter states
    const stream = document.getElementById('filterStream').value;
    const gender = document.getElementById('filterGender').value;
    const minP = parseFloat(document.getElementById('filterMinP').value) || 0;
    const maxP = parseFloat(document.getElementById('filterMaxP').value) || 100;
    const subject = document.getElementById('filterSubject').value;

    // Get sort states
    const sortF = document.getElementById('sortField').value;
    const sortDir = document.getElementById('sortDir').value;

    // Get Field states
    const showGender = document.getElementById('chkGender').checked;
    const showStream = document.getElementById('chkStream').checked;
    const showMother = document.getElementById('chkMother').checked;
    const showFather = document.getElementById('chkFather').checked;
    const showTop5 = document.getElementById('chkTop5').checked;
    const showMain5 = document.getElementById('chkMain5').checked;
    const showAll6 = document.getElementById('chkAll6').checked;
    
    let displaySubjects = [];
    window.allSubjectsList.forEach(sub => {
        if(document.getElementById(`chk_SUB_${sub}`).checked) displaySubjects.push(sub);
    });

    // Filtering
    let filtered = window.allStudentsData.filter(s => {
        let match = true;
        if (stream !== 'ALL' && s.stream !== stream) match = false;
        if (gender !== 'ALL' && s.gender !== gender) match = false;
        if (s.percentage < minP || s.percentage > maxP) match = false;
        if (subject !== 'ALL' && s.subjects[subject] === undefined) match = false;
        return match;
    });

    // Sorting
    filtered.sort((a, b) => {
        let valA, valB;
        if (sortF === 'name') { valA = a.name; valB = b.name; }
        else if (sortF === 'roll') { valA = parseInt(a.roll); valB = parseInt(b.roll); }
        else if (sortF === 'top5') { valA = a.top5Percentage; valB = b.top5Percentage; }
        else if (sortF === 'main5') { valA = a.main5Percentage; valB = b.main5Percentage; }
        else if (sortF === 'all6') { valA = a.all6Percentage; valB = b.all6Percentage; }
        else if (sortF.startsWith('SUB_')) {
            let sub = sortF.replace('SUB_', '');
            valA = a.subjects[sub] || -1; // -1 for not opted
            valB = b.subjects[sub] || -1;
        }

        if (typeof valA === 'string') {
            return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
            return sortDir === 'asc' ? valA - valB : valB - valA;
        }
    });

    // Rendering Header
    let theadHTML = `<tr>
        <th class="py-4 px-6 font-semibold">Sr No</th>
        <th class="py-4 px-6 font-semibold">Roll No</th>
        <th class="py-4 px-6 font-semibold">Name</th>`;
    if(showGender) theadHTML += `<th class="py-4 px-6 font-semibold">Gender</th>`;
    if(showStream) theadHTML += `<th class="py-4 px-6 font-semibold">Stream</th>`;
    if(showMother) theadHTML += `<th class="py-4 px-6 font-semibold">Mother's Name</th>`;
    if(showFather) theadHTML += `<th class="py-4 px-6 font-semibold">Father's Name</th>`;
    if(showTop5) theadHTML += `<th class="py-4 px-6 font-semibold text-right">% (Top 5)</th>`;
    if(showMain5) theadHTML += `<th class="py-4 px-6 font-semibold text-right">% (Main 5)</th>`;
    if(showAll6) theadHTML += `<th class="py-4 px-6 font-semibold text-right">% (All 6)</th>`;
    
    displaySubjects.forEach(sub => {
        theadHTML += `<th class="py-4 px-6 font-semibold text-right">${sub.substring(0,6)}...</th>`;
    });
    theadHTML += `</tr>`;
    document.getElementById('masterTableHeader').innerHTML = theadHTML;

    // Rendering Body
    let tbodyHTML = '';
    filtered.forEach((s, index) => {
        let row = `<tr class="hover:bg-gray-800/80 cursor-pointer transition-colors" onclick="showStudentModal('${s.roll}')">
            <td class="py-3 px-6 text-gray-500 font-bold">${index + 1}</td>
            <td class="py-3 px-6 text-gray-400">${s.roll}</td>
            <td class="py-3 px-6 text-white font-medium">${s.name}</td>`;
        if(showGender) row += `<td class="py-3 px-6 text-gray-400">${s.gender || '-'}</td>`;
        if(showStream) row += `<td class="py-3 px-6 text-gray-400">${s.stream}</td>`;
        if(showMother) row += `<td class="py-3 px-6 text-gray-500 text-xs">${s.motherName}</td>`;
        if(showFather) row += `<td class="py-3 px-6 text-gray-500 text-xs">${s.fatherName}</td>`;
        
        if(showTop5) row += `<td class="py-3 px-6 text-brand-accent1 font-bold text-right">${s.top5Percentage}%</td>`;
        if(showMain5) row += `<td class="py-3 px-6 text-brand-accent2 font-bold text-right">${s.main5Percentage}%</td>`;
        if(showAll6) row += `<td class="py-3 px-6 text-brand-accent3 font-bold text-right">${s.all6Percentage}%</td>`;

        displaySubjects.forEach(sub => {
            let mark = s.subjects[sub];
            row += `<td class="py-3 px-6 text-gray-300 text-right">${mark !== undefined ? mark : '-'}</td>`;
        });
        row += `</tr>`;
        tbodyHTML += row;
    });
    
    document.getElementById('masterTableBody').innerHTML = tbodyHTML;
    document.getElementById('masterShowingCount').textContent = `Showing ${filtered.length} / ${window.allStudentsData.length} students`;
    
    if(filtered.length === 0) {
        document.getElementById('masterNoResults').classList.remove('hidden');
    } else {
        document.getElementById('masterNoResults').classList.add('hidden');
    }
}

// --- 2. DATA PARSING ENGINE ---
function parseData(rawText) {
    const lines = rawText.split('\n');
    const students = [];
    let currentStudent = null;

    lines.forEach(line => {
        line = line.trim();
        if (!line) return;

        if (line.startsWith('"Roll No:"')) {
            // Push the previous student if it exists before starting a new one
            if (currentStudent) students.push(currentStudent);
            
            let rollMatch = line.match(/"Roll No:","(\d+)"/);
            currentStudent = { 
                roll: rollMatch ? rollMatch[1] : 'Unknown', 
                subjects: {},
                subjectDetails: [],
                name: '',
                gender: 'N/A',
                motherName: 'Not Provided',
                fatherName: 'Not Provided',
                result: 'Unknown'
            };
        } else if (line.startsWith('"Candidate Name:')) {
            let nameMatch = line.match(/"Candidate Name:","([^"]+)"/);
            if (nameMatch) {
                let nameParts = nameMatch[1].replace(/([a-z])([A-Z])/g, '$1 $2').trim();
                let words = nameParts.split(/\s+/);
                // Fix for concatenated duplicate names (e.g. GARIMA JOSHI I)
                if(words.length > 3) {
                     currentStudent.name = words.slice(0, Math.ceil(words.length/2)).join(' '); 
                } else {
                     currentStudent.name = nameParts;
                }
            }
        } else if (line.startsWith('"Gender:"')) {
            let genderMatch = line.match(/"Gender:","([^"]+)"/);
            if (genderMatch) currentStudent.gender = genderMatch[1];
        } else if (line.startsWith('"Mother\'s Name:"')) {
            let motherMatch = line.match(/"Mother's Name:","([^"]+)"/);
            if (motherMatch) currentStudent.motherName = motherMatch[1];
        } else if (line.startsWith('"Father\'s Name:"')) {
            let fatherMatch = line.match(/"Father's Name:","([^"]+)"/);
            if (fatherMatch) currentStudent.fatherName = fatherMatch[1];
        } else if (line.startsWith('"Result:')) {
            let resMatch = line.match(/"Result:\s*([A-Z]+)"/);
            if (resMatch) currentStudent.result = resMatch[1];
        } else {
            // Parse subjects
            let parts = line.split('","').map(p => p.replace(/"/g, '').trim());
            if (parts.length >= 5) {
                let code = parts[0];
                let name = parts[1];
                let theory = parts[2] || "-";
                let prac = parts[3] || "-";
                let totalStr = parts[4];
                let grade = parts[5] || "-";
                
                let totalNumeric = parseInt(totalStr.replace('RT', '').trim(), 10);
                
                // Ignore general grading subjects in percentage calculation
                if (!['500', '502', '503'].includes(code)) {
                    currentStudent.subjectDetails.push({ code, name, theory, prac, total: totalStr, grade });
                    if (!isNaN(totalNumeric)) {
                        currentStudent.subjects[name] = totalNumeric;
                        
                        // Maintain global subjects list for filters (if used)
                        if (window.allSubjectsList && !window.allSubjectsList.includes(name)) {
                            window.allSubjectsList.push(name);
                        }
                    }
                }
            }
        }
    });
    
    // Push the very last student to the array
    if (currentStudent) students.push(currentStudent);
    
    return processAnalytics(students);
}

// --- 3. ANALYTICS ENGINE ---
function processAnalytics(students) {
    let totalStudents = students.length;
    let streamStats = { PCM: [], PCB: [], Commerce: [] };
    let subjectStats = {};
    let genderStats = { 
        M: { count: 0, totalP: 0, highest: 0, above90: 0, above75: 0, topName: '', students: [] }, 
        F: { count: 0, totalP: 0, highest: 0, above90: 0, above75: 0, topName: '', students: [] } 
    };
    
    students.forEach(s => {
        let marks = Object.values(s.subjects);
        let sortedMarks = [...marks].sort((a, b) => b - a);
        
        // Top 5 Calculation
        let top5 = sortedMarks.slice(0, 5);
        s.top5Marks = top5.reduce((sum, val) => sum + val, 0);
        s.top5Percentage = parseFloat((s.top5Marks / 5).toFixed(2));
        
        // Main 5 Calculation (First 5 subjects chronologically in the list)
        let main5 = s.subjectDetails.slice(0, 5).map(sub => parseInt(sub.total.replace('RT','')) || 0);
        s.main5Percentage = parseFloat((main5.reduce((sum, val) => sum + val, 0) / 5).toFixed(2));

        // All Subjects Calculation
        let all6Marks = marks.reduce((sum, val) => sum + val, 0);
        s.all6Percentage = parseFloat((all6Marks / (marks.length || 1)).toFixed(2));

        // Legacy reference points to top 5
        s.percentage = s.top5Percentage; 
        s.totalMarks = s.top5Marks;

        if (s.subjects['ACCOUNTANCY']) s.stream = 'Commerce';
        else if (s.subjects['BIOLOGY']) s.stream = 'PCB';
        else if (s.subjects['MATHEMATICS']) s.stream = 'PCM';
        else s.stream = 'Other';

        if(streamStats[s.stream]) streamStats[s.stream].push(s);

        // Subject Stats
        for (let [sub, mark] of Object.entries(s.subjects)) {
            if (!subjectStats[sub]) {
                subjectStats[sub] = { name: sub, marks: [], highest: 0, lowest: 100, above90: 0, above75: 0, fails: 0 };
            }
            subjectStats[sub].marks.push(mark);
            if (mark > subjectStats[sub].highest) subjectStats[sub].highest = mark;
            if (mark < subjectStats[sub].lowest) subjectStats[sub].lowest = mark;
            if (mark >= 90) subjectStats[sub].above90++;
            if (mark >= 75) subjectStats[sub].above75++;
            if (mark < 33) subjectStats[sub].fails++;
        }

        // Gender Stats
        if (s.gender === 'M' || s.gender === 'F') {
            let g = genderStats[s.gender];
            g.count++;
            g.totalP += s.percentage;
            g.students.push(s);
            if (s.percentage > g.highest) {
                g.highest = s.percentage;
                g.topName = s.name;
            }
            if (s.percentage >= 90) g.above90++;
            if (s.percentage >= 75) g.above75++;
        }

        window.studentDirectory[s.roll] = s;
    });

    students.sort((a, b) => b.percentage - a.percentage);
    window.allStudentsData = students;
    window.allSubjectsList.sort();

    let allPercentages = students.map(s => s.percentage);
    let avgPercentage = (allPercentages.reduce((a, b) => a + b, 0) / (totalStudents || 1)).toFixed(2);
    let highestPercentage = allPercentages.length > 0 ? Math.max(...allPercentages) : 0;
    let lowestPercentage = allPercentages.length > 0 ? Math.min(...allPercentages) : 0;
    let medianPercentage = allPercentages.length > 0 ? allPercentages[Math.floor(totalStudents / 2)] : 0;
    
    let above90 = students.filter(s => s.percentage >= 90).length;
    let above80 = students.filter(s => s.percentage >= 80).length;
    let below50 = students.filter(s => s.percentage < 50).length;

    for (let sub in subjectStats) {
        let s = subjectStats[sub];
        s.average = (s.marks.reduce((a,b)=>a+b,0) / s.marks.length).toFixed(2);
        s.topStudents = students.filter(st => st.subjects[sub] === s.highest).map(st => st.name);
    }

    for (let stream in streamStats) {
        let st = streamStats[stream];
        if (st.length > 0) {
            let avgs = st.map(s => s.percentage);
            st.avg = (avgs.reduce((a,b)=>a+b,0)/avgs.length).toFixed(2);
            st.highest = Math.max(...avgs);
        } else {
            st.avg = 0; st.highest = 0;
        }
    }

    if (genderStats.M.count > 0) genderStats.M.avg = (genderStats.M.totalP / genderStats.M.count).toFixed(2);
    if (genderStats.F.count > 0) genderStats.F.avg = (genderStats.F.totalP / genderStats.F.count).toFixed(2);

    return {
        students, totalStudents, avgPercentage, highestPercentage, lowestPercentage, medianPercentage,
        above90, above80, below50, streamStats, subjectStats, genderStats
    };
}

// --- 4. UI RENDERING ENGINE ---
function renderUI(data) {
    const app = document.getElementById('app-content');
    
    app.innerHTML = `
        ${renderCover(data)}
        ${renderOverview(data)}
        ${renderToppers(data)}
        ${renderSubjects(data)}
        ${renderStreams(data)}
        ${renderGenderAnalysis(data)}
        ${renderDistribution(data)}
        ${renderInsights(data)}
        ${renderFooter()}
    `;

    initCharts(data);
    initMasterListControls(); // Init the modal forms
}

function renderCover(data) {
    return `
    <section id="cover" class="min-h-screen flex flex-col items-center justify-center relative pt-16">
        <div class="text-center animate-fade-up z-10 px-4">
            <h2 class="text-xl md:text-2xl font-medium tracking-[0.2em] text-brand-accent2 mb-4">PM SHRI SCHOOL JNV CHAMPAWAT</h2>
            <h1 class="text-5xl md:text-7xl font-display font-extrabold text-white mb-6 leading-tight">
                CBSE PERFORMANCE <br/>
                <span class="text-gradient">BATCH REPORT</span>
            </h1>
            <p class="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">Comprehensive Class XII Analytics & Student Performance Evaluation for the Academic Year 2026.</p>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
                <div class="glass-card p-6 rounded-2xl glow-border cursor-pointer transform hover:-translate-y-1 transition-all group relative overflow-hidden" onclick="openMasterListModal()">
                    <div class="absolute inset-0 bg-brand-accent1/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div class="text-sm text-gray-400 mb-1 flex items-center justify-center gap-2">Total Students <svg class="w-4 h-4 text-brand-accent1 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg></div>
                    <div class="text-3xl font-bold text-white group-hover:text-brand-accent1 transition-colors">${data.totalStudents}</div>
                    <div class="text-[10px] text-brand-accent1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest font-bold">Open Directory</div>
                </div>
                <div class="glass-card p-6 rounded-2xl glow-border">
                    <div class="text-sm text-gray-400 mb-1">Highest Score</div>
                    <div class="text-3xl font-bold text-brand-accent1">${data.highestPercentage}%</div>
                </div>
                <div class="glass-card p-6 rounded-2xl glow-border">
                    <div class="text-sm text-gray-400 mb-1">Class Average</div>
                    <div class="text-3xl font-bold text-brand-accent3">${data.avgPercentage}%</div>
                </div>
                <div class="glass-card p-6 rounded-2xl glow-border">
                    <div class="text-sm text-gray-400 mb-1">90%+ Achievers</div>
                    <div class="text-3xl font-bold text-brand-accent2">${data.above90}</div>
                </div>
            </div>
        </div>
    </section>`;
}

function renderOverview(data) {
    return `
    <section id="overview" class="py-20 px-4 md:px-8 max-w-7xl mx-auto border-t border-brand-border">
        <h2 class="text-3xl font-display font-bold mb-10 flex items-center gap-3">
            <span class="w-8 h-1 bg-brand-accent1 rounded-full"></span> Batch Overview
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div class="glass-card p-8 rounded-2xl md:col-span-2">
                <h3 class="text-xl font-semibold mb-6">Performance Distribution</h3>
                <div class="h-64 relative">
                    <canvas id="performanceChart"></canvas>
                </div>
            </div>
            <div class="flex flex-col gap-6">
                <div class="glass-card p-6 rounded-2xl glow-border-purple flex-1 flex flex-col justify-center">
                    <h4 class="text-gray-400 text-sm font-medium">Median Percentage</h4>
                    <div class="text-4xl font-bold text-white mt-2">${data.medianPercentage}%</div>
                </div>
                <div class="glass-card p-6 rounded-2xl glow-border flex-1 flex flex-col justify-center">
                    <h4 class="text-gray-400 text-sm font-medium">Students Above 80%</h4>
                    <div class="text-4xl font-bold text-white mt-2">${data.above80} <span class="text-lg text-gray-500 font-normal">/ ${data.totalStudents}</span></div>
                </div>
                <div class="glass-card p-6 rounded-2xl border border-red-500/30 flex-1 flex flex-col justify-center">
                    <h4 class="text-gray-400 text-sm font-medium">Students Below 50%</h4>
                    <div class="text-4xl font-bold text-white mt-2">${data.below50}</div>
                </div>
            </div>
        </div>
    </section>`;
}

function renderToppers(data) {
    const top3 = data.students.slice(0, 3);

    let top3HTML = top3.map((s, i) => {
        const colors = ['border-yellow-400 shadow-yellow-400/20', 'border-gray-300 shadow-gray-300/20', 'border-amber-600 shadow-amber-600/20'];
        const textColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];
        return `
        <div class="glass-card rounded-2xl p-6 border ${colors[i]} transform hover:-translate-y-2 transition-transform duration-300 flex flex-col items-center text-center relative overflow-hidden cursor-pointer group" onclick="showStudentModal('${s.roll}')" title="Click to view full result">
            <div class="absolute -top-10 -right-10 w-24 h-24 bg-white opacity-5 rounded-full blur-xl group-hover:bg-brand-accent1 transition-colors"></div>
            <div class="text-5xl font-display font-black ${textColors[i]} mb-2">#${i+1}</div>
            <h3 class="text-xl font-bold text-white mb-1 uppercase tracking-wide group-hover:text-brand-accent1 transition-colors">${s.name}</h3>
            <p class="text-sm text-gray-400 mb-4">Roll: ${s.roll} ?? ${s.stream}</p>
            <div class="text-3xl font-bold text-brand-accent1">${s.percentage}%</div>
            <div class="text-sm text-gray-500 mt-1">${s.totalMarks} / 500 Marks</div>
            <div class="absolute bottom-2 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-brand-accent1 flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg> View</div>
        </div>
        `;
    }).join('');

    let tableHTML = data.students.slice(0, 15).map((s, i) => `
        <tr class="border-b border-gray-800 hover:bg-gray-800/80 transition-colors cursor-pointer group" onclick="showStudentModal('${s.roll}')" title="Click to view full result">
            <td class="py-4 px-6 text-gray-400 group-hover:text-white">${i+1}</td>
            <td class="py-4 px-6 font-medium text-white group-hover:text-brand-accent1">${s.name}</td>
            <td class="py-4 px-6 text-gray-400 group-hover:text-white">${s.roll}</td>
            <td class="py-4 px-6 text-gray-400 group-hover:text-white">${s.stream}</td>
            <td class="py-4 px-6 font-bold flex justify-between items-center ${s.percentage >= 90 ? 'text-brand-accent1' : (s.percentage >= 75 ? 'text-brand-accent3' : 'text-gray-200')}">
                <span>${s.percentage}%</span>
                <svg class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </td>
        </tr>
    `).join('');

    let subjToppersHTML = Object.values(data.subjectStats).map(s => `
        <div class="glass-card p-4 rounded-xl flex justify-between items-center hover:bg-gray-800/50 transition-colors cursor-pointer group border border-transparent hover:border-brand-accent2/30" onclick="showSubjectModal('${s.name}')" title="Click to view full subject leaderboard">
            <div>
                <div class="text-xs text-brand-accent2 font-bold tracking-wider uppercase mb-1 flex items-center gap-2">
                    ${s.name}
                    <svg class="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </div>
                <div class="text-white font-medium truncate max-w-[300px] group-hover:text-brand-accent1 transition-colors" title="${s.topStudents.join(', ')}">${s.topStudents.join(', ')}</div>
            </div>
            <div class="text-2xl font-bold text-brand-accent1 group-hover:scale-110 transition-transform origin-right">${s.highest}</div>
        </div>
    `).join('');

    return `
    <section id="toppers" class="py-20 px-4 md:px-8 max-w-7xl mx-auto border-t border-brand-border">
        <h2 class="text-3xl font-display font-bold mb-10 flex items-center gap-3">
            <span class="w-8 h-1 bg-brand-accent2 rounded-full"></span> Hall of Fame
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            ${top3HTML}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div class="lg:col-span-2">
                <div class="flex justify-between items-end mb-6 flex-wrap gap-4">
                    <div class="flex items-center gap-3">
                        <h3 class="text-xl font-semibold flex items-center gap-2"><svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg> Top 15 Students</h3>
                        
                        <div class="relative flex items-center ml-2">
                            <button onclick="toggleTopStudentSearch()" class="text-gray-400 hover:text-brand-accent1 transition-colors p-1.5 rounded-full hover:bg-gray-800" title="Search Student">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </button>
                            <input type="text" id="topStudentSearchInput" oninput="filterTopStudents()" placeholder="Search name or roll no..." class="hidden absolute left-9 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-brand-accent1 transition-all w-48 sm:w-64 opacity-0 shadow-lg z-20">
                        </div>
                    </div>
                    
                    <button onclick="openMasterListModal()" class="text-xs text-brand-accent1 hover:text-white transition-colors border border-brand-accent1/50 rounded-full px-3 py-1 shrink-0">View All Students →</button>
                </div>
                <div class="glass-card rounded-2xl overflow-hidden">
                    <div class="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
                        <table class="w-full text-left text-sm">
                            <thead class="bg-gray-900/90 sticky top-0 backdrop-blur-md z-10 shadow-sm shadow-gray-900">
                                <tr>
                                    <th class="py-4 px-6 font-semibold text-gray-300">Rank</th>
                                    <th class="py-4 px-6 font-semibold text-gray-300">Name</th>
                                    <th class="py-4 px-6 font-semibold text-gray-300">Roll No</th>
                                    <th class="py-4 px-6 font-semibold text-gray-300">Stream</th>
                                    <th class="py-4 px-6 font-semibold text-gray-300">Percentage</th>
                                </tr>
                            </thead>
                            <tbody id="topStudentsTableBody">
                                ${tableHTML}
                            </tbody>

                        </table>
                    </div>
                </div>
            </div>
            <div>
                <h3 class="text-xl font-semibold mb-6 flex items-center gap-2"><svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg> Subject Toppers</h3>
                <div class="flex flex-col gap-3">
                    ${subjToppersHTML}
                </div>
            </div>
        </div>
    </section>`;
}

function renderSubjects(data) {
    let subjectCards = Object.values(data.subjectStats).map(s => {
        let rtCount = 0;
        data.students.forEach(student => {
            let subjectDetail = student.subjectDetails.find(detail => detail.name === s.name);
            if (subjectDetail && typeof subjectDetail.total === 'string' && subjectDetail.total.includes('RT')) {
                rtCount++;
            }
        });
        
        let rtRate = ((rtCount / s.marks.length) * 100).toFixed(1);

        return `
        <div class="glass-card p-6 rounded-2xl glow-border hover:-translate-y-1 transition-transform">
            <h3 class="text-lg font-bold text-white mb-4 truncate">${s.name}</h3>
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <div class="text-xs text-gray-500 uppercase">Average</div>
                    <div class="text-xl font-semibold text-brand-accent3">${s.average}</div>
                </div>
                <div>
                    <div class="text-xs text-gray-500 uppercase">Highest</div>
                    <div class="text-xl font-semibold text-brand-accent1">${s.highest}</div>
                </div>
            </div>
            <div class="space-y-2 mt-4 pt-4 border-t border-gray-800">
                <div class="flex justify-between text-sm">
                    <span class="text-gray-400">Scores 90+</span>
                    <span class="text-white font-medium">${s.above90}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-400">Scores 75+</span>
                    <span class="text-white font-medium">${s.above75}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-400">Repeat Theory (RT)</span>
                    <span class="${rtCount > 0 ? 'text-red-400' : 'text-gray-400'} font-medium">${rtCount} (${rtRate}%)</span>
                </div>
            </div>
        </div>`;
    }).join('');

    return `
    <section id="subjects" class="py-20 px-4 md:px-8 max-w-7xl mx-auto border-t border-brand-border">
        <h2 class="text-3xl font-display font-bold mb-10 flex items-center gap-3">
            <span class="w-8 h-1 bg-brand-accent3 rounded-full"></span> Subject Analytics
        </h2>
        
        <div class="glass-card p-6 md:p-8 rounded-2xl mb-10">
            <div class="h-80 w-full relative">
                <canvas id="subjectAvgChart"></canvas>
            </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            ${subjectCards}
        </div>
    </section>`;
}


function renderStreams(data) {
    let cards = Object.keys(data.streamStats).filter(k => k !== 'Other').map(stream => {
        let s = data.streamStats[stream];
        if(s.length === 0) return '';
        return `
        <div class="glass-card p-8 rounded-2xl flex-1 border border-gray-700/50 hover:border-brand-accent3/50 transition-colors hover:shadow-lg hover:shadow-brand-accent3/10 cursor-pointer group relative" onclick="showStreamModal('${stream}')" title="Click to view full ${stream} leaderboard">
            <div class="flex justify-between items-start">
                <h3 class="text-2xl font-bold text-white mb-2 group-hover:text-brand-accent3 transition-colors">${stream}</h3>
                <svg class="w-5 h-5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </div>
            <p class="text-gray-400 text-sm mb-6">${s.length} Students Enrolled</p>
            <div class="space-y-5">
                <div>
                    <div class="flex justify-between text-sm mb-1">
                        <span class="text-gray-400">Average Performance</span>
                        <span class="font-bold text-brand-accent3">${s.avg}%</span>
                    </div>
                    <div class="w-full bg-gray-800 rounded-full h-2">
                        <div class="bg-brand-accent3 h-2 rounded-full" style="width: ${s.avg}%"></div>
                    </div>
                </div>
                <div>
                    <div class="flex justify-between text-sm mb-1">
                        <span class="text-gray-400">Top Benchmark</span>
                        <span class="font-bold text-brand-accent1">${s.highest}%</span>
                    </div>
                    <div class="w-full bg-gray-800 rounded-full h-2">
                        <div class="bg-brand-accent1 h-2 rounded-full" style="width: ${s.highest}%"></div>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');

    return `
    <section id="streams" class="py-20 px-4 md:px-8 max-w-7xl mx-auto border-t border-brand-border">
        <h2 class="text-3xl font-display font-bold mb-10 flex items-center gap-3">
            <span class="w-8 h-1 bg-brand-accent2 rounded-full"></span> Stream Comparison
        </h2>
        <div class="flex flex-col md:flex-row gap-6 mb-10">
            ${cards}
        </div>
        <div class="glass-card p-6 md:p-8 rounded-2xl">
            <div class="h-80 w-full relative">
                 <canvas id="streamChart"></canvas>
            </div>
        </div>
    </section>`;
}

function renderGenderAnalysis(data) {
    let mStats = data.genderStats.M;
    let fStats = data.genderStats.F;

    // Handle edge case if no gender data exists
    if (mStats.count === 0 && fStats.count === 0) return '';

    return `
    <section id="gender" class="py-20 px-4 md:px-8 max-w-7xl mx-auto border-t border-brand-border">
        <h2 class="text-3xl font-display font-bold mb-10 flex items-center gap-3">
            <span class="w-8 h-1 bg-brand-accent4 rounded-full"></span> Gender-wise Analysis
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div class="glass-card p-8 rounded-2xl border border-brand-accent4/20 relative overflow-hidden group">
                <div class="absolute -right-10 -bottom-10 opacity-5 w-40 h-40 group-hover:scale-110 transition-transform">
                    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a6 6 0 00-6 6c0 3.1 2.33 5.66 5.33 5.96V17H9v2h2.33v3h1.34v-3H15v-2h-2.33v-3.04C15.67 13.66 18 11.1 18 8a6 6 0 00-6-6zm0 10a4 4 0 110-8 4 4 0 010 8z"/></svg>
                </div>
                <h3 class="text-2xl font-bold text-white mb-6 uppercase tracking-widest text-gradient-rose">Female Students</h3>
                <div class="grid grid-cols-2 gap-6 mb-6">
                    <div>
                        <div class="text-xs text-gray-400 uppercase mb-1">Total Enrolled</div>
                        <div class="text-3xl font-bold text-white">${fStats.count}</div>
                    </div>
                    <div>
                        <div class="text-xs text-gray-400 uppercase mb-1">Group Average</div>
                        <div class="text-3xl font-bold text-brand-accent4">${fStats.avg || 0}%</div>
                    </div>
                    <div>
                        <div class="text-xs text-gray-400 uppercase mb-1">Highest Score</div>
                        <div class="text-2xl font-bold text-white">${fStats.highest || 0}%</div>
                        <div class="text-xs text-gray-500 mt-1 truncate" title="${fStats.topName}">${fStats.topName || '-'}</div>
                    </div>
                    <div>
                        <div class="text-xs text-gray-400 uppercase mb-1">Distinctions (75%+)</div>
                        <div class="text-2xl font-bold text-white">${fStats.above75} <span class="text-sm font-normal text-gray-500">students</span></div>
                    </div>
                </div>
            </div>

            <div class="glass-card p-8 rounded-2xl border border-brand-accent1/20 relative overflow-hidden group">
                <div class="absolute -right-10 -bottom-10 opacity-5 w-40 h-40 group-hover:scale-110 transition-transform">
                    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M15 2h6v6h-2V4.41l-4.24 4.25a7.996 7.996 0 10-1.42 1.42L17.59 4H15V2zm-5 18a6 6 0 110-12 6 6 0 010 12z"/></svg>
                </div>
                <h3 class="text-2xl font-bold text-white mb-6 uppercase tracking-widest text-gradient">Male Students</h3>
                <div class="grid grid-cols-2 gap-6 mb-6">
                    <div>
                        <div class="text-xs text-gray-400 uppercase mb-1">Total Enrolled</div>
                        <div class="text-3xl font-bold text-white">${mStats.count}</div>
                    </div>
                    <div>
                        <div class="text-xs text-gray-400 uppercase mb-1">Group Average</div>
                        <div class="text-3xl font-bold text-brand-accent1">${mStats.avg || 0}%</div>
                    </div>
                    <div>
                        <div class="text-xs text-gray-400 uppercase mb-1">Highest Score</div>
                        <div class="text-2xl font-bold text-white">${mStats.highest || 0}%</div>
                        <div class="text-xs text-gray-500 mt-1 truncate" title="${mStats.topName}">${mStats.topName || '-'}</div>
                    </div>
                    <div>
                        <div class="text-xs text-gray-400 uppercase mb-1">Distinctions (75%+)</div>
                        <div class="text-2xl font-bold text-white">${mStats.above75} <span class="text-sm font-normal text-gray-500">students</span></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="glass-card p-6 md:p-8 rounded-2xl flex flex-col md:flex-row gap-8 items-center">
            <div class="w-full md:w-1/3 h-64 relative">
                <canvas id="genderPieChart"></canvas>
            </div>
            <div class="w-full md:w-2/3">
                <h4 class="text-lg font-semibold text-white mb-4">Performance Spread</h4>
                <div class="space-y-6">
                    <div>
                        <div class="flex justify-between text-sm mb-2">
                            <span class="text-gray-400">90%+ Achievers (Female vs Male)</span>
                            <span class="text-white">${fStats.above90} vs ${mStats.above90}</span>
                        </div>
                        <div class="flex w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                            <div class="bg-brand-accent4" style="width: ${fStats.above90 + mStats.above90 > 0 ? (fStats.above90/(fStats.above90+mStats.above90))*100 : 0}%"></div>
                            <div class="bg-brand-accent1" style="width: ${fStats.above90 + mStats.above90 > 0 ? (mStats.above90/(fStats.above90+mStats.above90))*100 : 0}%"></div>
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between text-sm mb-2">
                            <span class="text-gray-400">Distinctions [75%+] (Female vs Male)</span>
                            <span class="text-white">${fStats.above75} vs ${mStats.above75}</span>
                        </div>
                        <div class="flex w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                            <div class="bg-brand-accent4" style="width: ${fStats.above75 + mStats.above75 > 0 ? (fStats.above75/(fStats.above75+mStats.above75))*100 : 0}%"></div>
                            <div class="bg-brand-accent1" style="width: ${fStats.above75 + mStats.above75 > 0 ? (mStats.above75/(fStats.above75+mStats.above75))*100 : 0}%"></div>
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between text-sm mb-2">
                            <span class="text-gray-400">Overall Enrollment (Female vs Male)</span>
                            <span class="text-white">${fStats.count} vs ${mStats.count}</span>
                        </div>
                        <div class="flex w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                            <div class="bg-brand-accent4" style="width: ${fStats.count + mStats.count > 0 ? (fStats.count/(fStats.count+mStats.count))*100 : 0}%"></div>
                            <div class="bg-brand-accent1" style="width: ${fStats.count + mStats.count > 0 ? (mStats.count/(fStats.count+mStats.count))*100 : 0}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>`;
}

function renderDistribution(data) {
    return `
    <section class="py-20 px-4 md:px-8 max-w-7xl mx-auto border-t border-brand-border">
        <h2 class="text-3xl font-display font-bold mb-10 flex items-center gap-3">
            <span class="w-8 h-1 bg-brand-accent1 rounded-full"></span> Grade Distribution Matrix
        </h2>
        <div class="glass-card p-6 md:p-8 rounded-2xl">
            <div class="h-96 w-full relative">
                <canvas id="distChart"></canvas>
            </div>
        </div>
    </section>`;
}

function renderInsights(data) {
    let subjectAvgs = Object.values(data.subjectStats).sort((a,b) => b.average - a.average);
    let strongestSub = subjectAvgs.length > 0 ? subjectAvgs[0].name : 'N/A';
    let weakestSub = subjectAvgs.length > 0 ? subjectAvgs[subjectAvgs.length - 1].name : 'N/A';
    let strongestAvg = subjectAvgs.length > 0 ? subjectAvgs[0].average : 0;
    let weakestAvg = subjectAvgs.length > 0 ? subjectAvgs[subjectAvgs.length-1].average : 0;
    
    let streams = Object.entries(data.streamStats).filter(([k,v]) => k !== 'Other' && v.length > 0).sort((a,b) => b[1].avg - a[1].avg);
    let topStream = streams[0] ? streams[0][0] : 'N/A';

    let above90Percent = data.totalStudents > 0 ? ((data.above90/data.totalStudents)*100).toFixed(1) : 0;
    let medianDiffText = data.medianPercentage >= data.avgPercentage 
        ? 'top-heavy performance, meaning the majority of students are scoring above the mathematical mean.' 
        : 'wider spread of lower scores pulling the overall average down.';

    let below50Percent = data.totalStudents > 0 ? ((data.below50/data.totalStudents)*100).toFixed(1) : 0;
    let performanceSpread = (data.highestPercentage - data.lowestPercentage).toFixed(1);
    
    let mostFailsSub = Object.values(data.subjectStats).sort((a,b) => b.fails - a.fails)[0];
    let bottleneckSub = mostFailsSub && mostFailsSub.fails > 0 ? mostFailsSub.name : 'None';
    let bottleneckFails = mostFailsSub && mostFailsSub.fails > 0 ? mostFailsSub.fails : 0;

    let popStreams = Object.entries(data.streamStats).filter(([k,v]) => k !== 'Other').sort((a,b) => b[1].length - a[1].length);
    let mostPopStream = popStreams.length > 0 ? popStreams[0][0] : 'N/A';
    let mostPopCount = popStreams.length > 0 ? popStreams[0][1].length : 0;
    
    let above75 = data.students.filter(s => s.percentage >= 75).length;
    let above75Percent = data.totalStudents > 0 ? ((above75/data.totalStudents)*100).toFixed(1) : 0;

    let compStudents = data.students.filter(s => s.result === 'COMP').length;
    let rtInstances = 0;
    data.students.forEach(s => {
        s.subjectDetails.forEach(sub => {
            if (typeof sub.total === 'string' && sub.total.includes('RT')) {
                rtInstances++;
            }
        });
    });

    return `
    <section id="insights" class="py-20 px-4 md:px-8 max-w-7xl mx-auto border-t border-brand-border">
        <h2 class="text-3xl font-display font-bold mb-10 flex items-center gap-3">
            <span class="w-8 h-1 bg-brand-accent3 rounded-full"></span> AI Observations & Insights
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div class="glass-card p-6 rounded-2xl flex items-start gap-4 hover:bg-gray-800/40 transition-colors">
                <div class="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <span class="text-xl">📊</span>
                </div>
                <div>
                    <h4 class="text-lg font-bold text-white mb-2">Class Performance Base</h4>
                    <p class="text-gray-400 text-sm leading-relaxed">The class maintains a solid average of <span class="text-white font-medium">${data.avgPercentage}%</span>. ${data.above80} students (${data.totalStudents > 0 ? ((data.above80/data.totalStudents)*100).toFixed(1) : 0}%) have scored above 80%, indicating a strong top-tier performance cluster.</p>
                </div>
            </div>
            
            <div class="glass-card p-6 rounded-2xl flex items-start gap-4 hover:bg-gray-800/40 transition-colors">
                <div class="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                    <span class="text-xl">📈</span>
                </div>
                <div>
                    <h4 class="text-lg font-bold text-white mb-2">Subject Strengths</h4>
                    <p class="text-gray-400 text-sm leading-relaxed">The strongest subject overall is <span class="text-brand-accent3 font-medium">${strongestSub}</span> with a class average of ${strongestAvg}. Students have shown exceptional grasp in this area.</p>
                </div>
            </div>

            <div class="glass-card p-6 rounded-2xl flex items-start gap-4 hover:bg-gray-800/40 transition-colors">
                <div class="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                    <span class="text-xl">📉</span>
                </div>
                <div>
                    <h4 class="text-lg font-bold text-white mb-2">Areas for Improvement</h4>
                    <p class="text-gray-400 text-sm leading-relaxed">Students faced the most difficulty in <span class="text-orange-400 font-medium">${weakestSub}</span>, marking the lowest average at ${weakestAvg}. Dedicated remedial focus is recommended here.</p>
                </div>
            </div>

            <div class="glass-card p-6 rounded-2xl flex items-start gap-4 hover:bg-gray-800/40 transition-colors">
                <div class="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                    <span class="text-xl">💡</span>
                </div>
                <div>
                    <h4 class="text-lg font-bold text-white mb-2">Stream Dominance</h4>
                    <p class="text-gray-400 text-sm leading-relaxed">The <span class="text-brand-accent2 font-medium">${topStream}</span> stream leads the batch with the highest average performance. Healthy competition is observed across all academic tracks.</p>
                </div>
            </div>

            <div class="glass-card p-6 rounded-2xl flex items-start gap-4 hover:bg-gray-800/40 transition-colors">
                <div class="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                    <span class="text-xl">🌟</span>
                </div>
                <div>
                    <h4 class="text-lg font-bold text-white mb-2">Excellence Benchmark</h4>
                    <p class="text-gray-400 text-sm leading-relaxed"><span class="text-yellow-400 font-medium">${data.above90} students</span> (${above90Percent}%) secured 90% and above. This top percentile sets a high standard for academic excellence within the batch.</p>
                </div>
            </div>

            <div class="glass-card p-6 rounded-2xl flex items-start gap-4 hover:bg-gray-800/40 transition-colors">
                <div class="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0">
                    <span class="text-xl">⚖️</span>
                </div>
                <div>
                    <h4 class="text-lg font-bold text-white mb-2">Distribution Skew</h4>
                    <p class="text-gray-400 text-sm leading-relaxed">The median score is <span class="text-brand-accent1 font-medium">${data.medianPercentage}%</span>, compared to the average of ${data.avgPercentage}%. This indicates a ${medianDiffText}</p>
                </div>
            </div>

            <div class="glass-card p-6 rounded-2xl flex items-start gap-4 hover:bg-gray-800/40 transition-colors">
                <div class="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <span class="text-xl">🏅</span>
                </div>
                <div>
                    <h4 class="text-lg font-bold text-white mb-2">Distinction Rate</h4>
                    <p class="text-gray-400 text-sm leading-relaxed">A total of <span class="text-emerald-400 font-medium">${above75} students</span> (${above75Percent}%) achieved a distinction (75% or higher), highlighting a broadly successful academic delivery across the board.</p>
                </div>
            </div>

            <div class="glass-card p-6 rounded-2xl flex items-start gap-4 hover:bg-gray-800/40 transition-colors">
                <div class="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                    <span class="text-xl">⚠️</span>
                </div>
                <div>
                    <h4 class="text-lg font-bold text-white mb-2">Subject Bottlenecks</h4>
                    <p class="text-gray-400 text-sm leading-relaxed">${bottleneckFails > 0 ? `The subject <span class="text-red-400 font-medium">${bottleneckSub}</span> has the highest failure rate with ${bottleneckFails} students scoring below 33. This is the primary bottleneck for the batch's overall passing rate.` : `Excellent outcome: There are no significant subject bottlenecks, as passing rates are uniformly high across all subjects.`}</p>
                </div>
            </div>

            <div class="glass-card p-6 rounded-2xl flex items-start gap-4 hover:bg-gray-800/40 transition-colors">
                <div class="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <span class="text-xl">🔍</span>
                </div>
                <div>
                    <h4 class="text-lg font-bold text-white mb-2">Batch Variance</h4>
                    <p class="text-gray-400 text-sm leading-relaxed">The spread between the highest scorer (${data.highestPercentage}%) and the lowest scorer (${data.lowestPercentage}%) is <span class="text-indigo-400 font-medium">${performanceSpread}%</span>. A wide variance indicates a mixed-ability classroom requiring differentiated teaching strategies.</p>
                </div>
            </div>

            <div class="glass-card p-6 rounded-2xl flex items-start gap-4 hover:bg-gray-800/40 transition-colors">
                <div class="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center shrink-0">
                    <span class="text-xl">📌</span>
                </div>
                <div>
                    <h4 class="text-lg font-bold text-white mb-2">Enrollment Trends</h4>
                    <p class="text-gray-400 text-sm leading-relaxed">The most popular academic track is <span class="text-pink-400 font-medium">${mostPopStream}</span> with ${mostPopCount} students enrolled, making up the largest demographic segment of this batch.</p>
                </div>
            </div>

            <div class="glass-card p-6 rounded-2xl flex items-start gap-4 hover:bg-gray-800/40 transition-colors">
                <div class="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
                    <span class="text-xl">🚨</span>
                </div>
                <div>
                    <h4 class="text-lg font-bold text-white mb-2">Critical Attention Needed</h4>
                    <p class="text-gray-400 text-sm leading-relaxed">Currently, <span class="text-rose-400 font-medium">${data.below50} students</span> (${below50Percent}%) are scoring below 50% overall. Identifying these individuals for immediate counseling and support will be vital for improving next year's outcomes.</p>
                </div>
            </div>

            <div class="glass-card p-6 rounded-2xl flex items-start gap-4 hover:bg-gray-800/40 transition-colors">
                <div class="w-12 h-12 rounded-full bg-amber-600/10 flex items-center justify-center shrink-0">
                    <span class="text-xl">🔄</span>
                </div>
                <div>
                    <h4 class="text-lg font-bold text-white mb-2">Compartment & RT Trends</h4>
                    <p class="text-gray-400 text-sm leading-relaxed">${compStudents > 0 || rtInstances > 0 ? `There are <span class="text-amber-500 font-medium">${compStudents} student(s)</span> in the Compartment (COMP) category. Across the batch, there are <span class="text-amber-500 font-medium">${rtInstances} instance(s)</span> of Repeat Theory (RT) recorded in individual subjects, requiring targeted academic intervention.` : `Zero Compartment (COMP) students and zero Repeat Theory (RT) instances were recorded, showing a 100% clean progression rate.`}</p>
                </div>
            </div>

        </div>
    </section>`;
}

function renderFooter() {
    return `
    <footer class="py-12 border-t border-brand-border text-center">
        <h2 class="text-2xl font-display font-bold text-gray-500 mb-4">END OF REPORT</h2>
        <p class="text-gray-600 italic max-w-md mx-auto">"Education is not the learning of facts, but the training of the mind to think." - Albert Einstein</p>
        <p class="text-gray-600 italic max-w-md mx-auto mt-4">BY- PAWAN BHATT(17/05/2026)</p>
        <div class="mt-8 text-xs text-gray-700">Generated automatically from CBSE Result Data • PM SHRI JNV CHAMPAWAT</div>
    </footer>`;
}

// --- 5. CHART.JS INITIALIZATION ---
function initCharts(data) {
    Chart.defaults.color = '#9ca3af';
    Chart.defaults.font.family = 'Inter';
    const tooltipConfig = {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#fff',
        bodyColor: '#e5e7eb',
        borderColor: 'rgba(31, 41, 55, 1)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        boxPadding: 4
    };

    const ctxOverview = document.getElementById('performanceChart').getContext('2d');
    let p90 = data.above90;
    let p75 = data.students.filter(s => s.percentage >= 75 && s.percentage < 90).length;
    let p60 = data.students.filter(s => s.percentage >= 60 && s.percentage < 75).length;
    let pBelow = data.students.filter(s => s.percentage < 60).length;

    new Chart(ctxOverview, {
        type: 'doughnut',
        data: {
            labels: ['Outstanding (90%+)', 'Distinction (75-89%)', 'First Class (60-74%)', 'Average (<60%)'],
            datasets: [{
                data: [p90, p75, p60, pBelow],
                backgroundColor: ['#00F0FF', '#10B981', '#8B5CF6', '#374151'],
                borderWidth: 0,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { position: 'right', labels: { color: '#e5e7eb', font: { size: 12, family: 'Inter' }, padding: 20 } },
                tooltip: tooltipConfig
            },
            cutout: '75%'
        }
    });

    const ctxSubj = document.getElementById('subjectAvgChart').getContext('2d');
    const sortedSubjects = Object.values(data.subjectStats).sort((a,b) => b.average - a.average);
    new Chart(ctxSubj, {
        type: 'bar',
        data: {
            labels: sortedSubjects.map(s => s.name),
            datasets: [{
                label: 'Class Average',
                data: sortedSubjects.map(s => s.average),
                backgroundColor: 'rgba(0, 240, 255, 0.2)',
                borderColor: '#00F0FF',
                borderWidth: 1,
                borderRadius: 4
            },
            {
                label: 'Highest Score',
                data: sortedSubjects.map(s => s.highest),
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                borderColor: '#8B5CF6',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display: false } }
            },
            plugins: { tooltip: tooltipConfig }
        }
    });

    const ctxStream = document.getElementById('streamChart').getContext('2d');
    const streams = ['PCM', 'PCB', 'Commerce'];
    const streamAvgs = streams.map(st => data.streamStats[st]?.avg || 0);
    
    new Chart(ctxStream, {
        type: 'bar',
        data: {
            labels: streams,
            datasets: [{
                label: 'Stream Average %',
                data: streamAvgs,
                backgroundColor: ['rgba(0, 240, 255, 0.6)', 'rgba(16, 185, 129, 0.6)', 'rgba(139, 92, 246, 0.6)'],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: tooltipConfig },
            scales: {
                y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });

    // Gender Pie Chart
    const ctxGender = document.getElementById('genderPieChart');
    if (ctxGender && (data.genderStats.F.count > 0 || data.genderStats.M.count > 0)) {
        new Chart(ctxGender.getContext('2d'), {
            type: 'pie',
            data: {
                labels: ['Female', 'Male'],
                datasets: [{
                    data: [data.genderStats.F.count, data.genderStats.M.count],
                    backgroundColor: ['#F43F5E', '#00F0FF'],
                    borderWidth: 0,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { position: 'bottom', labels: { color: '#e5e7eb', font: { family: 'Inter' } } },
                    tooltip: tooltipConfig
                }
            }
        });
    }

    const ctxDist = document.getElementById('distChart').getContext('2d');
    let bins = { '<40':0, '40-50':0, '50-60':0, '60-70':0, '70-80':0, '80-90':0, '90-100':0 };
    data.students.forEach(s => {
        let p = s.percentage;
        if(p < 40) bins['<40']++;
        else if(p < 50) bins['40-50']++;
        else if(p < 60) bins['50-60']++;
        else if(p < 70) bins['60-70']++;
        else if(p < 80) bins['70-80']++;
        else if(p < 90) bins['80-90']++;
        else bins['90-100']++;
    });

    new Chart(ctxDist, {
        type: 'bar',
        data: {
            labels: Object.keys(bins),
            datasets: [{
                label: 'Number of Students',
                data: Object.values(bins),
                backgroundColor: 'rgba(139, 92, 246, 0.8)',
                borderRadius: 6,
                barPercentage: 0.9,
                categoryPercentage: 1.0
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: tooltipConfig },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 2 }, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

// --- INLINE SEARCH LOGIC ---
function toggleTopStudentSearch() {
    const input = document.getElementById('topStudentSearchInput');
    if (input.classList.contains('hidden')) {
        input.classList.remove('hidden');
        setTimeout(() => {
            input.classList.remove('opacity-0');
            input.focus();
        }, 10);
    } else {
        input.classList.add('opacity-0');
        setTimeout(() => {
            input.classList.add('hidden');
            input.value = '';
            filterTopStudents(); // Reset the table back to top 15
        }, 300);
    }
}

function filterTopStudents() {
    const query = document.getElementById('topStudentSearchInput').value.toLowerCase();
    const tbody = document.getElementById('topStudentsTableBody');
    
    let displayStudents;
    
    // If empty, show top 15. If searching, filter all students and limit results
    if (query.trim() === '') {
        displayStudents = window.allStudentsData.slice(0, 15);
    } else {
        displayStudents = window.allStudentsData.filter(s => 
            s.name.toLowerCase().includes(query) || 
            s.roll.includes(query)
        ).slice(0, 15); // limit visible results to maintain UI cleanly
    }

    // Render new HTML
    tbody.innerHTML = displayStudents.map((s) => {
        // Determine their actual class rank dynamically
        let trueRank = window.allStudentsData.findIndex(st => st.roll === s.roll) + 1;
        
        return `
        <tr class="border-b border-gray-800 hover:bg-gray-800/80 transition-colors cursor-pointer group" onclick="showStudentModal('${s.roll}')" title="Click to view full result">
            <td class="py-4 px-6 text-gray-400 group-hover:text-white">${trueRank}</td>
            <td class="py-4 px-6 font-medium text-white group-hover:text-brand-accent1">${s.name}</td>
            <td class="py-4 px-6 text-gray-400 group-hover:text-white">${s.roll}</td>
            <td class="py-4 px-6 text-gray-400 group-hover:text-white">${s.stream}</td>
            <td class="py-4 px-6 font-bold flex justify-between items-center ${s.percentage >= 90 ? 'text-brand-accent1' : (s.percentage >= 75 ? 'text-brand-accent3' : 'text-gray-200')}">
                <span>${s.percentage}%</span>
                <svg class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </td>
        </tr>
        `;
    }).join('');
    
    // If no matches found
    if(displayStudents.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-gray-500 italic">No students found matching "${query}"</td></tr>`;
    }
}

// --- INIT APP USING EXTERNAL DATA FILE ---
// Initialize application on load using the variable from data.js
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        // Check if the variable from data.js loaded successfully
        if (typeof rawStudentData !== 'undefined') {
            const analyticsData = parseData(rawStudentData);
            renderUI(analyticsData);
        } else {
            document.getElementById('app-content').innerHTML = `
                <div class="min-h-screen flex items-center justify-center">
                    <div class="text-center">
                        <h2 class="text-xl font-display text-red-400 mb-2">Error Loading Data</h2>
                        <p class="text-gray-400 text-sm">Could not find rawStudentData. Make sure data.js is linked in your HTML.</p>
                    </div>
                </div>`;
        }
    }, 500); // Small delay for the loading animation effect
});


// Close active modals on Escape key press
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const openModals = Array.from(document.querySelectorAll('[id$="Modal"]')).filter(m => !m.classList.contains('hidden'));
        if (openModals.length > 0) {
            closeModal(openModals[openModals.length - 1].id);
        }
    }
});


