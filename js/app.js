// ==========================================
// CONFIGURATION
// ==========================================
const CONFIG = {
    telegramBotToken: '8596686665:AAHwdJoL70SUHNZMDNi1lwRocCAEYigJwuU',
    telegramChatId: '-1003880115435'
};

// ==========================================
// AUTO-SAVE TO localStorage
// ==========================================
const DRAFT_KEY = 'aushadhiyog_draft';

function saveDraft() {
    try {
        const form = document.getElementById('registrationForm');
        if (!form) return;
        const data = {};
        form.querySelectorAll('input:not([type=file]):not([type=checkbox]), select, textarea').forEach(el => {
            if (el.name) data[el.name] = el.value;
        });
        form.querySelectorAll('input[type=checkbox]').forEach(el => {
            if (el.name) data[el.name] = el.checked;
        });
        data['__step'] = currentStep;
        if (photoDataUrl) data['__photo'] = photoDataUrl;
        localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch(e) {}
}

function loadDraft() {
    try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        const form = document.getElementById('registrationForm');
        if (!form) return;
        form.querySelectorAll('input:not([type=file]):not([type=checkbox]), select, textarea').forEach(el => {
            if (el.name && data[el.name] !== undefined) el.value = data[el.name];
        });
        form.querySelectorAll('input[type=checkbox]').forEach(el => {
            if (el.name && data[el.name] !== undefined) el.checked = data[el.name];
        });
        if (data['__photo']) {
            photoDataUrl = data['__photo'];
            const preview = document.getElementById('photoPreview');
            const previewBox = document.getElementById('photoPreviewBox');
            const uploadArea = document.getElementById('photoUploadArea');
            if (preview && previewBox && uploadArea) {
                preview.src = photoDataUrl;
                previewBox.style.display = 'block';
                uploadArea.style.display = 'none';
            }
        }
        // Restore district dropdown
        const stateVal = data['state'];
        if (stateVal && typeof populateDistricts === 'function') {
            populateDistricts(stateVal);
            setTimeout(() => {
                const distEl = document.querySelector('select[name="district"]');
                if (distEl && data['district']) distEl.value = data['district'];
            }, 50);
        }
        // Restore SHG name visibility
        const shgSel = document.querySelector('select[name="shgMember"]');
        if (shgSel) {
            const shgGroup = document.getElementById('shgNameGroup');
            if (shgGroup) shgGroup.style.display = shgSel.value === 'हाँ' ? 'block' : 'none';
        }
        // Restore prevExp visibility
        const prevSel = document.querySelector('select[name="previousMedicinal"]');
        if (prevSel) {
            const prevBox = document.getElementById('prevExpDetails');
            if (prevBox) prevBox.style.display = prevSel.value === 'हाँ' ? 'block' : 'none';
        }
        showNotification('📝 Draft restored from previous session', 'info');
    } catch(e) {}
}

function clearDraft() {
    try { localStorage.removeItem(DRAFT_KEY); } catch(e) {}
}

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
    initializeInlineValidation();

    const form = document.getElementById('registrationForm');
    form.addEventListener('change', function() {
        checkAllStepsDots();
        saveDraft();
    });
    form.addEventListener('input', function() {
        checkAllStepsDots();
        saveDraft();
    });

    // Load draft after a short delay so district dropdown is ready
    setTimeout(loadDraft, 100);
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
// INLINE BLUR VALIDATION
// ==========================================
function initializeInlineValidation() {
    const form = document.getElementById('registrationForm');

    // Validate a single field on blur
    function validateField(el) {
        if (!el.hasAttribute('required')) return;
        let invalid = false;
        if (el.type === 'checkbox') {
            invalid = !el.checked;
        } else {
            invalid = !el.value.trim();
        }
        // Pattern check
        if (!invalid && el.pattern) {
            const re = new RegExp('^(?:' + el.pattern + ')$');
            if (!re.test(el.value.trim())) invalid = true;
        }

        if (invalid) {
            el.classList.add('border-red-500');
            el.style.boxShadow = '0 0 0 3px rgba(239,68,68,.15)';
            // Show inline error message
            let errEl = el.parentElement.querySelector('.inline-err');
            if (!errEl) {
                errEl = document.createElement('span');
                errEl.className = 'inline-err';
                errEl.style.cssText = 'display:block;font-size:.72rem;color:#dc2626;margin-top:.28rem;font-weight:600;';
                el.parentElement.appendChild(errEl);
            }
            if (el.pattern && el.value.trim()) {
                errEl.textContent = el.name === 'phone' ? 'Valid 10-digit number required' :
                                    el.name === 'pincode' ? 'Valid 6-digit pin code required' : 'Invalid format';
            } else {
                errEl.textContent = currentLang === 'hi' ? 'यह फील्ड आवश्यक है' : 'This field is required';
            }
        } else {
            el.classList.remove('border-red-500');
            el.style.boxShadow = '';
            const errEl = el.parentElement.querySelector('.inline-err');
            if (errEl) errEl.remove();
        }
    }

    // Delegate blur events
    form.addEventListener('blur', function(e) {
        const el = e.target;
        if ((el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') && stepTouched[currentStep]) {
            validateField(el);
        }
    }, true);

    // Clear error on input/change
    form.addEventListener('input', function(e) {
        const el = e.target;
        if (el.classList.contains('border-red-500') && el.value.trim()) {
            el.classList.remove('border-red-500');
            el.style.boxShadow = '';
            const errEl = el.parentElement.querySelector('.inline-err');
            if (errEl) errEl.remove();
        }
    });
}
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
    // Only toggle form-step divs with data-step 1–4 (not reviewStep)
    document.querySelectorAll('.form-step[data-step]').forEach((step) => {
        const s = parseInt(step.getAttribute('data-step'));
        if (s <= totalSteps) step.classList.toggle('active', s === currentStep);
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
    // downloadPdfBtn is hidden in the nav bar — it lives in the review screen now
    document.getElementById('downloadPdfBtn').style.display = 'none';

    // Update progress % indicator
    updateProgressPercent();

    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(checkAllStepsDots, 50);
}

// ==========================================
// REVIEW MODE — opens after Submit click
// ==========================================
function openReviewMode() {
    // Validate first
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

    // Hide all regular form steps + nav
    document.querySelectorAll('.form-step[data-step]').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
    document.getElementById('reviewStep').style.display = 'block';
    document.getElementById('prevBtn').style.display = 'none';
    document.getElementById('nextBtn').style.display = 'none';
    document.getElementById('submitBtn').style.display = 'none';
    document.getElementById('downloadPdfBtn').style.display = 'none';

    // Populate review panel
    populateReviewPanel();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function exitReviewMode() {
    // Hide review step, restore step 4
    document.getElementById('reviewStep').style.display = 'none';
    document.querySelectorAll('.form-step[data-step]').forEach(s => { s.style.display = ''; });
    currentStep = totalSteps;
    updateFormDisplay();
}

async function confirmAndSubmit() {
    const btn = document.getElementById('confirmRegBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="animate-spin inline-block mr-2">⏳</span> जमा हो रहा है...';
    try {
        const formData = collectFormData();
        const pdfBlob = await generatePDF(formData);
        await sendPDFToTelegram(pdfBlob, formData);
        clearDraft();
        showNotification('✅ पंजीकरण सफलतापूर्वक जमा हो गया!', 'success');
        setTimeout(() => { window.location.reload(); }, 2500);
    } catch (error) {
        console.error('Submission error:', error);
        showNotification('❌ त्रुटि: ' + error.message, 'error');
        btn.disabled = false;
        btn.innerHTML = currentLang === 'hi' ? '✅ पंजीकरण की पुष्टि करें' : '✅ Confirm Registration';
    }
}

// ==========================================
// PROGRESS PERCENTAGE INDICATOR
// ==========================================
function updateProgressPercent() {
    const pct = Math.round(((currentStep - 1) / totalSteps) * 100);
    const bar = document.getElementById('progressFillBar');
    const txt = document.getElementById('progressPercentText');
    if (bar) bar.style.width = pct + '%';
    if (txt) txt.textContent = pct + '% complete';
}

// ==========================================
// REVIEW PANEL POPULATION
// ==========================================
function populateReviewPanel() {
    const panel = document.getElementById('reviewPanel');
    if (!panel) return;
    const fd = collectFormData();
    const row = (lbl, val) => `<tr><td style="padding:4px 8px;font-weight:600;color:#3A342C;font-size:.78rem;white-space:nowrap;">${lbl}</td><td style="padding:4px 8px;font-size:.78rem;color:#181511;">${val || '—'}</td></tr>`;
    const sec = (title) => `<tr><td colspan="2" style="padding:5px 8px 3px;font-weight:700;font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;color:#fff;background:#1B3A1A;">${title}</td></tr>`;

    const cropRows = fd.crops.map((c,i) => row(`Crop ${i+1}`, `${c.name} (${c.sowingMonth} → ${c.harvestMonth})`)).join('');

    panel.innerHTML = `
      <table style="width:100%;border-collapse:collapse;border:1px solid #DDD3C0;border-radius:.5rem;overflow:hidden;">
        ${sec('1. Personal Information')}
        ${row('Full Name', fd.fullName)}
        ${row('Father/Husband', fd.fatherName)}
        ${row('DOB / Age', fd.dob + ' / ' + fd.age + ' yrs')}
        ${row('Gender', fd.gender)}
        ${row('Mobile', fd.phone)}
        ${sec('2. Address')}
        ${row('State / District', fd.state + ' / ' + fd.district)}
        ${row('Block / Panchayat', fd.block + ' / ' + fd.panchayat)}
        ${row('Village / Pin', fd.village + ' / ' + fd.pincode)}
        ${sec('3. Land & SHG')}
        ${row('Irrigated (Acre)', fd.irrigatedArea + ' — ' + fd.irrigatedOwnership)}
        ${row('Unirrigated (Acre)', fd.unirrigatedArea + ' — ' + fd.unirrigatedOwnership)}
        ${row('SHG/FPO Member', fd.shgMember + (fd.shgName ? ' (' + fd.shgName + ')' : ''))}
        ${sec('4. Crops & Experience')}
        ${cropRows}
        ${row('Prev. Medicinal Exp.', fd.previousMedicinal)}
        ${fd.prevExpDescription ? row('Details', fd.prevExpDescription) : ''}
      </table>`;
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
// FORM SUBMISSION — now handled by confirmAndSubmit after review
// ==========================================
async function handleFormSubmit(e) {
    e.preventDefault();
    openReviewMode();
}

// ==========================================
// PDF GENERATION — Professional Premium Layout
// ==========================================
async function generatePDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const W = 210, H = 297;
    const ML = 14, MR = 14; // margins
    const CW = W - ML - MR; // content width

    // ── COLOUR PALETTE ──
    const DARK_GREEN   = [27, 58, 26];
    const MID_GREEN    = [45, 92, 44];
    const LIGHT_GREEN  = [240, 252, 240];
    const ACCENT_GOLD  = [200, 168, 75];
    const CREAM        = [245, 240, 232];
    const WHITE        = [255, 255, 255];
    const GREY_TEXT    = [90, 85, 78];
    const DARK_TEXT    = [24, 21, 17];
    const BORDER_GREY  = [210, 210, 210];
    const ROW_ALT      = [250, 253, 250];

    let y = 0;

    // ════════════════════════════════
    // HEADER — deep green band
    // ════════════════════════════════
    // Full green header
    doc.setFillColor(...DARK_GREEN);
    doc.rect(0, 0, W, 28, 'F');

    // Subtle gold accent line at very top
    doc.setFillColor(...ACCENT_GOLD);
    doc.rect(0, 0, W, 1.2, 'F');

    // Company name
    doc.setTextColor(...WHITE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('AUSHADHIYOG PRIVATE LIMITED', W / 2, 11, { align: 'center' });

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(220, 215, 190);
    doc.text('Kisan Panjikaran Prapattra  |  Farmer Registration Form', W / 2, 18.5, { align: 'center' });

    // Gold accent line at bottom of header
    doc.setFillColor(...ACCENT_GOLD);
    doc.rect(0, 26.5, W, 0.9, 'F');

    y = 32;

    // ── SECTION HEADER helper ──
    function secHeader(title, yPos) {
        doc.setFillColor(...DARK_GREEN);
        doc.rect(ML, yPos, CW, 7, 'F');
        doc.setFillColor(...ACCENT_GOLD);
        doc.rect(ML, yPos, 2.5, 7, 'F');
        doc.setTextColor(...WHITE);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(title, ML + 5, yPos + 4.7);
        doc.setTextColor(...DARK_TEXT);
        return yPos + 7;
    }

    // ── TWO-COLUMN ROW helper ──
    function dataRow(label, value, x, yPos, labelW, cellW, rowH = 6, isAlt = false) {
        if (isAlt) { doc.setFillColor(...ROW_ALT); doc.rect(x, yPos, cellW, rowH, 'F'); }
        doc.setDrawColor(...BORDER_GREY);
        doc.setLineWidth(0.25);
        doc.rect(x, yPos, cellW, rowH);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(...GREY_TEXT);
        doc.text(label, x + 2, yPos + 3.9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...DARK_TEXT);
        const maxW = cellW - labelW - 3;
        const txt = doc.splitTextToSize(String(value || '—'), maxW);
        doc.text(txt[0] || '', x + labelW + 2, yPos + 3.9);
    }

    // ── PLAIN INFO ROW ──
    function infoLine(label, value, x, yPos, labelW) {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...GREY_TEXT);
        doc.text(label, x, yPos);
        doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK_TEXT);
        doc.text(String(value || '—'), x + labelW, yPos);
    }

    // ════════════════════════════════
    // SECTION 1 — Personal Information
    // ════════════════════════════════
    y = secHeader('1. Vyaktigat Jaankaari (Personal Information)', y);

    // Photo: drawn INSIDE section 1, top-right
    const photoW = 28, photoH = 34;
    const photoX = W - MR - photoW;
    const photoY = y + 1;
    const photoRightX = photoX - 5;
    const s1CW = photoRightX - ML;

    if (data.photo) {
        try {
            doc.setDrawColor(...DARK_GREEN);
            doc.setLineWidth(0.8);
            doc.roundedRect(photoX - 1, photoY - 1, photoW + 2, photoH + 2, 1, 1);
            doc.addImage(data.photo, 'JPEG', photoX, photoY, photoW, photoH, undefined, 'FAST');
        } catch (e) { console.error('Photo:', e); }
    } else {
        doc.setFillColor(...CREAM);
        doc.setDrawColor(...DARK_GREEN);
        doc.setLineWidth(0.6);
        doc.roundedRect(photoX, photoY, photoW, photoH, 1, 1, 'FD');
        doc.setFontSize(6.5); doc.setTextColor(...GREY_TEXT);
        doc.text('PHOTO', photoX + photoW / 2, photoY + photoH / 2, { align: 'center' });
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6); doc.setTextColor(...GREY_TEXT);
    doc.text('Passport Size Photo', photoX + photoW / 2, photoY + photoH + 4, { align: 'center' });

    const rowH = 6;
    // Name
    doc.setFillColor(...ROW_ALT); doc.rect(ML, y, s1CW, rowH, 'F');
    doc.setDrawColor(...BORDER_GREY); doc.setLineWidth(0.25); doc.rect(ML, y, s1CW, rowH);
    infoLine('Poora Naam:', data.fullName, ML + 2, y + 4, 28); y += rowH;

    // Father
    doc.rect(ML, y, s1CW, rowH);
    infoLine('Pita/Pati ka Naam:', data.fatherName, ML + 2, y + 4, 38); y += rowH;

    // DOB + Age
    doc.setFillColor(...ROW_ALT); doc.rect(ML, y, s1CW, rowH, 'F');
    doc.rect(ML, y, s1CW, rowH);
    infoLine('Janm Tithi:', data.dob, ML + 2, y + 4, 24);
    infoLine('Aayu:', (data.age || '—') + ' varsh', ML + 2 + 68, y + 4, 14); y += rowH;

    // Gender + Mobile
    doc.rect(ML, y, s1CW, rowH);
    infoLine('Ling:', data.gender, ML + 2, y + 4, 14);
    infoLine('Mobile:', data.phone, ML + 2 + 50, y + 4, 17); y += rowH;

    y = Math.max(y, photoY + photoH + 6) + 2;

    // ════════════════════════════════
    // SECTION 2 — Address
    // ════════════════════════════════
    y = secHeader('2. Pata Vivaran (Address Details)', y);
    const half = CW / 2;

    dataRow('Rajya:', data.state, ML, y, 16, half, rowH, false);
    dataRow('Jila:', data.district, ML + half, y, 13, half, rowH, false); y += rowH;

    dataRow('Prakhanda:', data.block, ML, y, 22, half, rowH, true);
    dataRow('Panchayat:', data.panchayat, ML + half, y, 24, half, rowH, true); y += rowH;

    dataRow('Gram:', data.village, ML, y, 14, half, rowH, false);
    dataRow('Pin Code:', data.pincode, ML + half, y, 20, half, rowH, false); y += rowH + 2;

    // ════════════════════════════════
    // SECTION 3 — Land Details
    // ════════════════════════════════
    y = secHeader('3. Bhoomi Vivaran (Land Details)', y);
    const t = CW / 3;

    // Table header row
    doc.setFillColor(...MID_GREEN);
    doc.rect(ML, y, CW, 6.5, 'F');
    doc.setTextColor(...WHITE);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5);
    doc.text('Bhoomi Prakar', ML + 2, y + 4.3);
    doc.text('Kshetra (Acre)', ML + t + 2, y + 4.3);
    doc.text('Swamitva', ML + t * 2 + 2, y + 4.3);
    doc.setDrawColor(...DARK_GREEN); doc.setLineWidth(0.3);
    doc.rect(ML, y, CW, 6.5); y += 6.5;

    doc.setTextColor(...DARK_TEXT);
    [
        ['Sinchai (Irrigated)', String(data.irrigatedArea), String(data.irrigatedOwnership || '—')],
        ['Asinchai (Unirrigated)', String(data.unirrigatedArea), String(data.unirrigatedOwnership || '—')]
    ].forEach((r, i) => {
        if (i % 2 === 0) { doc.setFillColor(...ROW_ALT); doc.rect(ML, y, CW, rowH, 'F'); }
        doc.setDrawColor(...BORDER_GREY); doc.setLineWidth(0.25); doc.rect(ML, y, CW, rowH);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
        doc.text(r[0], ML + 2, y + 4); doc.text(r[1], ML + t + 2, y + 4); doc.text(r[2], ML + t * 2 + 2, y + 4);
        y += rowH;
    }); y += 2;

    // ════════════════════════════════
    // SECTION 4 — SHG/FPO
    // ════════════════════════════════
    y = secHeader('4. Samuh / Sangathan Judav (SHG/FPO)', y);
    doc.setFillColor(...ROW_ALT); doc.rect(ML, y, CW, rowH, 'F');
    doc.setDrawColor(...BORDER_GREY); doc.setLineWidth(0.25); doc.rect(ML, y, CW, rowH);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...GREY_TEXT);
    doc.text('SHG/FPO Sadasya:', ML + 2, y + 4);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK_TEXT);
    const shgVal = data.shgMember + (data.shgMember === 'हाँ' && data.shgName ? ' — ' + data.shgName : '');
    doc.text(shgVal, ML + 38, y + 4);
    y += rowH + 2;

    // ════════════════════════════════
    // SECTION 5 — Crops
    // ════════════════════════════════
    y = secHeader('5. Prastaavit Fasal Vivaran (Crop Details)', y);
    const c1 = ML, c2 = ML + 70, c3 = ML + 120;

    // Table header
    doc.setFillColor(...MID_GREEN);
    doc.rect(ML, y, CW, 6.5, 'F');
    doc.setTextColor(...WHITE);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5);
    doc.text('Fasal ka Naam', c1 + 2, y + 4.3);
    doc.text('Buwai Maah', c2 + 2, y + 4.3);
    doc.text('Katai Maah', c3 + 2, y + 4.3);
    doc.setDrawColor(...DARK_GREEN); doc.setLineWidth(0.3); doc.rect(ML, y, CW, 6.5); y += 6.5;

    doc.setTextColor(...DARK_TEXT);
    const crops = data.crops.length ? data.crops : [{ name: '', sowingMonth: '', harvestMonth: '' }];
    crops.forEach((crop, i) => {
        if (i % 2 === 0) { doc.setFillColor(...ROW_ALT); doc.rect(ML, y, CW, rowH, 'F'); }
        doc.setDrawColor(...BORDER_GREY); doc.setLineWidth(0.25); doc.rect(ML, y, CW, rowH);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
        doc.text((i + 1) + '. ' + (crop.name || ''), c1 + 2, y + 4);
        doc.text(crop.sowingMonth || '', c2 + 2, y + 4);
        doc.text(crop.harvestMonth || '', c3 + 2, y + 4);
        y += rowH;
    }); y += 2;

    // ════════════════════════════════
    // SECTION 6 — Previous Experience
    // ════════════════════════════════
    y = secHeader('6. Poorv Anubhav (Previous Experience)', y);
    doc.setFillColor(...ROW_ALT); doc.rect(ML, y, CW, rowH, 'F');
    doc.setDrawColor(...BORDER_GREY); doc.setLineWidth(0.25); doc.rect(ML, y, CW, rowH);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...GREY_TEXT);
    doc.text('Kya aapne pehle Aushadhiya Fasal ugaai hai?', ML + 2, y + 4);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(...DARK_TEXT);
    doc.text(data.previousMedicinal || '—', ML + 83, y + 4);
    y += rowH;
    if (data.previousMedicinal === 'हाँ' && data.prevExpDescription) {
        const lines = doc.splitTextToSize(data.prevExpDescription, CW - 6);
        const h = lines.length * 4 + 6;
        doc.setFillColor(...LIGHT_GREEN);
        doc.rect(ML, y, CW, h, 'F');
        doc.setDrawColor(...BORDER_GREY); doc.rect(ML, y, CW, h);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...DARK_TEXT);
        doc.text(lines, ML + 3, y + 4.5);
        y += h;
    }
    y += 2;

    // ════════════════════════════════
    // SECTION 7 — Terms & Conditions
    // ════════════════════════════════
    y = secHeader('7. Niyam Evam Shartein (Terms & Conditions)', y);
    const termsText = 'Main yah ghoshit karta/karti hun ki di gayi sabhi jaankaari satya hai. Main company ke nirdeshanusar kheti karunga/karungi aur gunvatta maankon ka paalan karunga/karungi. Utpaadit Aushadhiya Fasal ko prathamikta se company ko bechunga/bechungi. Yadi koi jaankaari galat payi jaati hai, to panjikaran nirasht kiya ja sakta hai.';
    const tLines = doc.splitTextToSize(termsText, CW - 8);
    const tH = tLines.length * 3.8 + 8;
    doc.setFillColor(248, 254, 248);
    doc.setDrawColor(...MID_GREEN);
    doc.setLineWidth(0.5);
    doc.rect(ML, y, CW, tH, 'FD');
    // Left accent
    doc.setFillColor(...MID_GREEN);
    doc.rect(ML, y, 2, tH, 'F');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.8); doc.setTextColor(...GREY_TEXT);
    doc.text(tLines, ML + 5, y + 5);
    y += tH + 3;

    // ════════════════════════════════
    // SECTION 8 — Signatures
    // ════════════════════════════════
    y = secHeader('8. Hastaakshar (Signatures)', y);
    y += 3;
    const sigW = (CW - 8) / 2;
    const sigH = 28; // fixed height

    doc.setFillColor(...LIGHT_GREEN);
    doc.setDrawColor(...MID_GREEN);
    doc.setLineWidth(0.4);
    doc.roundedRect(ML, y, sigW, sigH, 1.5, 1.5, 'FD');
    doc.roundedRect(ML + sigW + 8, y, sigW, sigH, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(...GREY_TEXT);
    doc.text('Naam: ' + data.fullName, ML + 3, y + sigH - 7);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5);
    doc.setDrawColor(...ACCENT_GOLD); doc.setLineWidth(0.5);
    doc.line(ML + sigW * 0.15, y + sigH - 9, ML + sigW * 0.85, y + sigH - 9);
    doc.line(ML + sigW + 8 + sigW * 0.15, y + sigH - 9, ML + sigW + 8 + sigW * 0.85, y + sigH - 9);

    doc.setTextColor(...GREY_TEXT);
    doc.text('Kisan Hastaakshar / Angutha Nishan', ML + sigW / 2, y + sigH + 4, { align: 'center' });
    doc.text('Company Pratinidhi', ML + sigW + 8 + sigW / 2, y + sigH + 4, { align: 'center' });

    // ════════════════════════════════
    // FOOTER BAND — pinned to bottom of A4
    // ════════════════════════════════
    doc.setFillColor(...DARK_GREEN);
    doc.rect(0, H - 10, W, 10, 'F');
    doc.setFillColor(...ACCENT_GOLD);
    doc.rect(0, H - 0.8, W, 0.8, 'F');
    doc.setTextColor(...WHITE);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5);
    doc.text('Submitted: ' + data.submittedAt + '   |   Reg No: ' + data.regNumber, W / 2, H - 3.8, { align: 'center' });

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
