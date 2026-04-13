# ✅ Quick Setup Checklist

Iss file ko follow karo step-by-step. Har step complete hone par checkbox tick karo.

## 🎯 Pre-requisites

- [ ] GitHub account hai
- [ ] Email address hai (Gmail/Yahoo/any)
- [ ] Telegram app installed hai

---

## 📝 Setup Steps

### 1️⃣ Cloudinary Setup (5 minutes)
- [ ] https://cloudinary.com/users/register/free par account banaya
- [ ] Dashboard se **Cloud Name** copy kiya
- [ ] Upload Preset banaya (Unsigned mode)
- [ ] `js/app.js` me lines 7-8 update kiye

**Values to fill:**
```javascript
cloudinaryCloudName: 'YOUR_CLOUD_NAME_HERE',
cloudinaryUploadPreset: 'YOUR_PRESET_NAME_HERE',
```

---

### 2️⃣ Web3Forms Setup (3 minutes)
- [ ] https://web3forms.com par account banaya
- [ ] Access Key generate kiya
- [ ] Email settings configure kiye
- [ ] `js/app.js` me line 11 update kiya

**Value to fill:**
```javascript
web3formsKey: 'YOUR_ACCESS_KEY_HERE',
```

---

### 3️⃣ Telegram Bot Setup (5 minutes)
- [ ] Telegram me @BotFather search kiya
- [ ] `/newbot` command bheja
- [ ] Bot ka naam aur username set kiya
- [ ] Bot Token copy kiya
- [ ] Apne bot ko message bheja
- [ ] Chat ID nikala (method 1 ya 2 use karke)
- [ ] `js/app.js` me lines 14-15 update kiye

**Values to fill:**
```javascript
telegramBotToken: 'YOUR_BOT_TOKEN_HERE',
telegramChatId: 'YOUR_CHAT_ID_HERE',
```

**Chat ID kaise nikale:**

Method 1 (Easy):
1. Telegram me `@userinfobot` search karo
2. `/start` bhejo
3. Chat ID mil jayega

Method 2 (API):
1. Browser me ye URL kholo (apna bot token daalo):
   `https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates`
2. Response me `"chat":{"id":123456}` dhundo
3. Wahi tumhara Chat ID hai

---

### 4️⃣ GitHub Repository Setup (5 minutes)
- [ ] GitHub par login kiya
- [ ] New repository banaya (name: `aushadi-portal`)
- [ ] Repository public set kiya
- [ ] Sare files upload kiye:
  - [ ] index.html
  - [ ] success.html
  - [ ] css/style.css
  - [ ] js/app.js
  - [ ] README.md
- [ ] Commit kiya

---

### 5️⃣ GitHub Pages Deploy (2 minutes)
- [ ] Repository Settings me gaya
- [ ] Pages section khola
- [ ] Source: `Deploy from a branch` select kiya
- [ ] Branch: `main` select kiya
- [ ] Save kiya
- [ ] 2-3 minutes wait kiya
- [ ] Website link copy kiya

**Your website:** `https://YOUR_USERNAME.github.io/aushadi-portal/`

---

## 🧪 Testing Checklist

- [ ] Website khuli properly
- [ ] Form ka Step 1 dikha
- [ ] Next button se Step 2 me gaya
- [ ] All 5 steps navigate kiye
- [ ] Upload button click kiya (Cloudinary widget khula)
- [ ] Test image upload kiya
- [ ] Form submit kiya
- [ ] Success page dikha
- [ ] Email received kiya (Web3Forms se)
- [ ] Telegram message received kiya

---

## 🎨 Customization (Optional)

- [ ] Phone number update kiya (`index.html` + `success.html`)
- [ ] Email address update kiya
- [ ] Brand color change kiya (agar chahiye)
- [ ] Logo add kiya (agar hai)

---

## 📊 Final Check

- [ ] Website mobile me properly khul rahi hai
- [ ] All links working hain
- [ ] Images upload ho rahe hain
- [ ] Notifications aa rahe hain (Email + Telegram)
- [ ] Success page redirect ho raha hai

---

## 🎉 Congratulations!

Agar sare checkboxes tick hain, to tumhara portal **100% ready** hai! 🚀

**Website URL:** _____________________________

**Live Date:** _____________________________

---

## 📞 Need Help?

Agar kisi step me problem aa rahi hai:

1. README.md file ka "Common Issues & Solutions" section padho
2. Browser console (F12) me errors check karo
3. Sare configuration values double-check karo
4. Har service ka dashboard dekho (working hai ya nahi)

---

**Time Estimate:**
- Total setup: ~20-25 minutes
- Testing: ~10 minutes
- Customization: ~15 minutes (optional)

**Total: Under 1 hour me pura portal live! 🌱**
