// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCslxNVpJDvjanznQ0M8EIAPevE9tdWPUQ",
  authDomain: "school-application-form-a7bdd.firebaseapp.com",
  projectId: "school-application-form-a7bdd",
  storageBucket: "school-application-form-a7bdd.appspot.com",
  messagingSenderId: "899615233596",
  appId: "1:899615233596:web:e23519d42cf12c1a5bd539"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Get DOM elements
const form = document.getElementById('admissionForm');
const successMessage = document.getElementById('successMessage');
const downloadBtn = document.getElementById('downloadBtn');
const marksSection = document.getElementById('marks_section');
const classSelect = document.getElementById('class_applied');
const medicalConditionSelect = document.getElementById('medical_condition_select');
const medicalDetailsSection = document.getElementById('medical_details_section');
const dobInput = document.getElementById('dob');
const declarationCheckbox = document.getElementById('declaration');
const submitBtn = document.getElementById('submitBtn');

// Auth elements
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authMessage = document.getElementById("authMessage");
const userInfoContent = document.getElementById("userInfoContent");
const userEmail = document.getElementById("userEmail");
const authSection = document.getElementById("authSection");
const userInfo = document.getElementById("userInfo");

// Store form data globally for PDF generation
let currentFormData = {};

// Set max date for DOB input (current date)
function setMaxDateForDOB() {
  const today = new Date();
  const year = today.getFullYear();
  let month = today.getMonth() + 1;
  let day = today.getDate();
  
  // Format month and day to ensure they have two digits
  month = month < 10 ? '0' + month : month;
  day = day < 10 ? '0' + day : day;
  
  const formattedDate = `${year}-${month}-${day}`;
  dobInput.setAttribute('max', formattedDate);
}

// Monitor DOB input to ensure it's not in the future
dobInput.addEventListener('change', function() {
  const selectedDate = new Date(this.value);
  const today = new Date();
  
  if (selectedDate > today) {
    alert("Date of birth cannot be in the future!");
    this.value = ''; // Clear the invalid value
  }
});

// Listen for class selection changes to show/hide 10th marks section
classSelect.addEventListener('change', function() {
  if (this.value === "11") {
    marksSection.style.display = 'block';
    
    // Make marks fields required for 11th standard
    document.getElementById('total_percentage').setAttribute('required', '');
    document.getElementById('math_marks').setAttribute('required', '');
    document.getElementById('science_marks').setAttribute('required', '');
    document.getElementById('english_marks').setAttribute('required', '');
    document.getElementById('social_marks').setAttribute('required', '');
    document.getElementById('language_marks').setAttribute('required', '');
  } else {
    marksSection.style.display = 'none';
    
    // Remove required attribute when not applying for 11th
    document.getElementById('total_percentage').removeAttribute('required');
    document.getElementById('math_marks').removeAttribute('required');
    document.getElementById('science_marks').removeAttribute('required');
    document.getElementById('english_marks').removeAttribute('required');
    document.getElementById('social_marks').removeAttribute('required');
    document.getElementById('language_marks').removeAttribute('required');
  }
});

// Listen for medical condition selection changes
medicalConditionSelect.addEventListener('change', function() {
  if (this.value === "Yes") {
    medicalDetailsSection.style.display = 'block';
    document.getElementById('medical_conditions').setAttribute('required', '');
  } else {
    medicalDetailsSection.style.display = 'none';
    document.getElementById('medical_conditions').removeAttribute('required');
    // Clear the content if N/A or None is selected
    document.getElementById('medical_conditions').value = '';
  }
});

// Listen for declaration checkbox changes
declarationCheckbox.addEventListener('change', function() {
  if (this.checked) {
    submitBtn.disabled = false;
  } else {
    submitBtn.disabled = true;
  }
});

// Monitor authentication state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is logged in
    authSection.style.display = "none"; // Hide auth section
    userInfo.style.display = "block";   // Show user info bar
    userEmail.textContent = user.email; // Display user email
    form.style.display = "block";       // Show form
  } else {
    // User is logged out
    authSection.style.display = "block"; // Show auth section
    userInfo.style.display = "none";     // Hide user info bar
    form.style.display = "none";         // Hide form
    // Reset form state
    successMessage.style.display = "none";
    downloadBtn.style.display = "none";
  }
});

// Add Enter key functionality to email and password inputs
emailInput.addEventListener('keypress', handleEnterKey);
passwordInput.addEventListener('keypress', handleEnterKey);

// Register new user
registerBtn.addEventListener("click", async () => {
  // Store the action for Enter key functionality
  localStorage.setItem('lastAuthAction', 'register');
  
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  
  if (!email || !password) {
    showMessageBox("Please enter both email and password.", 'error');
    return;
  }
  
  if (password.length < 6) {
    showMessageBox("Password must be at least 6 characters long.", 'error');
    return;
  }
  
  try {
    showMessageBox("Creating account...", 'info');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    showMessageBox(`Account created successfully! Verification email sent to ${email}.`, 'success');
  } catch (error) {
    console.error("Registration error:", error);
    let errorMessage = "Registration failed. ";
    
    // Handle specific Firebase errors
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage += "This email is already registered. Try logging in instead.";
        break;
      case 'auth/invalid-email':
        errorMessage += "Please enter a valid email address.";
        break;
      case 'auth/weak-password':
        errorMessage += "Password is too weak. Use at least 6 characters.";
        break;
      case 'auth/network-request-failed':
        errorMessage += "Network error. Please check your internet connection.";
        break;
      default:
        errorMessage += error.message;
    }
    
    showMessageBox(errorMessage, 'error');
  }
});

// Login existing user
loginBtn.addEventListener("click", async () => {
  // Store the action for Enter key functionality
  localStorage.setItem('lastAuthAction', 'login');
  
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  
  if (!email || !password) {
    showMessageBox("Please enter both email and password.", 'error');
    return;
  }
  
  try {
    showMessageBox("Logging in...", 'info');
    await signInWithEmailAndPassword(auth, email, password);
    showMessageBox(`Logged in successfully as ${email}`, 'success');
  } catch (error) {
    console.error("Login error:", error);
    let errorMessage = "Login failed. ";
    
    // Handle specific Firebase errors
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage += "No account found with this email. Please register first.";
        break;
      case 'auth/wrong-password':
        errorMessage += "Incorrect password. Please try again.";
        break;
      case 'auth/invalid-email':
        errorMessage += "Please enter a valid email address.";
        break;
      case 'auth/user-disabled':
        errorMessage += "This account has been disabled. Contact support.";
        break;
      case 'auth/too-many-requests':
        errorMessage += "Too many failed attempts. Please try again later.";
        break;
      case 'auth/network-request-failed':
        errorMessage += "Network error. Please check your internet connection.";
        break;
      case 'auth/invalid-credential':
        errorMessage += "Invalid email or password. Please check your credentials.";
        break;
      default:
        errorMessage += error.message;
    }
    
    showMessageBox(errorMessage, 'error');
  }
});

// 5. UPDATE THE LOGOUT FUNCTION (around lines 164-175) to use the new message system:

// Logout user
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    showMessageBox("Logged out successfully.", 'success');
    // Clear form inputs
    emailInput.value = "";
    passwordInput.value = "";
    // Clear stored action
    localStorage.removeItem('lastAuthAction');
  } catch (error) {
    console.error("Logout error:", error);
    showMessageBox(`Error during logout: ${error.message}`, 'error');
  }
});

// Function to generate a custom application ID
async function generateApplicationId() {
  const year = new Date().getFullYear();
  const counterRef = doc(db, "counters", "application_counter");
  
  try {
    // Get the current counter value or create if it doesn't exist
    const counterSnap = await getDoc(counterRef);
    let count = 0;
    
    if (counterSnap.exists()) {
      // If current year is different, reset counter
      if (counterSnap.data().year !== year) {
        count = 1;
        await setDoc(counterRef, { year: year, count: count });
      } else {
        // Increment the counter
        count = counterSnap.data().count + 1;
        await updateDoc(counterRef, { count: count });
      }
    } else {
      // First application, create the counter
      count = 1;
      await setDoc(counterRef, { year: year, count: count });
    }
    
    // Format the ID with padding
    const paddedNumber = String(count).padStart(4, '0');
    return `APP${year}-${paddedNumber}`;
  } catch (error) {
    console.error("Error generating application ID:", error);
    return `APP${year}-ERROR`;
  }
}

// Function to show message box with better styling
function showMessageBox(message, type = 'info') {
  const authMessage = document.getElementById('authMessage');
  authMessage.textContent = message;
  
  // Remove existing classes
  authMessage.classList.remove('success', 'error', 'info');
  
  // Add appropriate class based on type
  authMessage.classList.add(type);
  
  // Auto-hide success messages after 3 seconds
  if (type === 'success') {
    setTimeout(() => {
      authMessage.textContent = 'Please login with your credentials or register for a new account';
      authMessage.classList.remove('success');
    }, 3000);
  }
}

// Function to handle Enter key press
function handleEnterKey(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    // Check which button was last clicked or default to login
    const lastAction = localStorage.getItem('lastAuthAction') || 'login';
    if (lastAction === 'register') {
      registerBtn.click();
    } else {
      loginBtn.click();
    }
  }
}

// Validate Aadhar number format
function validateAadhar(aadharNumber) {
  // Remove any spaces or hyphens that might be entered
  const cleanAadhar = aadharNumber.replace(/[-\s]/g, '');
  
  // Check if it's exactly 12 digits
  return /^[0-9]{12}$/.test(cleanAadhar);
}

// Validate phone number format
function validatePhone(phoneNumber) {
  // Remove any spaces or hyphens that might be entered
  const cleanPhone = phoneNumber.replace(/[-\s]/g, '');
  
  // Check if it's exactly 10 digits
  return /^[0-9]{10}$/.test(cleanPhone);
}

// Validate pin code format
function validatePincode(pincode) {
  // Remove any spaces or hyphens that might be entered
  const cleanPincode = pincode.replace(/[-\s]/g, '');
  
  // Check if it's exactly 6 digits
  return /^[0-9]{6}$/.test(cleanPincode);
}

// Function to safely get form field values
function getFieldValue(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) {
    console.error(`Field with ID '${fieldId}' not found`);
    return '';
  }
  
  if (field.type === 'checkbox') {
    return field.checked;
  } else if (field.type === 'select-one') {
    return field.value || '';
  } else if (field.type === 'textarea') {
    return field.value || '';
  } else {
    return field.value || '';
  }
}

// Validate form fields
function validateForm() {
  // Basic required field validation
  const requiredFields = document.querySelectorAll('[required]');
  for (const field of requiredFields) {
    if (!field.value.trim()) {
      alert(`Please fill in the ${field.previousElementSibling.textContent}`);
      field.focus();
      return false;
    }
  }
  
  // Validate date of birth
  const dob = new Date(getFieldValue('dob'));
  const today = new Date();
  if (dob > today) {
    alert("Date of birth cannot be in the future!");
    document.getElementById('dob').focus();
    return false;
  }
  
  // Validate aadhar numbers
  const studentAadhar = getFieldValue('student_aadhar');
  if (!validateAadhar(studentAadhar)) {
    alert("Student's Aadhar number must be exactly 12 digits!");
    document.getElementById('student_aadhar').focus();
    return false;
  }
  
  const fatherAadhar = getFieldValue('father_aadhar');
  if (!validateAadhar(fatherAadhar)) {
    alert("Father's Aadhar number must be exactly 12 digits!");
    document.getElementById('father_aadhar').focus();
    return false;
  }
  
  const motherAadhar = getFieldValue('mother_aadhar');
  if (!validateAadhar(motherAadhar)) {
    alert("Mother's Aadhar number must be exactly 12 digits!");
    document.getElementById('mother_aadhar').focus();
    return false;
  }
  
  // Only validate guardian aadhar if it's provided
  const guardianAadhar = getFieldValue('guardian_aadhar');
  if (guardianAadhar && !validateAadhar(guardianAadhar)) {
    alert("Guardian's Aadhar number must be exactly 12 digits!");
    document.getElementById('guardian_aadhar').focus();
    return false;
  }
  
  // Validate phone numbers
  const fatherPhone = getFieldValue('father_phone');
  if (!validatePhone(fatherPhone)) {
    alert("Father's phone number must be exactly 10 digits!");
    document.getElementById('father_phone').focus();
    return false;
  }
  
  const motherPhone = getFieldValue('mother_phone');
  if (!validatePhone(motherPhone)) {
    alert("Mother's phone number must be exactly 10 digits!");
    document.getElementById('mother_phone').focus();
    return false;
  }
  
  // Only validate guardian phone if it's provided
  const guardianPhone = getFieldValue('guardian_phone');
  if (guardianPhone && !validatePhone(guardianPhone)) {
    alert("Guardian's phone number must be exactly 10 digits!");
    document.getElementById('guardian_phone').focus();
    return false;
  }
  
  const emergencyPhone = getFieldValue('emergency_phone');
  if (!validatePhone(emergencyPhone)) {
    alert("Emergency contact phone number must be exactly 10 digits!");
    document.getElementById('emergency_phone').focus();
    return false;
  }
  
  // Validate pincode
  const pincode = getFieldValue('pincode');
  if (!validatePincode(pincode)) {
    alert("Pin code must be exactly 6 digits!");
    document.getElementById('pincode').focus();
    return false;
  }
  
  // Validate email addresses
  const fatherEmail = getFieldValue('father_email');
  const motherEmail = getFieldValue('mother_email');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(fatherEmail)) {
    alert("Please enter a valid email address for Father's Email");
    document.getElementById('father_email').focus();
    return false;
  }
  
  if (!emailRegex.test(motherEmail)) {
    alert("Please enter a valid email address for Mother's Email");
    document.getElementById('mother_email').focus();
    return false;
  }
  
  // Validate 10th standard marks for 11th class applicants
  if (getFieldValue('class_applied') === "11") {
    const totalPercentage = parseFloat(getFieldValue('total_percentage'));
    const mathMarks = parseFloat(getFieldValue('math_marks'));
    const scienceMarks = parseFloat(getFieldValue('science_marks'));
    const englishMarks = parseFloat(getFieldValue('english_marks'));
    const socialMarks = parseFloat(getFieldValue('social_marks'));
    const languageMarks = parseFloat(getFieldValue('language_marks'));
    
    if (isNaN(totalPercentage) || totalPercentage < 0 || totalPercentage > 100) {
      alert("Total percentage must be between 0 and 100!");
      document.getElementById('total_percentage').focus();
      return false;
    }
    
    // Validate individual subject marks
    const subjectMarks = [
      { value: mathMarks, name: 'Mathematics' },
      { value: scienceMarks, name: 'Science' },
      { value: englishMarks, name: 'English' },
      { value: socialMarks, name: 'Social Studies' },
      { value: languageMarks, name: 'Language' }
    ];
    
    for (const subject of subjectMarks) {
      if (isNaN(subject.value) || subject.value < 0 || subject.value > 100) {
        alert(`${subject.name} marks must be between 0 and 100!`);
        document.getElementById(`${subject.name.toLowerCase().replace(' ', '_')}_marks`).focus();
        return false;
      }
    }
  }
  
  // Check if declaration checkbox is checked
  if (!getFieldValue('declaration')) {
    alert("Please agree to the declaration to submit the form.");
    document.getElementById('declaration').focus();
    return false;
  }
  
  return true;
}

// Form submission handler
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Check if user is logged in
  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in before submitting.");
    return;
  }
  
  // Validate form data
  if (!validateForm()) {
    return;
  }
  
  try {
    // Show processing message
    successMessage.style.display = "block";
    successMessage.style.backgroundColor = "#f0f8ff";
    successMessage.style.color = "#333";
    successMessage.textContent = "Processing your application, please wait...";
    
    // Generate the custom application ID
    const applicationId = await generateApplicationId();
    console.log("Generated application ID:", applicationId);
    
    // Gather form data
    const formData = {};
    
    // Application metadata
    formData.application_id = applicationId;
    formData.user_id = user.uid;
    formData.user_email = user.email;
    formData.submitted_at = new Date().toISOString();
    formData.status = "Pending";  // Default status for new applications
    
    // Student details
    formData.student_name = getFieldValue('student_name');
    formData.dob = getFieldValue('dob');
    formData.gender = getFieldValue('gender');
    formData.class_applied = getFieldValue('class_applied');
    formData.blood_group = getFieldValue('blood_group');
    formData.nationality = getFieldValue('nationality');
    formData.religion = getFieldValue('religion');
    formData.community = getFieldValue('community');
    formData.mother_tongue = getFieldValue('mother_tongue');
    formData.languages_known = getFieldValue('languages_known');
    formData.medical_condition_select = getFieldValue('medical_condition_select');
    formData.medical_conditions = formData.medical_condition_select === "Yes" ? getFieldValue('medical_conditions') : "N/A";
    formData.transport_mode = getFieldValue('transport_mode');
    formData.distance_from_school = getFieldValue('distance_from_school') ? parseFloat(getFieldValue('distance_from_school')) : null;
    formData.student_aadhar = getFieldValue('student_aadhar');
    
    // 10th standard marks (for 11th applicants)
    if (formData.class_applied === "11") {
      formData.total_percentage = parseFloat(getFieldValue('total_percentage')) || 0;
      formData.math_marks = parseFloat(getFieldValue('math_marks')) || 0;
      formData.science_marks = parseFloat(getFieldValue('science_marks')) || 0;
      formData.english_marks = parseFloat(getFieldValue('english_marks')) || 0;
      formData.social_marks = parseFloat(getFieldValue('social_marks')) || 0;
      formData.language_marks = parseFloat(getFieldValue('language_marks')) || 0;
    }
    
    // Father's details
    formData.father_name = getFieldValue('father_name');
    formData.father_occupation = getFieldValue('father_occupation');
    formData.father_phone = getFieldValue('father_phone');
    formData.father_email = getFieldValue('father_email');
    formData.father_qualification = getFieldValue('father_qualification');
    formData.father_aadhar = getFieldValue('father_aadhar');
    formData.father_income = getFieldValue('father_income');
    
    // Mother's details
    formData.mother_name = getFieldValue('mother_name');
    formData.mother_occupation = getFieldValue('mother_occupation');
    formData.mother_phone = getFieldValue('mother_phone');
    formData.mother_email = getFieldValue('mother_email');
    formData.mother_qualification = getFieldValue('mother_qualification');
    formData.mother_aadhar = getFieldValue('mother_aadhar');
    
    // Guardian details
    formData.guardian_name = getFieldValue('guardian_name') || "N/A";
    formData.guardian_relation = getFieldValue('guardian_relation') || "N/A";
    formData.guardian_phone = getFieldValue('guardian_phone') || "N/A";
    formData.guardian_aadhar = getFieldValue('guardian_aadhar') || "N/A";
    
    // Address details
    formData.current_address = getFieldValue('current_address');
    formData.permanent_address = getFieldValue('permanent_address') || "Same as Current Address";
    formData.city = getFieldValue('city');
    formData.state = getFieldValue('state');
    formData.pincode = getFieldValue('pincode');
    
    // Emergency contact
    formData.emergency_name = getFieldValue('emergency_name');
    formData.emergency_relation = getFieldValue('emergency_relation');
    formData.emergency_phone = getFieldValue('emergency_phone');
    
    // Previous school info
    formData.prev_school = getFieldValue('prev_school');
    formData.tc_number = getFieldValue('tc_number') || "N/A";
    
    // Document numbers
    formData.birth_certificate_number = getFieldValue('birth_certificate_number');
    formData.transfer_certificate_number = getFieldValue('transfer_certificate_number') || "N/A";
    
    // Declaration
    formData.declaration = getFieldValue('declaration');
    
    console.log("Form data prepared:", formData);
    
    // Store form data globally for PDF download
    currentFormData = formData;
    
    // Save the application to Firestore
    const docRef = await addDoc(collection(db, "applications"), formData);
    console.log("Application saved with ID:", docRef.id);
    
    // Display success message with application ID
    successMessage.style.display = "block";
    successMessage.style.backgroundColor = "#e7f9e7";
    successMessage.style.color = "green";
    successMessage.innerHTML = `
      <p>Application submitted successfully!</p>
      <p>Your Application ID is: <strong>${applicationId}</strong></p>
      <p>Please save this ID for future reference.</p>
    `;
    
    // Show the download button
    downloadBtn.style.display = "block";
    
    // Scroll to the success message
    successMessage.scrollIntoView({ behavior: 'smooth' });
    
    // Reset the form
    form.reset();
    
    // Hide marks section after submission
    marksSection.style.display = 'none';
    medicalDetailsSection.style.display = 'none';
    
    // Disable submit button until declaration is checked again
    submitBtn.disabled = true;
    
  } catch (error) {
    console.error("Error submitting application:", error);
    successMessage.style.display = "block";
    successMessage.style.backgroundColor = "#ffebee";
    successMessage.style.color = "red";
    successMessage.textContent = "An error occurred while submitting your application. Please try again. Error: " + error.message;
  }
});

// PDF Download functionality
downloadBtn.addEventListener("click", () => {
  try {
    console.log("Generating PDF with data:", currentFormData);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add school header
    doc.setFontSize(22);
    doc.setTextColor(0, 51, 102);
    doc.text("SCHOOL ADMISSION FORM", 105, 20, { align: "center" });
    
    // Add application ID
    doc.setFontSize(16);
    doc.setTextColor(0, 102, 0);
    doc.text(`Application ID: ${currentFormData.application_id}`, 105, 30, { align: "center" });
    
    // Add horizontal line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 35, 190, 35);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    // Student details section
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text("Student Details", 20, 45);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Name: ${currentFormData.student_name || 'N/A'}`, 20, 55);
    doc.text(`Date of Birth: ${currentFormData.dob || 'N/A'}`, 20, 65);
    doc.text(`Gender: ${currentFormData.gender || 'N/A'}`, 20, 75);
    doc.text(`Class Applying For: ${currentFormData.class_applied || 'N/A'}`, 20, 85);
    doc.text(`Nationality: ${currentFormData.nationality || 'N/A'}`, 20, 95);
    doc.text(`Blood Group: ${currentFormData.blood_group || 'N/A'}`, 120, 55);
    doc.text(`Religion: ${currentFormData.religion || 'N/A'}`, 120, 65);
    doc.text(`Community: ${currentFormData.community || 'N/A'}`, 120, 75);
    doc.text(`Mother Tongue: ${currentFormData.mother_tongue || 'N/A'}`, 120, 85);
    doc.text(`Aadhar Number: ${currentFormData.student_aadhar || 'N/A'}`, 120, 95);
    
    // Medical condition
    doc.text(`Medical Condition: ${currentFormData.medical_condition_select || 'N/A'}`, 20, 105);
    if (currentFormData.medical_condition_select === "Yes") {
      const medicalLines = doc.splitTextToSize(`Details: ${currentFormData.medical_conditions || 'N/A'}`, 150);
      doc.text(medicalLines, 30, 115);
      
      // Adjust y position based on number of lines
      var yPos = 115 + (medicalLines.length * 7);
    } else {
      var yPos = 115;
    }
    
    // 10th Standard Marks (if applying for 11th)
    if (currentFormData.class_applied === "11") {
      doc.setFontSize(14);
      doc.setTextColor(0, 51, 102);
      doc.text("10th Standard Marks", 20, yPos);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Total Percentage: ${currentFormData.total_percentage || 'N/A'}%`, 20, yPos + 10);
      doc.text(`Mathematics: ${currentFormData.math_marks || 'N/A'}`, 20, yPos + 20);
      doc.text(`Science: ${currentFormData.science_marks || 'N/A'}`, 20, yPos + 30);
      doc.text(`English: ${currentFormData.english_marks || 'N/A'}`, 20, yPos + 40);
      doc.text(`Social Studies: ${currentFormData.social_marks || 'N/A'}`, 120, yPos + 20);
      doc.text(`Language: ${currentFormData.language_marks || 'N/A'}`, 120, yPos + 30);
      
      // Adjust y position for next sections
      yPos += 55;
    } else {
      yPos += 10;
    }
    
    // Parent details section
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text("Parent Details", 20, yPos);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Father's Name: ${currentFormData.father_name || 'N/A'}`, 20, yPos + 10);
    doc.text(`Father's Phone: ${currentFormData.father_phone || 'N/A'}`, 20, yPos + 20);
    doc.text(`Father's Email: ${currentFormData.father_email || 'N/A'}`, 20, yPos + 30);
    doc.text(`Father's Occupation: ${currentFormData.father_occupation || 'N/A'}`, 20, yPos + 40);
    doc.text(`Father's Aadhar: ${currentFormData.father_aadhar || 'N/A'}`, 20, yPos + 50);
    
    doc.text(`Mother's Name: ${currentFormData.mother_name || 'N/A'}`, 120, yPos + 10);
    doc.text(`Mother's Phone: ${currentFormData.mother_phone || 'N/A'}`, 120, yPos + 20);
    doc.text(`Mother's Email: ${currentFormData.mother_email || 'N/A'}`, 120, yPos + 30);
    doc.text(`Mother's Occupation: ${currentFormData.mother_occupation || 'N/A'}`, 120, yPos + 40);
    doc.text(`Mother's Aadhar: ${currentFormData.mother_aadhar || 'N/A'}`, 120, yPos + 50);
    
    // Update yPosition for next section
    yPos += 65;
    
    // Guardian details (if applicable)
    if (currentFormData.guardian_name !== "N/A") {
      doc.setFontSize(14);
      doc.setTextColor(0, 51, 102);
      doc.text("Guardian Details", 20, yPos);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Name: ${currentFormData.guardian_name || 'N/A'}`, 20, yPos + 10);
      doc.text(`Relation: ${currentFormData.guardian_relation || 'N/A'}`, 20, yPos + 20);
      doc.text(`Phone: ${currentFormData.guardian_phone || 'N/A'}`, 20, yPos + 30);
      doc.text(`Aadhar: ${currentFormData.guardian_aadhar || 'N/A'}`, 20, yPos + 40);
      
      // Update yPosition
      yPos += 55;
    }
    
    // Document details
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text("Document Details", 20, yPos);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Birth Certificate Number: ${currentFormData.birth_certificate_number || 'N/A'}`, 20, yPos + 10);
    doc.text(`Aadhar Card Number: ${currentFormData.aadhar_card_number || 'N/A'}`, 20, yPos + 20);
    doc.text(`Transfer Certificate Number: ${currentFormData.transfer_certificate_number || 'N/A'}`, 20, yPos + 30);
    
    // Update yPosition
    yPos += 45;
    
    // Address section
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text("Contact & Address", 20, yPos);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    // Split address into multiple lines if needed
    const addressLines = doc.splitTextToSize(`Current Address: ${currentFormData.current_address || 'N/A'}`, 170);
    doc.text(addressLines, 20, yPos + 10);
    
    yPos += 10 + (addressLines.length * 7);
    
    doc.text(`City: ${currentFormData.city || 'N/A'}`, 20, yPos);
    doc.text(`State: ${currentFormData.state || 'N/A'}`, 20, yPos + 10);
    doc.text(`Pin Code: ${currentFormData.pincode || 'N/A'}`, 20, yPos + 20);
    
    // Application info footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Submitted on: ${new Date(currentFormData.submitted_at).toLocaleString()}`, 20, 280);
    doc.text(`Submitted by: ${currentFormData.user_email}`, 20, 287);
    
    // Save the PDF
    doc.save(`${currentFormData.application_id}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);  
    alert("Error generating PDF. Please try again.");
  }
});

// Initialize form state
document.addEventListener('DOMContentLoaded', function() {
  // Hide marks section initially
  marksSection.style.display = 'none';
});