
# 🏫 SRI Academy – School Management Website

Welcome to the official **SRI Academy** school website – a modern, responsive, and informative platform for students, parents, and educators. This project showcases everything from school info to admission, facilities, events, and more.

---

## 📁 Project Directory Structure

```
School Management System/
│
├── School_management.html              # Home page
├── about.html                          # About SRI Academy
├── calendar.html                       # Academic calendar
├── about_back.jpeg                     # Background for About page
├── home_back.jpeg                      # Background for Home page
│
├── images/                             # Image assets for facilities and logo
│   ├── Auditorium.jpg
│   ├── Computer Lab.jpg
│   ├── Digital Classrooms.jpg
│   ├── Library.jpg
│   ├── Logo.jpg
│   ├── School.webp
│   └── Science Labs.jpg
│
├── Admission/                          # Online admission system
│   ├── admission.html                  # Admission form
│   ├── script.js                       # JS logic for validation/interaction
│   └── style.css                       # Styling for admission form
│
├── Facilities/                         # Pages for various school facilities
│   ├── auditorium.html
│   ├── computer_lab.html
│   ├── digital_classrooms.html
│   ├── library.html
│   ├── science labs.html
│   ├── sports_facilities.html
│   └── Logo.jpg                        # (may be duplicate of main logo)
│
└── Gallery/                            # Image gallery
    ├── Annual-Day-pic.jpg
    ├── Art.jpeg
    ├── Exhibition.jpeg
    ├── gallery.html
    ├── Sports.jpg
    └── Teachers day.webp
```

---

## 🌟 Features

### 🔹 **Home Page**

* Clean hero banner with overlay
* Navigation bar with dropdowns
* Highlights school features
* Facilities preview
* Contact and social media links

### 🔹 **About Page**

* History and growth of SRI Academy
* Vision, mission, and values
* Leadership profiles with photos

### 🔹 **Admission Page**

* Online form for student admission
* Form validation via JavaScript
* Styled with responsive design

### 🔹 **Facilities Pages**

* Individual pages for:

  * Digital Classrooms
  * Computer Lab
  * Library
  * Science Labs
  * Auditorium
  * Sports Facilities

### 🔹 **Calendar Page**

* JavaScript-driven calendar UI
* Month navigation and current date
* School events and holidays with pagination

### 🔹 **Gallery Page**

* Static image display for events and school memories

---

## 🖥️ Tech Stack

* **HTML5** – Page content
* **CSS3** – Styling and layout
* **JavaScript** – Dynamic calendar and form scripts
* **Font Awesome** – Icons
* **Google Fonts** – Typography (Montserrat, Roboto)
* **Responsive Layout** – Grid and flexbox for multi-device support

---

## 📱 Browser Compatibility

✅ Chrome (recommended)  
✅ Firefox  
✅ Safari  
✅ Edge  
✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🚀 How to Run

1. Clone or download the repository:

   ```bash
   git clone https://github.com/yourusername/sri-academy-website.git
   ```

2. Open `School_management.html` in any browser to start exploring.

3. To test the admission form:

   * Open `Admission/admission.html`

> Ensure that all image and resource paths are preserved when hosting or deploying.

---

## 🌐 Deployment

### 🔹 Static Hosting Options:
* **GitHub Pages**
* **Netlify**
* **Vercel**
* Any static file server

### 🔹 Deploying on Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize your project:
   ```bash
   firebase init
   ```

   - Choose **Hosting**
   - Select or create a Firebase project
   - Set `School_management.html` as your `index.html`
   - Set `dist/` or current directory as the public folder
   - Say **no** to single-page app rewrite if not using SPA

4. Deploy:
   ```bash
   firebase deploy
   ```

---

> Images and content are intended for educational and presentation purposes only.

---

## 📞 Contact

For feedback or collaboration:

* 📧 Email: `sribalakumarr@gmail.com`
