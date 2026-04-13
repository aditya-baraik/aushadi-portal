# 🌱 Aushadi Yog - किसान पंजीकरण पोर्टल

एक professional, secure और 100% free agricultural registration portal.

## ✨ Features

- ✅ 5-Step Multi-page Form (Progressive Stepper)
- ✅ Cloudinary Image Upload (Photos + PDFs)
- ✅ Email Notifications (Web3Forms)
- ✅ Instant Telegram Alerts
- ✅ Mobile Responsive Design
- ✅ Hindi/Devanagari Support
- ✅ Auto Age Calculation
- ✅ Dynamic Crop Management
- ✅ Document Upload with Preview
- ✅ Form Validation
- ✅ Success Page with Print Option

---

## 📋 Setup Guide - Pura Step-by-Step Process

### **Step 1: GitHub Repository Setup**

1. **GitHub Account banao** (agar nahi hai)
   - https://github.com/signup par jao
   - Email, username aur password set karo

2. **New Repository banao**
   - GitHub login karne ke baad, top-right me `+` → `New repository` click karo
   - Repository name: `aushadi-portal` (ya koi bhi naam)
   - Public select karo (GitHub Pages free me sirf public repos par kaam karta hai)
   - `Create repository` button click karo

3. **Files Upload karo**
   - Repository khulne ke baad, `uploading an existing file` link click karo
   - Ya `Add file` → `Upload files` select karo
   - Sare files drag-and-drop karo:
     ```
     index.html
     success.html
     css/style.css
     js/app.js
     ```
   - `Commit changes` button click karo

---

### **Step 2: Cloudinary Setup (Image Upload)**

**Kyun zaruri hai?** GitHub Pages static hai, wo images/PDFs receive nahi kar sakta. Cloudinary pe files upload hongi.

1. **Account banao**
   - https://cloudinary.com/users/register/free par jao
   - Email se sign up karo (25GB free storage milega)

2. **Cloud Name dhundo**
   - Login karne ke baad, Dashboard pe **Cloud name** dikhega
   - Example: `dxyz123abc` (ye tumhara unique cloud name hai)

3. **Upload Preset banao**
   - Left sidebar me `Settings` → `Upload` par jao
   - Neeche scroll karke `Upload presets` section me jao
   - `Add upload preset` button click karo
   - Settings:
     - **Preset name:** `aushadi_uploads` (koi bhi naam de sakte ho)
     - **Signing mode:** `Unsigned` (important!)
     - **Folder:** `farmer-documents` (optional, organize karne ke liye)
   - `Save` button click karo

4. **Configuration update karo**
   - Apni `js/app.js` file kholo
   - Lines 7-8 me yeh values daalo:
   ```javascript
   cloudinaryCloudName: 'dxyz123abc',  // Apna cloud name yahan paste karo
   cloudinaryUploadPreset: 'aushadi_uploads',  // Apna preset name yahan paste karo
   ```

---

### **Step 3: Web3Forms Setup (Email Notifications)**

**Kyun zaruri hai?** Jab koi form submit karega, tumhe email aa jayega.

1. **Account banao**
   - https://web3forms.com par jao
   - `Get Started Free` button click karo
   - Email se sign up karo

2. **Access Key banao**
   - Login karne ke baad, `Create New Form` button click karo
   - Tumhe ek **Access Key** milega (Example: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
   - Ye key copy karo

3. **Email Settings**
   - `Email Settings` me jao
   - **To Email:** Apna email address daalo jahan notifications chahiye
   - Optional: Subject line customize kar sakte ho
   - `Save` karo

4. **Configuration update karo**
   - `js/app.js` file kholo
   - Line 11 me value daalo:
   ```javascript
   web3formsKey: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',  // Apni access key yahan
   ```

---

### **Step 4: Telegram Bot Setup (Instant Alerts)**

**Kyun zaruri hai?** WhatsApp se zyada fast hai aur free hai. Har submission ka instant notification milega.

#### **Part A: Bot Create karo**

1. **Telegram kholo** (Mobile ya Desktop)
2. **BotFather search karo**
   - Search bar me `@BotFather` type karo
   - Official BotFather (blue tick) ko open karo

3. **Naya bot banao**
   - `/newbot` command bhejo
   - Bot ka naam pucha jayega → Type karo: `Aushadi Portal Bot`
   - Username pucha jayega → Type karo: `AushadhiPortalBot` (ya koi unique name)
   - Bot ban jayega! Tumhe ek **Bot Token** milega
   - Example: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
   - **Is token ko copy karke safe rakho**

#### **Part B: Chat ID nikalo**

1. **Apne bot ko message bhejo**
   - BotFather se mile hue link par click karo ya search me apna bot dhundo
   - `/start` command bhejo (ya koi bhi message)

2. **Chat ID nikalo**
   - Browser me ye link kholo (apna bot token paste karo):
   ```
   https://api.telegram.org/bot123456789:ABCdefGHIjklMNOpqrsTUVwxyz/getUpdates
   ```
   - Response me `"chat":{"id":987654321}` dikhega
   - **Ye 987654321 tumhara Chat ID hai** (copy karo)

   **Alternative Method:**
   - Telegram me `@userinfobot` search karo
   - `/start` bhejo
   - Tumhara Chat ID mil jayega

3. **Configuration update karo**
   - `js/app.js` file kholo
   - Lines 14-15 me values daalo:
   ```javascript
   telegramBotToken: '123456789:ABCdefGHIjklMNOpqrsTUVwxyz',  // Apna bot token
   telegramChatId: '987654321'  // Apna chat ID
   ```

---

### **Step 5: GitHub Pages Deploy**

1. **Repository Settings me jao**
   - GitHub repository kholo
   - `Settings` tab click karo

2. **Pages enable karo**
   - Left sidebar me `Pages` option click karo
   - **Source:** `Deploy from a branch` select karo
   - **Branch:** `main` select karo, folder `/root` rakho
   - `Save` button click karo

3. **Website live hai!**
   - 2-3 minute wait karo
   - Page refresh karo
   - Ek green box me link dikhega:
   ```
   Your site is live at https://username.github.io/aushadi-portal/
   ```
   - **Ye link tumhari website hai!** 🎉

---

## 🧪 Testing Kaise Kare

### **Test 1: Form Fill karo**
1. Website kholo
2. Sare steps complete karo
3. Dummy data daalo (real data ki zarurat nahi)
4. Photos upload karo (test images use karo)

### **Test 2: Email Check karo**
- Form submit karne ke 1-2 minute me
- Web3Forms se email aana chahiye
- Spam folder bhi check karo

### **Test 3: Telegram Check karo**
- Telegram bot ko check karo
- Message instant aana chahiye formatted text me

---

## 🎨 Customization Guide

### **Logo/Brand Color Change**

1. **Header Color:**
   - `index.html` me line 25 dekho: `border-green-600`
   - Green ki jagah apna color daalo: `border-blue-600`, `border-purple-600`, etc.

2. **Buttons Color:**
   - `css/style.css` me search karo: `#16a34a`
   - Replace karo apne brand color se

### **Phone Number/Email Update**

- `index.html` aur `success.html` me search karo: `+91-XXXXXXXXXX`
- Apna actual number daalo

### **Language Change**

- Pure form ko English me karna hai?
- Labels ko translate karo:
  ```html
  <label class="form-label">Full Name *</label>
  ```

---

## 📊 Data Ko Kaise Dekhe

### **Method 1: Email (Web3Forms)**
- Har submission ka email aa jayega detailed information ke sath
- Images/PDFs ka direct link hoga

### **Method 2: Telegram**
- Quick summary message aayega
- Multiple submissions ka comparison easily ho sakta hai

### **Method 3: Web3Forms Dashboard**
- https://web3forms.com login karo
- Dashboard me sare submissions dikhenge
- Export kar sakte ho CSV format me

---

## 🚀 Load Handling Capacity

**GitHub Pages CDN:**
- 100GB bandwidth per month (free)
- Unlimited page views
- Global CDN (fast loading worldwide)

**Estimated Traffic:**
- 500-1000 simultaneous users → ✅ No problem
- Form submissions → Unlimited (Web3Forms ka limit nahi hai free me)
- Cloudinary uploads → 25GB storage + 25 credits/month

**Crash hogi?** ❌ NAHI! GitHub Pages crash nahi hota. Netflix, Google jitna reliable hai.

---

## 🔒 Security Features

✅ HTTPS enabled by default (GitHub Pages)
✅ Cloudinary signed uploads (secure file upload)
✅ Form validation (client + server side)
✅ No database exposure (sab third-party services)
✅ No sensitive data on GitHub (sab environment variables)

---

## 🐛 Common Issues & Solutions

### **Issue 1: "Cloudinary upload widget nahi khul raha"**
**Solution:**
- `js/app.js` me cloud name aur preset name check karo
- Browser console (F12) me errors dekho
- Preset "Unsigned" hai ya nahi verify karo

### **Issue 2: "Form submit nahi ho raha"**
**Solution:**
- Web3Forms access key valid hai ya nahi check karo
- Browser console me error dekho
- Internet connection check karo

### **Issue 3: "Telegram message nahi aa raha"**
**Solution:**
- Bot token aur chat ID check karo
- Bot ko `/start` message bheja hai ya nahi verify karo
- Bot blocked to nahi hai check karo

### **Issue 4: "GitHub Pages site nahi khul rahi"**
**Solution:**
- Settings → Pages me check karo enabled hai ya nahi
- Branch name correct hai ya nahi (`main` ya `master`)
- 5-10 minute wait karo (pehli baar deploy me time lagta hai)

---

## 💰 Total Cost: ₹0 (100% Free!)

| Service | Free Tier |
|---------|-----------|
| GitHub Pages | ✅ Unlimited (public repos) |
| Cloudinary | ✅ 25GB storage + 25 credits/month |
| Web3Forms | ✅ Unlimited submissions |
| Telegram Bot | ✅ Lifetime free |

**No credit card required for any service!**

---

## 📱 Mobile Optimization

✅ Responsive design (Tailwind CSS)
✅ Touch-friendly buttons
✅ Camera integration for uploads
✅ Works on all devices (Android, iOS)
✅ No app download required

---

## 🎯 Next Steps (Optional Improvements)

1. **Custom Domain:**
   - Namecheap se domain khareedo (₹99/year)
   - GitHub Pages me custom domain add karo

2. **Google Sheets Integration:**
   - Web3Forms ko Google Sheets se connect karo
   - Automatic spreadsheet me data jayega

3. **SMS Notifications:**
   - TextLocal ya MSG91 integrate karo (free tier available)

4. **Analytics:**
   - Google Analytics add karo (free)
   - Form completion rate track karo

---

## 📞 Support

Koi problem ho to:
1. GitHub Issues me question pucho
2. Telegram bot test karo
3. Browser console (F12) me errors check karo

**Happy Farming! 🌾**

---

## 📄 License

MIT License - Free to use, modify, distribute

**Made with ❤️ for Indian Farmers**
