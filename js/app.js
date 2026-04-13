// ==========================================
// CONFIGURATION - YE VALUES CHANGE KARNA
// ==========================================

const CONFIG = {
    // Cloudinary Settings (Sign up: https://cloudinary.com/users/register/free)
    cloudinaryCloudName: 'YOUR_CLOUD_NAME',  // Replace with your cloud name
    cloudinaryUploadPreset: 'YOUR_UPLOAD_PRESET',  // Replace with your upload preset
    
    // Web3Forms Access Key (Sign up: https://web3forms.com)
    web3formsKey: 'YOUR_WEB3FORMS_ACCESS_KEY',  // Replace with your access key
    
    // Telegram Bot Settings (Create bot: https://t.me/BotFather)
    telegramBotToken: 'YOUR_BOT_TOKEN',  // Replace with your bot token
    telegramChatId: 'YOUR_CHAT_ID'  // Replace with your chat ID
};

// ==========================================
// GLOBAL VARIABLES
// ==========================================

let currentStep = 1;
const totalSteps = 5;
let uploadedFiles = {
    aadharFront: null,
    aadharBack: null,
    landDoc: null,
    photo: null
};

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    initializeUploadAreas();
    initializeCropManagement();
});

// ==========================================
// FORM STEP NAVIGATION
// ==========================================

function initializeForm() {
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const submitBtn = document.getElementById('submitBtn');
    const form = document.getElementById('registrationForm');
    
    nextBtn.addEventListener('click', () => {
        if (validateCurrentStep()) {
            if (currentStep < totalSteps) {
                currentStep++;
                updateFormDisplay();
            }
        }
    });
    
    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateFormDisplay();
        }
    });
    
    form.addEventListener('submit', handleFormSubmit);
}

function updateFormDisplay() {
    // Update form steps
    document.querySelectorAll('.form-step').forEach((step, index) => {
        step.classList.toggle('active', index + 1 === currentStep);
    });
    
    // Update step indicators
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
    
    // Update progress lines
    document.querySelectorAll('.progress-line').forEach((line, index) => {
        line.classList.toggle('active', index < currentStep - 1);
    });
    
    // Update button visibility
    document.getElementById('prevBtn').style.display = currentStep === 1 ? 'none' : 'block';
    document.getElementById('nextBtn').style.display = currentStep === totalSteps ? 'none' : 'block';
    document.getElementById('submitBtn').style.display = currentStep === totalSteps ? 'block' : 'none';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateCurrentStep() {
    const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const inputs = currentStepElement.querySelectorAll('input[required], select[required], textarea[required]');
    
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('border-red-500');
            
            // Show error message
            if (!input.nextElementSibling || !input.nextElementSibling.classList.contains('error-message')) {
                const error = document.createElement('p');
                error.className = 'error-message text-red-500 text-sm mt-1';
                error.textContent = 'यह फील्ड आवश्यक है';
                input.parentNode.insertBefore(error, input.nextSibling);
            }
        } else {
            input.classList.remove('border-red-500');
            const errorMsg = input.nextElementSibling;
            if (errorMsg && errorMsg.classList.contains('error-message')) {
                errorMsg.remove();
            }
        }
    });
    
    // Special validation for step 5 (documents)
    if (currentStep === 5) {
        const requiredUploads = ['aadharFront', 'aadharBack', 'landDoc', 'photo'];
        requiredUploads.forEach(upload => {
            if (!uploadedFiles[upload]) {
                isValid = false;
                showNotification('कृपया सभी आवश्यक दस्तावेज़ अपलोड करें', 'error');
            }
        });
    }
    
    if (!isValid) {
        showNotification('कृपया सभी आवश्यक फील्ड भरें', 'error');
    }
    
    return isValid;
}

// ==========================================
// CLOUDINARY FILE UPLOAD
// ==========================================

function initializeUploadAreas() {
    const uploadAreas = {
        aadharFront: document.getElementById('aadharFront'),
        aadharBack: document.getElementById('aadharBack'),
        landDoc: document.getElementById('landDoc'),
        photo: document.getElementById('photo')
    };
    
    Object.keys(uploadAreas).forEach(key => {
        uploadAreas[key].addEventListener('click', () => openCloudinaryWidget(key));
    });
}

function openCloudinaryWidget(uploadType) {
    // Cloudinary Upload Widget
    const widget = cloudinary.createUploadWidget({
        cloudName: CONFIG.cloudinaryCloudName,
        uploadPreset: CONFIG.cloudinaryUploadPreset,
        sources: ['local', 'camera'],
        multiple: false,
        maxFileSize: 5000000, // 5MB
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
        language: 'hi',
        text: {
            'hi': {
                'or': 'या',
                'menu': {
                    'files': 'फोटो चुनें',
                    'camera': 'कैमरा'
                }
            }
        }
    }, (error, result) => {
        if (error) {
            showNotification('अपलोड में त्रुटि हुई', 'error');
            console.error('Upload error:', error);
            return;
        }
        
        if (result.event === 'success') {
            const uploadArea = document.getElementById(uploadType);
            uploadArea.classList.add('uploaded');
            uploadArea.innerHTML = `
                <div class="upload-success">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>अपलोड सफल</span>
                </div>
                <p class="text-xs text-gray-500 mt-2">${result.info.original_filename}</p>
            `;
            
            // Store the URL
            uploadedFiles[uploadType] = result.info.secure_url;
            document.querySelector(`input[name="${uploadType}Url"]`).value = result.info.secure_url;
            
            showNotification('फाइल सफलतापूर्वक अपलोड हुई', 'success');
        }
    });
    
    widget.open();
}

// ==========================================
// CROP MANAGEMENT
// ==========================================

function initializeCropManagement() {
    const addCropBtn = document.getElementById('addCropBtn');
    const cropsContainer = document.getElementById('cropsContainer');
    
    addCropBtn.addEventListener('click', () => {
        const cropEntry = document.createElement('div');
        cropEntry.className = 'crop-entry bg-gray-50 rounded-lg p-4 mb-4';
        cropEntry.innerHTML = `
            <button type="button" class="remove-crop" onclick="this.parentElement.remove()">×</button>
            <div class="grid md:grid-cols-3 gap-4">
                <div class="form-group md:col-span-1">
                    <label class="form-label">पौधे का नाम *</label>
                    <input type="text" name="cropName[]" required class="form-input" placeholder="जैसे: अश्वगंधा">
                </div>
                
                <div class="form-group">
                    <label class="form-label">मात्रा *</label>
                    <input type="number" name="cropQuantity[]" required step="0.01" min="0.01" class="form-input" placeholder="संख्या">
                </div>
                
                <div class="form-group">
                    <label class="form-label">इकाई *</label>
                    <select name="cropUnit[]" required class="form-input">
                        <option value="">चुनें</option>
                        <option value="kg">किलोग्राम (Kg)</option>
                        <option value="quintal">क्विंटल (Quintal)</option>
                        <option value="tonne">टन (Tonne)</option>
                    </select>
                </div>
            </div>
        `;
        cropsContainer.appendChild(cropEntry);
    });
}

// ==========================================
// FORM SUBMISSION
// ==========================================

async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
        return;
    }
    
    // Show loading state
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const submitLoader = document.getElementById('submitLoader');
    
    submitBtn.disabled = true;
    submitText.style.display = 'none';
    submitLoader.style.display = 'inline';
    
    try {
        // Collect form data
        const formData = collectFormData();
        
        // Send to Web3Forms
        await sendToWeb3Forms(formData);
        
        // Send to Telegram
        await sendToTelegram(formData);
        
        // Redirect to success page
        window.location.href = 'success.html';
        
    } catch (error) {
        console.error('Submission error:', error);
        showNotification('फॉर्म जमा करने में त्रुटि हुई। कृपया पुनः प्रयास करें।', 'error');
        
        submitBtn.disabled = false;
        submitText.style.display = 'inline';
        submitLoader.style.display = 'none';
    }
}

function collectFormData() {
    const form = document.getElementById('registrationForm');
    const formData = new FormData(form);
    
    // Collect crop data
    const cropNames = formData.getAll('cropName[]');
    const cropQuantities = formData.getAll('cropQuantity[]');
    const cropUnits = formData.getAll('cropUnit[]');
    
    const crops = cropNames.map((name, index) => ({
        name: name,
        quantity: cropQuantities[index],
        unit: cropUnits[index]
    }));
    
    // Create structured data object
    const data = {
        // Personal Info
        fullName: formData.get('fullName'),
        dob: formData.get('dob'),
        age: formData.get('age'),
        gender: formData.get('gender'),
        fatherName: formData.get('fatherName'),
        
        // Contact Details
        phone: formData.get('phone'),
        alternatePhone: formData.get('alternatePhone') || 'N/A',
        email: formData.get('email') || 'N/A',
        address: formData.get('address'),
        district: formData.get('district'),
        state: formData.get('state'),
        pincode: formData.get('pincode'),
        
        // Agricultural Details
        totalLand: formData.get('totalLand'),
        irrigation: formData.get('irrigation'),
        purpose: formData.get('purpose'),
        experience: formData.get('experience'),
        previousMedicinal: formData.get('previousMedicinal'),
        
        // Crops
        crops: crops,
        
        // Documents
        documents: uploadedFiles,
        
        // Metadata
        submittedAt: new Date().toLocaleString('hi-IN', { timeZone: 'Asia/Kolkata' })
    };
    
    return data;
}

async function sendToWeb3Forms(data) {
    // Prepare email body
    let emailBody = `
🌱 नया किसान पंजीकरण
━━━━━━━━━━━━━━━━━━━━

📋 व्यक्तिगत जानकारी:
नाम: ${data.fullName}
जन्म तिथि: ${data.dob}
उम्र: ${data.age} वर्ष
लिंग: ${data.gender}
पिता/पति का नाम: ${data.fatherName}

📞 संपर्क विवरण:
मोबाइल: ${data.phone}
वैकल्पिक नंबर: ${data.alternatePhone}
ईमेल: ${data.email}
पता: ${data.address}
जिला: ${data.district}
राज्य: ${data.state}
पिन कोड: ${data.pincode}

🌾 कृषि विवरण:
कुल भूमि: ${data.totalLand} एकड़
सिंचाई: ${data.irrigation}
अनुभव: ${data.experience} वर्ष
पिछला औषधीय अनुभव: ${data.previousMedicinal}
उद्देश्य: ${data.purpose}

🌿 फसल विवरण:
`;

    data.crops.forEach((crop, index) => {
        emailBody += `${index + 1}. ${crop.name} - ${crop.quantity} ${crop.unit}\n`;
    });

    emailBody += `
📎 दस्तावेज़:
आधार (आगे): ${data.documents.aadharFront}
आधार (पीछे): ${data.documents.aadharBack}
भूमि दस्तावेज़: ${data.documents.landDoc}
फोटो: ${data.documents.photo}

⏰ जमा किया गया: ${data.submittedAt}
`;

    const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            access_key: CONFIG.web3formsKey,
            subject: `🌱 नया किसान पंजीकरण: ${data.fullName}`,
            from_name: 'Aushadi Yog Portal',
            message: emailBody
        })
    });
    
    if (!response.ok) {
        throw new Error('Web3Forms submission failed');
    }
    
    return response.json();
}

async function sendToTelegram(data) {
    let message = `🌱 *नया किसान पंजीकरण*\n━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `👤 *नाम:* ${data.fullName}\n`;
    message += `📱 *मोबाइल:* ${data.phone}\n`;
    message += `📧 *ईमेल:* ${data.email}\n`;
    message += `📍 *स्थान:* ${data.district}, ${data.state}\n\n`;
    message += `🌾 *कुल भूमि:* ${data.totalLand} एकड़\n`;
    message += `💧 *सिंचाई:* ${data.irrigation}\n\n`;
    message += `🌿 *फसलें:*\n`;
    
    data.crops.forEach((crop, index) => {
        message += `  ${index + 1}. ${crop.name} - ${crop.quantity} ${crop.unit}\n`;
    });
    
    message += `\n⏰ *समय:* ${data.submittedAt}`;
    
    const response = await fetch(`https://api.telegram.org/bot${CONFIG.telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: CONFIG.telegramChatId,
            text: message,
            parse_mode: 'Markdown'
        })
    });
    
    if (!response.ok) {
        console.error('Telegram notification failed');
        // Don't throw error - form should still submit even if Telegram fails
    }
    
    return response.json();
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    } text-white`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

// Auto-calculate age from DOB
document.addEventListener('DOMContentLoaded', function() {
    const dobInput = document.querySelector('input[name="dob"]');
    const ageInput = document.querySelector('input[name="age"]');
    
    if (dobInput && ageInput) {
        dobInput.addEventListener('change', function() {
            const dob = new Date(this.value);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                age--;
            }
            
            ageInput.value = age;
        });
    }
});
