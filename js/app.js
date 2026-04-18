// ==========================================
// CONFIGURATION - YE VALUES CHANGE KARNA
// ==========================================

const CONFIG = {
    // Telegram Bot Settings (Create bot: https://t.me/BotFather)
    telegramBotToken: '8596686665:AAHwdJoL70SUHNZMDNi1lwRocCAEYigJwuU',       // Replace with your bot token
    telegramChatId: '-1003880115435'            // Replace with your chat ID
};

// ==========================================
// GLOBAL VARIABLES
// ==========================================

let currentStep = 1;
const totalSteps = 5;
let photoDataUrl = null; // Stores base64 photo

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    initializeCropManagement();
    initializePhotoUpload();
    initializeDOBAutoAge();
    initializePrevExpToggle();
});

// ==========================================
// PHOTO UPLOAD (Local, max 500KB)
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
        };
        reader.readAsDataURL(file);
    });
}

function clearPhoto() {
    photoDataUrl = null;
    document.getElementById('photoInput').value = '';
    document.getElementById('photoPreviewBox').style.display = 'none';
    document.getElementById('photoUploadArea').style.display = 'block';
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
// FORM STEP NAVIGATION
// ==========================================

function initializeForm() {
    document.getElementById('nextBtn').addEventListener('click', () => {
        if (validateCurrentStep()) {
            if (currentStep < totalSteps) {
                currentStep++;
                updateFormDisplay();
            }
        }
    });

    document.getElementById('prevBtn').addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateFormDisplay();
        }
    });

    document.getElementById('registrationForm').addEventListener('submit', handleFormSubmit);
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

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateCurrentStep() {
    const currentStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const inputs = currentStepEl.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (input.type === 'checkbox') {
            if (!input.checked) {
                isValid = false;
                input.parentElement.style.color = '#ef4444';
            } else {
                input.parentElement.style.color = '';
            }
            return;
        }
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('border-red-500');
            if (!input.nextElementSibling || !input.nextElementSibling.classList.contains('error-message')) {
                const error = document.createElement('p');
                error.className = 'error-message text-red-500 text-sm mt-1';
                error.textContent = 'यह फील्ड आवश्यक है';
                input.parentNode.insertBefore(error, input.nextSibling);
            }
        } else {
            input.classList.remove('border-red-500');
            const errorMsg = input.nextElementSibling;
            if (errorMsg && errorMsg.classList.contains('error-message')) errorMsg.remove();
        }
    });

    // Step 5: photo required
    if (currentStep === 5) {
        if (!photoDataUrl) {
            isValid = false;
            showNotification('कृपया पासपोर्ट साइज फोटो अपलोड करें', 'error');
        }
    }

    if (!isValid && currentStep !== 5) {
        showNotification('कृपया सभी आवश्यक फील्ड भरें', 'error');
    }

    return isValid;
}

// ==========================================
// CROP MANAGEMENT
// ==========================================

function initializeCropManagement() {
    document.getElementById('addCropBtn').addEventListener('click', () => {
        const cropEntry = document.createElement('div');
        cropEntry.className = 'crop-entry bg-gray-50 rounded-lg p-4 mb-4';
        cropEntry.innerHTML = `
            <button type="button" class="remove-crop" onclick="this.parentElement.remove()">×</button>
            <div class="grid md:grid-cols-3 gap-4">
                <div class="form-group">
                    <label class="form-label">फसल का नाम *</label>
                    <input type="text" name="cropName[]" required class="form-input" placeholder="जैसे: अश्वगंधा">
                </div>
                <div class="form-group">
                    <label class="form-label">बुवाई माह *</label>
                    <input type="text" name="sowingMonth[]" required class="form-input" placeholder="जैसे: जून-जुलाई">
                </div>
                <div class="form-group">
                    <label class="form-label">कटाई माह *</label>
                    <input type="text" name="harvestMonth[]" required class="form-input" placeholder="जैसे: फरवरी-मार्च">
                </div>
            </div>`;
        document.getElementById('cropsContainer').appendChild(cropEntry);
    });
}

// ==========================================
// FORM SUBMIT HANDLER
// ==========================================

async function handleFormSubmit(e) {
    e.preventDefault();

    if (!validateCurrentStep()) return;

    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const submitLoader = document.getElementById('submitLoader');

    submitBtn.disabled = true;
    submitText.style.display = 'none';
    submitLoader.style.display = 'inline';

    try {
        const formData = collectFormData();
        const pdfBlob = await generatePDF(formData);
        await sendPDFToTelegram(pdfBlob, formData);
        window.location.href = 'success.html';
    } catch (error) {
        console.error('Submission error:', error);
        showNotification('फॉर्म जमा करने में त्रुटि हुई। कृपया पुनः प्रयास करें। ' + error.message, 'error');
        submitBtn.disabled = false;
        submitText.style.display = 'inline';
        submitLoader.style.display = 'none';
    }
}

// ==========================================
// COLLECT FORM DATA
// ==========================================

function collectFormData() {
    const fd = new FormData(document.getElementById('registrationForm'));

    const cropNames = fd.getAll('cropName[]');
    const sowingMonths = fd.getAll('sowingMonth[]');
    const harvestMonths = fd.getAll('harvestMonth[]');
    const crops = cropNames.map((name, i) => ({
        name,
        sowingMonth: sowingMonths[i] || '',
        harvestMonth: harvestMonths[i] || ''
    }));

    const today = new Date();
    const regDate = `${String(today.getDate()).padStart(2,'0')} / ${String(today.getMonth()+1).padStart(2,'0')} / ${today.getFullYear()}`;

    return {
        regNumber: generateRegNumber(),
        regDate,
        fullName: fd.get('fullName') || '',
        fatherName: fd.get('fatherName') || '',
        gender: fd.get('gender') || '',
        dob: fd.get('dob') ? formatDate(fd.get('dob')) : '',
        age: fd.get('age') || '',
        phone: fd.get('phone') || '',
        aadharNumber: fd.get('aadharNumber') || '',
        bankAccount: fd.get('bankAccount') || '',
        ifscCode: fd.get('ifscCode') || '',
        village: fd.get('village') || '',
        panchayat: fd.get('panchayat') || '',
        block: fd.get('block') || '',
        district: fd.get('district') || '',
        state: fd.get('state') || '',
        irrigatedArea: fd.get('irrigatedArea') || '0',
        irrigatedOwnership: fd.get('irrigatedOwnership') || '',
        unirrigatedArea: fd.get('unirrigatedArea') || '0',
        unirrigatedOwnership: fd.get('unirrigatedOwnership') || 'लागू नहीं',
        shgMember: fd.get('shgMember') || '',
        shgName: fd.get('shgName') || '',
        crops,
        previousMedicinal: fd.get('previousMedicinal') || '',
        prevExpDescription: fd.get('prevExpDescription') || '',
        photo: photoDataUrl,
        submittedAt: new Date().toLocaleString('hi-IN', { timeZone: 'Asia/Kolkata' })
    };
}

function generateRegNumber() {
    const now = new Date();
    return `AY${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
}

// ==========================================
// PDF GENERATION (matching form format)
// ==========================================

async function generatePDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const W = 210; // page width
    const margin = 15;
    let y = 15;

    // ---- Helper functions ----
    function addLine(yPos) {
        doc.setDrawColor(180, 180, 180);
        doc.line(margin, yPos, W - margin, yPos);
    }

    function sectionTitle(text, yPos) {
        doc.setFillColor(22, 163, 74);
        doc.rect(margin, yPos, W - margin*2, 7, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(text, margin + 3, yPos + 5);
        doc.setTextColor(0, 0, 0);
        return yPos + 10;
    }

    function field(label, value, xL, yF, wL, wV) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(label, xL, yF);
        doc.setFont('helvetica', 'normal');
        const valX = xL + wL + 1;
        doc.text(String(value || ''), valX, yF, { maxWidth: wV });
        doc.setDrawColor(180,180,180);
        doc.line(valX, yF + 0.5, valX + wV, yF + 0.5);
    }

    function checkPage(neededSpace) {
        if (y + neededSpace > 270) {
            doc.addPage();
            y = 15;
        }
    }

    // ===== HEADER =====
    // Green top bar
    doc.setFillColor(22, 163, 74);
    doc.rect(0, 0, W, 18, 'F');
    doc.setTextColor(255,255,255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Aushadhiyog Pvt. Ltd.', W/2, 7, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('E-mail: aushadhiyog@gmail.com | Contact: 7250915077 | NH-23, Palkoat Road, Gumla', W/2, 13, { align: 'center' });
    doc.setTextColor(0,0,0);

    y = 22;

    // Form title
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 80, 22);
    doc.text('KISAN PANJIKARAN PRAPATRA', W/2, y, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(80,80,80);
    doc.text('(Aushadhiya evam Sugandhi Fasal - Anubandhi Kheti Hetu)', W/2, y+5, { align: 'center' });
    doc.setTextColor(0,0,0);
    y += 12;

    addLine(y); y += 4;

    // Reg number & date — with photo box on right
    const photoBoxX = W - margin - 28;
    const photoBoxY = y;
    const photoBoxW = 28;
    const photoBoxH = 36;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Panjikaran Sankhya:', margin, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.text(data.regNumber, margin + 32, y + 4);

    doc.setFont('helvetica', 'bold');
    doc.text('Panjikaran Tithi:', margin, y + 10);
    doc.setFont('helvetica', 'normal');
    doc.text(data.regDate, margin + 28, y + 10);

    // Passport photo box
    doc.setDrawColor(100,100,100);
    doc.setLineWidth(0.5);
    doc.rect(photoBoxX, photoBoxY, photoBoxW, photoBoxH);
    if (data.photo) {
        try {
            doc.addImage(data.photo, 'JPEG', photoBoxX + 0.5, photoBoxY + 0.5, photoBoxW - 1, photoBoxH - 1);
        } catch(e) {
            doc.setFontSize(7);
            doc.setTextColor(150,150,150);
            doc.text('Photo', photoBoxX + photoBoxW/2, photoBoxY + photoBoxH/2, { align: 'center' });
            doc.setTextColor(0,0,0);
        }
    } else {
        doc.setFontSize(7);
        doc.setTextColor(150,150,150);
        doc.text('Passport', photoBoxX + photoBoxW/2, photoBoxY + photoBoxH/2 - 2, { align: 'center' });
        doc.text('Photo', photoBoxX + photoBoxW/2, photoBoxY + photoBoxH/2 + 3, { align: 'center' });
        doc.setTextColor(0,0,0);
    }
    doc.setFontSize(7);
    doc.text('Passport Size Photo', photoBoxX + photoBoxW/2, photoBoxY + photoBoxH + 4, { align: 'center' });

    y += photoBoxH + 8;

    // ===== SECTION 1: Personal Details =====
    y = sectionTitle('3. Kisan ka Vyaktigat Vivaran (Personal Details)', y);

    const col1X = margin;
    const col2X = W/2 + 5;
    const labelW = 28;
    const valW = 60;

    // Row 1
    field('Naam:', data.fullName, col1X, y, labelW, valW);
    y += 7;
    field('Pita/Pati ka Naam:', data.fatherName, col1X, y, labelW, valW);
    y += 7;

    // Row 2 - Gender, DOB, Age in one row
    field('Ling:', data.gender, col1X, y, 12, 28);
    field('Janm Tithi:', data.dob, col1X + 45, y, 20, 25);
    field('Aayu:', data.age + ' Varsh', col1X + 45 + 50, y, 12, 20);
    y += 7;

    field('Mobile Number:', data.phone, col1X, y, labelW, valW);
    y += 7;
    field('Aadhar Sankhya:', data.aadharNumber, col1X, y, labelW, valW);
    y += 7;
    field('Bank Khata Sankhya:', data.bankAccount, col1X, y, labelW, valW);
    field('IFSC Code:', data.ifscCode, col2X, y, 20, 40);
    y += 9;

    // ===== SECTION 2: Address =====
    checkPage(40);
    y = sectionTitle('4. Pata Vivaran (Address Details)', y);

    field('Gram:', data.village, col1X, y, 12, 55);
    field('Panchayat:', data.panchayat, col2X, y, 22, 40);
    y += 7;
    field('Prakhanda:', data.block, col1X, y, 20, 47);
    field('Jila:', data.district, col2X, y, 12, 50);
    y += 7;
    field('Rajya:', data.state, col1X, y, 14, 60);
    y += 9;

    // ===== SECTION 3: Land Details =====
    checkPage(50);
    y = sectionTitle('5. Bhoomi Vivaran (Land Details)', y);

    // Table header
    doc.setFillColor(240, 253, 244);
    doc.rect(margin, y, W - margin*2, 6, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    const col = [margin, margin+45, margin+80, margin+115];
    doc.text('Bhoomi Prakar', col[0]+1, y+4);
    doc.text('Kshetra (Acre)', col[1]+1, y+4);
    doc.text('Swamitva', col[2]+1, y+4);
    doc.setDrawColor(180,180,180);
    doc.rect(margin, y, W - margin*2, 6);
    y += 6;

    // Row: Sinchai
    doc.setFont('helvetica', 'normal');
    doc.rect(margin, y, W - margin*2, 6);
    doc.text('Sinchai (Irrigated)', col[0]+1, y+4);
    doc.text(data.irrigatedArea, col[1]+1, y+4);
    doc.text(data.irrigatedOwnership, col[2]+1, y+4);
    y += 6;

    // Row: Asinchai
    doc.rect(margin, y, W - margin*2, 6);
    doc.text('Asinchai (Unirrigated)', col[0]+1, y+4);
    doc.text(data.unirrigatedArea, col[1]+1, y+4);
    doc.text(data.unirrigatedOwnership, col[2]+1, y+4);
    y += 9;

    // ===== SECTION 4: SHG/FPO =====
    checkPage(20);
    y = sectionTitle('8. Samuh / Sangathan Judav (SHG/FPO)', y);
    field('SHG/FPO Sadasya:', data.shgMember, col1X, y, 32, 20);
    if (data.shgMember === 'हाँ' && data.shgName) {
        field('Naam:', data.shgName, col2X, y, 12, 55);
    }
    y += 9;

    // ===== SECTION 5: Crop Details =====
    checkPage(30 + data.crops.length * 7);
    y = sectionTitle('6. Prastaavit Fasal Vivaran (Crop Details)', y);

    // Table header
    doc.setFillColor(240, 253, 244);
    doc.rect(margin, y, W - margin*2, 6, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    const cropCols = [margin, margin+60, margin+100, margin+140];
    doc.text('Fasal ka Naam', cropCols[0]+1, y+4);
    doc.text('Buwai Maah', cropCols[1]+1, y+4);
    doc.text('Katai Maah', cropCols[2]+1, y+4);
    doc.setDrawColor(180,180,180);
    doc.rect(margin, y, W - margin*2, 6);
    y += 6;

    doc.setFont('helvetica', 'normal');
    data.crops.forEach((crop, i) => {
        checkPage(7);
        doc.rect(margin, y, W - margin*2, 6);
        doc.text(String(i+1) + '. ' + (crop.name || ''), cropCols[0]+1, y+4);
        doc.text(crop.sowingMonth || '', cropCols[1]+1, y+4);
        doc.text(crop.harvestMonth || '', cropCols[2]+1, y+4);
        y += 6;
    });
    y += 4;

    // ===== SECTION 6: Previous Experience =====
    checkPage(20);
    y = sectionTitle('7. Poorv Anubhav (Previous Experience)', y);
    field('Kya aapne pehle Aushadhiya Fasal ugaai hai?', data.previousMedicinal, col1X, y, 82, 20);
    y += 7;
    if (data.previousMedicinal === 'हाँ' && data.prevExpDescription) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Vivaran:', col1X, y);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(data.prevExpDescription, W - margin*2 - 25);
        doc.text(lines, col1X + 20, y);
        y += lines.length * 5 + 2;
    }
    y += 3;

    // ===== SECTION 7: Consent =====
    checkPage(35);
    y = sectionTitle('9. Utpadan evam Vipanan Sahmati (Consent)', y);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    const consentLines = [
        '✔ Company ke nirdeshanusar kheti karunga/karungi',
        '✔ Gunvatta maankon ka paalan karunga/karungi',
        '✔ Utpada ko praathamikta se Company ko bechunga/bechungi'
    ];
    consentLines.forEach(line => {
        doc.text(line, col1X + 2, y);
        y += 5;
    });
    y += 3;

    // ===== SECTION 8: Documents List =====
    checkPage(30);
    y = sectionTitle('10. Aavashyak Dastavej (Required Documents)', y);
    doc.setFontSize(8);
    ['☐ Aadhar Card', '☐ Bank Passbook', '☐ Bhoomi Dastavej / Lease Agreement', '☐ Photo'].forEach(item => {
        doc.text(item, col1X + 2, y);
        y += 5;
    });
    y += 4;

    // ===== SECTION 9: Declaration =====
    checkPage(30);
    y = sectionTitle('11. Ghoshana (Declaration)', y);
    doc.setFontSize(7.5);
    const declText = 'Main yah ghoshit karta/karti hun ki di gayi sabhi jaankaari satya hai. Yadi koi jaankaari galat payi jaati hai, to panjikaran nirasht kiya ja sakta hai.';
    const declLines = doc.splitTextToSize(declText, W - margin*2 - 4);
    doc.text(declLines, col1X + 2, y);
    y += declLines.length * 4 + 6;

    // ===== SECTION 10: Signatures =====
    checkPage(30);
    y = sectionTitle('12. Hastaakshar (Signatures)', y);
    y += 8;

    // Two boxes for signatures
    const sigW = (W - margin*2 - 10) / 2;
    doc.setDrawColor(120,120,120);
    doc.rect(margin, y, sigW, 20);
    doc.rect(margin + sigW + 10, y, sigW, 20);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Kisan Hastaakshar / Angutha Nishan', margin + sigW/2, y + 25, { align: 'center' });
    doc.text('Naam: ' + data.fullName, margin + 2, y + 23);
    doc.text('Company Pratinidhi', margin + sigW + 10 + sigW/2, y + 25, { align: 'center' });
    y += 30;

    // Footer
    checkPage(12);
    doc.setFillColor(27, 58, 26);
    doc.rect(0, y, W, 10, 'F');
    doc.setTextColor(255,255,255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`Submitted: ${data.submittedAt} | Reg No: ${data.regNumber}`, W/2, y + 6, { align: 'center' });

    return doc.output('blob');
}

// ==========================================
// SEND PDF TO TELEGRAM
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
        `🪪 *Aadhar:* ${data.aadharNumber}\n` +
        `🏦 *Bank:* ${data.bankAccount} | IFSC: ${data.ifscCode}\n` +
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
        // Don't fail the whole submission if Telegram fails
        showNotification('Telegram notification fail hua, lekin form jama ho gaya', 'info');
    }
}

// ==========================================
// NOTIFICATION
// ==========================================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ${
        type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' :
        'bg-blue-500'
    } text-white max-w-xs`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => { notification.style.transform = 'translateX(0)'; }, 10);
    setTimeout(() => {
        notification.style.transform = 'translateX(500px)';
        setTimeout(() => { if (document.body.contains(notification)) document.body.removeChild(notification); }, 300);
    }, 5000);
}
