// ==========================================
// CONFIGURATION
// ==========================================
const CONFIG = {
    telegramBotToken: '8596686665:AAHwdJoL70SUHNZMDNi1lwRocCAEYigJwuU',
    telegramChatId: '-1003880115435'
};

// ==========================================
// GLOBAL VARIABLES
// ==========================================
let currentStep = 1;
const totalSteps = 4;
let photoDataUrl = null;
// Track which steps user has visited — red dot only shows after interaction
const stepTouched = { 1: false, 2: false, 3: false, 4: false };

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    initializeCropManagement();
    initializePhotoUpload();
    initializeDOBAutoAge();
    initializePrevExpToggle();
    initializeTitleCase();
    document.getElementById('registrationForm').addEventListener('change', function() {
        checkAllStepsDots();
    });
    document.getElementById('registrationForm').addEventListener('input', function() {
        checkAllStepsDots();
    });
});

// ==========================================
// PHOTO UPLOAD
// ==========================================
function initializePhotoUpload() {
    const area = document.getElementById('photoUploadArea');
    const input = document.getElementById('photoInput');
    area.addEventListener('click', () => input.click());
    input.addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;
        if (file.size > 500 * 1024) {
            showNotification('फोटो का आकार 500KB से अधिक नहीं होना चाहिए', 'error');
            this.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            photoDataUrl = e.target.result;
            document.getElementById('photoPreview').src = photoDataUrl;
            document.getElementById('photoPreviewBox').style.display = 'block';
            document.getElementById('photoUploadArea').style.display = 'none';
            checkAllStepsDots();
        };
        reader.readAsDataURL(file);
    });
}

function clearPhoto() {
    photoDataUrl = null;
    document.getElementById('photoInput').value = '';
    document.getElementById('photoPreviewBox').style.display = 'none';
    document.getElementById('photoUploadArea').style.display = 'block';
    checkAllStepsDots();
}

// ==========================================
// DOB → AUTO AGE
// ==========================================
function initializeDOBAutoAge() {
    const dobInput = document.querySelector('input[name="dob"]');
    const ageInput = document.querySelector('input[name="age"]');
    if (dobInput && ageInput) {
        dobInput.addEventListener('change', function() {
            const dob = new Date(this.value);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
            ageInput.value = age > 0 ? age : '';
        });
    }
}

// ==========================================
// PREV EXP TOGGLE
// ==========================================
function initializePrevExpToggle() {
    const sel = document.querySelector('select[name="previousMedicinal"]');
    if (sel) {
        sel.addEventListener('change', function() {
            const box = document.getElementById('prevExpDetails');
            if (box) box.style.display = this.value === 'हाँ' ? 'block' : 'none';
        });
    }
}

// ==========================================
// TITLE CASE — auto-capitalize on blur
// ==========================================
function toTitleCase(str) {
    return str.replace(/\S+/g, function(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    });
}

function initializeTitleCase() {
    // Static inputs
    document.querySelectorAll('input[type="text"], textarea').forEach(function(el) {
        el.addEventListener('blur', function() {
            if (this.value.trim()) this.value = toTitleCase(this.value);
        });
    });
    // Dynamic inputs (crop entries added later)
    document.getElementById('registrationForm').addEventListener('blur', function(e) {
        const el = e.target;
        if ((el.tagName === 'INPUT' && el.type === 'text') || el.tagName === 'TEXTAREA') {
            if (el.value.trim()) el.value = toTitleCase(el.value);
        }
    }, true);
}

// ==========================================
// FORM STEP NAVIGATION
// ==========================================
function initializeForm() {
    document.getElementById('nextBtn').addEventListener('click', () => {
        stepTouched[currentStep] = true;
        checkStepCompleteness(currentStep);
        if (currentStep < totalSteps) { currentStep++; updateFormDisplay(); }
    });

    document.getElementById('prevBtn').addEventListener('click', () => {
        stepTouched[currentStep] = true;
        checkStepCompleteness(currentStep);
        if (currentStep > 1) { currentStep--; updateFormDisplay(); }
    });

    document.getElementById('registrationForm').addEventListener('submit', handleFormSubmit);
    updateFormDisplay();
}

function updateFormDisplay() {
    document.querySelectorAll('.form-step').forEach((step, index) => {
        step.classList.toggle('active', index + 1 === currentStep);
    });

    document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
        const stepNum = index + 1;
        if (stepNum < currentStep) {
            indicator.classList.add('completed');
            indicator.classList.remove('active');
        } else if (stepNum === currentStep) {
            indicator.classList.add('active');
            indicator.classList.remove('completed');
        } else {
            indicator.classList.remove('active', 'completed');
        }
    });

    document.querySelectorAll('.progress-line').forEach((line, index) => {
        line.classList.toggle('active', index < currentStep - 1);
    });

    document.getElementById('prevBtn').style.display = currentStep === 1 ? 'none' : 'block';
    document.getElementById('nextBtn').style.display = currentStep === totalSteps ? 'none' : 'block';
    document.getElementById('submitBtn').style.display = currentStep === totalSteps ? 'block' : 'none';
    document.getElementById('downloadPdfBtn').style.display = currentStep === totalSteps ? 'block' : 'none';

    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(checkAllStepsDots, 50);
}

// ==========================================
// STEP COMPLETENESS CHECK → RED DOT
// Only shows after user has touched that step
// ==========================================
function checkStepCompleteness(stepNum) {
    const stepEl = document.querySelector(`.form-step[data-step="${stepNum}"]`);
    const wrapper = document.getElementById(`sw-${stepNum}`);
    if (!stepEl || !wrapper) return;

    // Don't show red dot until user has interacted with this step
    if (!stepTouched[stepNum]) {
        wrapper.querySelector('.step-dot').style.display = 'none';
        return;
    }

    const inputs = stepEl.querySelectorAll('input[required], select[required], textarea[required]');
    let hasEmpty = false;
    inputs.forEach(inp => {
        if (inp.type === 'checkbox') { if (!inp.checked) hasEmpty = true; return; }
        if (!inp.value.trim()) hasEmpty = true;
    });
    if (stepNum === 4 && !photoDataUrl) hasEmpty = true;

    wrapper.querySelector('.step-dot').style.display = hasEmpty ? 'block' : 'none';
}

function checkAllStepsDots() {
    // Mark current step as touched when user types/changes anything
    stepTouched[currentStep] = true;
    for (let i = 1; i <= totalSteps; i++) checkStepCompleteness(i);
}

// ==========================================
// VALIDATE ALL STEPS FOR SUBMIT
// ==========================================
function validateAllSteps() {
    let allValid = true;
    // Mark all steps touched on submit
    for (let i = 1; i <= totalSteps; i++) stepTouched[i] = true;

    for (let stepNum = 1; stepNum <= totalSteps; stepNum++) {
        const stepEl = document.querySelector(`.form-step[data-step="${stepNum}"]`);
        if (!stepEl) continue;
        const inputs = stepEl.querySelectorAll('input[required], select[required], textarea[required]');
        inputs.forEach(inp => {
            if (inp.type === 'checkbox') { if (!inp.checked) allValid = false; return; }
            if (!inp.value.trim()) {
                allValid = false;
                inp.classList.add('border-red-500');
            } else {
                inp.classList.remove('border-red-500');
            }
        });
        if (stepNum === 4 && !photoDataUrl) allValid = false;
    }
    checkAllStepsDots();
    return allValid;
}

// ==========================================
// CROP MANAGEMENT
// ==========================================
function initializeCropManagement() {
    document.getElementById('addCropBtn').addEventListener('click', () => {
        const cropEntry = document.createElement('div');
        cropEntry.className = 'crop-entry bg-gray-50 rounded-xl p-4 mb-4';
        cropEntry.innerHTML = `
            <button type="button" class="remove-crop" onclick="this.parentElement.remove(); checkAllStepsDots();">×</button>
            <div class="grid md:grid-cols-3 gap-4">
                <div class="form-group" style="margin-bottom:0;">
                    <label class="form-label">फसल का नाम *</label>
                    <input type="text" name="cropName[]" required class="form-input" placeholder="जैसे: अश्वगंधा">
                </div>
                <div class="form-group" style="margin-bottom:0;">
                    <label class="form-label">बुवाई माह *</label>
                    <select name="cropSowing[]" required class="form-input">
                        <option value="">माह चुनें</option>
                        <option value="जनवरी">जनवरी / January</option>
                        <option value="फरवरी">फरवरी / February</option>
                        <option value="मार्च">मार्च / March</option>
                        <option value="अप्रैल">अप्रैल / April</option>
                        <option value="मई">मई / May</option>
                        <option value="जून">जून / June</option>
                        <option value="जुलाई">जुलाई / July</option>
                        <option value="अगस्त">अगस्त / August</option>
                        <option value="सितंबर">सितंबर / September</option>
                        <option value="अक्टूबर">अक्टूबर / October</option>
                        <option value="नवंबर">नवंबर / November</option>
                        <option value="दिसंबर">दिसंबर / December</option>
                    </select>
                </div>
                <div class="form-group" style="margin-bottom:0;">
                    <label class="form-label">कटाई माह *</label>
                    <select name="cropHarvest[]" required class="form-input">
                        <option value="">माह चुनें</option>
                        <option value="जनवरी">जनवरी / January</option>
                        <option value="फरवरी">फरवरी / February</option>
                        <option value="मार्च">मार्च / March</option>
                        <option value="अप्रैल">अप्रैल / April</option>
                        <option value="मई">मई / May</option>
                        <option value="जून">जून / June</option>
                        <option value="जुलाई">जुलाई / July</option>
                        <option value="अगस्त">अगस्त / August</option>
                        <option value="सितंबर">सितंबर / September</option>
                        <option value="अक्टूबर">अक्टूबर / October</option>
                        <option value="नवंबर">नवंबर / November</option>
                        <option value="दिसंबर">दिसंबर / December</option>
                    </select>
                </div>
            </div>
        `;
        document.getElementById('cropsContainer').appendChild(cropEntry);
    });
}

// ==========================================
// COLLECT FORM DATA
// ==========================================
function collectFormData() {
    const form = document.getElementById('registrationForm');
    const formData = new FormData(form);

    const cropNames = formData.getAll('cropName[]');
    const cropSowing = formData.getAll('cropSowing[]');
    const cropHarvest = formData.getAll('cropHarvest[]');
    const crops = cropNames.map((name, i) => ({
        name: name,
        sowingMonth: cropSowing[i] || '',
        harvestMonth: cropHarvest[i] || ''
    }));

    const regNumber = 'KR' + Date.now().toString().slice(-8);
    const now = new Date();
    const submittedAt = now.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    return {
        fullName: formData.get('fullName') || '',
        fatherName: formData.get('fatherName') || '',
        dob: formData.get('dob') || '',
        age: formData.get('age') || '',
        gender: formData.get('gender') || '',
        phone: formData.get('phone') || '',
        altPhone: formData.get('altPhone') || '',
        village: formData.get('village') || '',
        panchayat: formData.get('panchayat') || '',
        block: formData.get('block') || '',
        district: formData.get('district') || '',
        state: formData.get('state') || '',
        pincode: formData.get('pincode') || '',
        irrigatedArea: formData.get('irrigatedArea') || '0',
        irrigatedOwnership: formData.get('irrigatedOwnership') || '',
        unirrigatedArea: formData.get('unirrigatedArea') || '0',
        unirrigatedOwnership: formData.get('unirrigatedOwnership') || '',
        shgMember: formData.get('shgMember') || '',
        shgName: formData.get('shgName') || '',
        crops: crops,
        previousMedicinal: formData.get('previousMedicinal') || '',
        prevExpDescription: formData.get('prevExpDescription') || '',
        photo: photoDataUrl,
        regNumber: regNumber,
        submittedAt: submittedAt
    };
}

// ==========================================
// FORM SUBMISSION
// ==========================================
async function handleFormSubmit(e) {
    e.preventDefault();

    if (!validateAllSteps()) {
        showNotification('कृपया सभी टैब के * आवश्यक फील्ड भरें', 'error');
        for (let i = 1; i <= totalSteps; i++) {
            const stepEl = document.querySelector(`.form-step[data-step="${i}"]`);
            const inputs = stepEl.querySelectorAll('input[required], select[required], textarea[required]');
            let incomplete = false;
            inputs.forEach(inp => {
                if (inp.type === 'checkbox') { if (!inp.checked) incomplete = true; return; }
                if (!inp.value.trim()) incomplete = true;
            });
            if (i === 4 && !photoDataUrl) incomplete = true;
            if (incomplete) { currentStep = i; updateFormDisplay(); break; }
        }
        return;
    }

    if (!photoDataUrl) {
        showNotification('कृपया पासपोर्ट साइज फोटो अपलोड करें', 'error');
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="animate-spin inline-block mr-2">⏳</span> जमा हो रहा है...';

    try {
        const formData = collectFormData();
        const pdfBlob = await generatePDF(formData);
        await sendPDFToTelegram(pdfBlob, formData);
        showNotification('✅ पंजीकरण सफलतापूर्वक जमा हो गया!', 'success');
        setTimeout(() => { window.location.reload(); }, 2500);
    } catch (error) {
        console.error('Submission error:', error);
        showNotification('❌ त्रुटि: ' + error.message, 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = currentLang === 'hi' ? '🚀 पंजीकरण जमा करें' : '🚀 Submit Registration';
    }
}

// ==========================================
// PDF GENERATION
// ==========================================
async function generatePDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const W = 210;
    const margin = 12;
    let y = 25;   // FIX: was 20, now 25 — adds gap between header and Section 1
    const BRAND_R = 27, BRAND_G = 58, BRAND_B = 26;

    function checkPage(requiredSpace) {
        if (y + requiredSpace > 280) { doc.addPage(); y = 20; }
    }
    function sectionTitle(title, currentY) {
        checkPage(12);
        doc.setFillColor(BRAND_R, BRAND_G, BRAND_B);
        doc.rect(margin, currentY, W - margin * 2, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin + 2, currentY + 5.5);
        doc.setTextColor(0, 0, 0);
        return currentY + 12;
    }
    function field(label, value, x, currentY, labelWidth = 30, valueWidth = 50) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(label, x, currentY);
        doc.setFont('helvetica', 'normal');
        const textValue = String(value || '');
        const wrapped = doc.splitTextToSize(textValue, valueWidth);
        doc.text(wrapped, x + labelWidth, currentY);
        return currentY;
    }

    // HEADER
    doc.setFillColor(BRAND_R, BRAND_G, BRAND_B);
    doc.rect(0, 0, W, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('AUSHADHIYOG PRIVATE LIMITED', W / 2, 9, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Kisan Panjikaran Prapattra', W / 2, 15, { align: 'center' });
    doc.setTextColor(0, 0, 0);

    if (data.photo) {
        try { doc.addImage(data.photo, 'JPEG', W - margin - 30, 25, 25, 30, undefined, 'FAST'); }
        catch (e) { console.error('Photo error:', e); }
    }

    // SECTION 1
    y = sectionTitle('1. Vyaktigat Jaankaari (Personal Information)', y);
    const col1X = margin + 2;
    const col2X = margin + 2 + 90;
    field('Poora Naam:', data.fullName, col1X, y, 28, 55); y += 7;
    field('Pita/Pati ka Naam:', data.fatherName, col1X, y, 35, 48); y += 7;
    field('Janm Tithi:', data.dob, col1X, y, 22, 30);
    field('Aayu:', data.age + ' varsh', col2X, y, 12, 20); y += 7;
    field('Ling:', data.gender, col1X, y, 12, 30);
    field('Mobile:', data.phone, col2X, y, 16, 40); y += 7;
    if (data.altPhone) { field('Alt Mobile:', data.altPhone, col1X, y, 22, 40); y += 7; }
    y += 3;

    // SECTION 2
    checkPage(40);
    y = sectionTitle('2. Pata Vivaran (Address Details)', y);
    field('Rajya:', data.state, col1X, y, 14, 55);
    field('Jila:', data.district, col2X, y, 12, 50); y += 7;
    field('Prakhanda:', data.block, col1X, y, 20, 47);
    field('Panchayat:', data.panchayat, col2X, y, 22, 40); y += 7;
    field('Gram:', data.village, col1X, y, 12, 55);
    field('Pin Code:', data.pincode, col2X, y, 18, 40); y += 9;

    // SECTION 3
    checkPage(50);
    y = sectionTitle('3. Bhoomi Vivaran (Land Details)', y);
    doc.setFillColor(240, 253, 244);
    doc.rect(margin, y, W - margin * 2, 6, 'F');
    doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    const col = [margin, margin + 45, margin + 80];
    doc.text('Bhoomi Prakar', col[0] + 1, y + 4);
    doc.text('Kshetra (Acre)', col[1] + 1, y + 4);
    doc.text('Swamitva', col[2] + 1, y + 4);
    doc.setDrawColor(180, 180, 180);
    doc.rect(margin, y, W - margin * 2, 6); y += 6;
    doc.setFont('helvetica', 'normal');
    doc.rect(margin, y, W - margin * 2, 6);
    doc.text('Sinchai (Irrigated)', col[0] + 1, y + 4);
    doc.text(data.irrigatedArea, col[1] + 1, y + 4);
    doc.text(data.irrigatedOwnership, col[2] + 1, y + 4); y += 6;
    doc.rect(margin, y, W - margin * 2, 6);
    doc.text('Asinchai (Unirrigated)', col[0] + 1, y + 4);
    doc.text(data.unirrigatedArea, col[1] + 1, y + 4);
    doc.text(data.unirrigatedOwnership, col[2] + 1, y + 4); y += 9;

    // SECTION 4
    checkPage(20);
    y = sectionTitle('4. Samuh / Sangathan Judav (SHG/FPO)', y);
    field('SHG/FPO Sadasya:', data.shgMember, col1X, y, 32, 20);
    if (data.shgMember === 'हाँ' && data.shgName) { field('Naam:', data.shgName, col2X, y, 12, 55); }
    y += 9;

    // SECTION 5
    checkPage(30 + data.crops.length * 7);
    y = sectionTitle('5. Prastaavit Fasal Vivaran (Crop Details)', y);
    doc.setFillColor(240, 253, 244);
    doc.rect(margin, y, W - margin * 2, 6, 'F');
    doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    const cropCols = [margin, margin + 60, margin + 100];
    doc.text('Fasal ka Naam', cropCols[0] + 1, y + 4);
    doc.text('Buwai Maah', cropCols[1] + 1, y + 4);
    doc.text('Katai Maah', cropCols[2] + 1, y + 4);
    doc.setDrawColor(180, 180, 180);
    doc.rect(margin, y, W - margin * 2, 6); y += 6;
    doc.setFont('helvetica', 'normal');
    data.crops.forEach((crop, i) => {
        checkPage(7);
        doc.rect(margin, y, W - margin * 2, 6);
        doc.text(String(i + 1) + '. ' + (crop.name || ''), cropCols[0] + 1, y + 4);
        doc.text(crop.sowingMonth || '', cropCols[1] + 1, y + 4);
        doc.text(crop.harvestMonth || '', cropCols[2] + 1, y + 4);
        y += 6;
    }); y += 4;

    // SECTION 6
    checkPage(20);
    y = sectionTitle('6. Poorv Anubhav (Previous Experience)', y);
    field('Kya aapne pehle Aushadhiya Fasal ugaai hai?', data.previousMedicinal, col1X, y, 82, 20); y += 7;
    if (data.previousMedicinal === 'हाँ' && data.prevExpDescription) {
        doc.setFontSize(8); doc.setFont('helvetica', 'bold');
        doc.text('Vivaran:', col1X, y);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(data.prevExpDescription, W - margin * 2 - 25);
        doc.text(lines, col1X + 20, y);
        y += lines.length * 5 + 2;
    }
    y += 3;

    // SECTION 7: FIX — "Evam" capital E
    checkPage(30);
    y = sectionTitle('7. Niyam Evam Shartein (Terms & Conditions)', y);
    doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
    const termsText = 'Main yah ghoshit karta/karti hun ki di gayi sabhi jaankaari satya hai. Main company ke nirdeshanusar kheti karunga/karungi aur gunvatta maankon ka paalan karunga/karungi. Main utpada ko praathamikta se company ko bechunga/bechungi. Yadi koi jaankaari galat payi jaati hai, to panjikaran nirasht kiya ja sakta hai.';
    const termsLines = doc.splitTextToSize(termsText, W - margin * 2 - 4);
    doc.text(termsLines, col1X + 2, y);
    y += termsLines.length * 4 + 6;

    // SECTION 8: FIX — checkPage(65) ensures full signatures block stays on same page
    checkPage(65);
    y = sectionTitle('8. Hastaakshar (Signatures)', y);
    y += 8;
    const sigW = (W - margin * 2 - 10) / 2;
    doc.setDrawColor(120, 120, 120);
    doc.rect(margin, y, sigW, 20);
    doc.rect(margin + sigW + 10, y, sigW, 20);
    doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
    doc.text('Kisan Hastaakshar / Angutha Nishan', margin + sigW / 2, y + 25, { align: 'center' });
    doc.text('Naam: ' + data.fullName, margin + 2, y + 23);
    doc.text('Company Pratinidhi', margin + sigW + 10 + sigW / 2, y + 25, { align: 'center' });
    y += 30;

    // FOOTER — no checkPage, placed directly after signatures
    doc.setFillColor(BRAND_R, BRAND_G, BRAND_B);
    doc.rect(0, y, W, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7); doc.setFont('helvetica', 'normal');
    doc.text(`Submitted: ${data.submittedAt} | Reg No: ${data.regNumber}`, W / 2, y + 6, { align: 'center' });

    return doc.output('blob');
}

// ==========================================
// DOWNLOAD PDF
// ==========================================
async function downloadPDFPreview() {
    try {
        const formData = collectFormData();
        const pdfBlob = await generatePDF(formData);
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Kisan_Registration_${formData.regNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (e) {
        showNotification('PDF download mein error: ' + e.message, 'error');
    }
}

// ==========================================
// SEND TO TELEGRAM
// ==========================================
async function sendPDFToTelegram(pdfBlob, data) {
    const fileName = `Kisan_Registration_${data.regNumber}.pdf`;
    const formData = new FormData();
    formData.append('chat_id', CONFIG.telegramChatId);
    formData.append('document', pdfBlob, fileName);
    formData.append('caption',
        `🌱 *Naya Kisan Panjikaran*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 *Naam:* ${data.fullName}\n` +
        `📱 *Mobile:* ${data.phone}\n` +
        `📍 *Sthan:* ${data.district}, ${data.state}\n` +
        `🌾 *Bhoomi:* Sinchai: ${data.irrigatedArea} Acre | Asinchai: ${data.unirrigatedArea} Acre\n` +
        `🌿 *Fasalein:* ${data.crops.map(c => c.name).join(', ')}\n` +
        `🆔 *Reg No:* ${data.regNumber}\n` +
        `⏰ *Samay:* ${data.submittedAt}`
    );
    formData.append('parse_mode', 'Markdown');

    const response = await fetch(`https://api.telegram.org/bot${CONFIG.telegramBotToken}/sendDocument`, {
        method: 'POST',
        body: formData
    });
    const result = await response.json();
    if (!result.ok) {
        console.error('Telegram error:', result);
        showNotification('Telegram notification fail hua, lekin form jama ho gaya', 'info');
    }
}

// ==========================================
// NOTIFICATION
// ==========================================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-xl transform transition-all duration-300 text-white max-w-xs`;
    notification.style.background = type === 'success' ? '#16a34a' : type === 'error' ? '#dc2626' : '#2563eb';
    notification.style.transform = 'translateX(500px)';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => { notification.style.transform = 'translateX(0)'; }, 10);
    setTimeout(() => {
        notification.style.transform = 'translateX(500px)';
        setTimeout(() => { if (document.body.contains(notification)) document.body.removeChild(notification); }, 300);
    }, 5000);
}
