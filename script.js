// ===== GLOBAL VARIABLES =====
// Menyimpan state aplikasi
let candidateData = {
    name: '',
    email: '',
    videos: [null, null, null], // Array untuk menyimpan 3 video
    score: 0,
    passed: false
};

let currentStep = 1; // Langkah saat ini (1-4)

// ===== INITIALIZATION =====
// Fungsi yang dijalankan saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Setup event listeners untuk form data diri
    setupFormDataDiri();
    
    // Setup event listeners untuk upload video
    setupVideoUploads();
    
    // Setup event listeners untuk navigasi sidebar
    setupNavigation();
    
    // Setup toggle sidebar untuk mobile
    setupSidebarToggle();
    
    console.log('AI Interview Assessment initialized');
}

// ===== FORM DATA DIRI =====
function setupFormDataDiri() {
    const form = document.getElementById('formDataDiri');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault(); // Mencegah form submit default
        
        // Ambil data dari form
        const nama = document.getElementById('namaKandidat').value.trim();
        const email = document.getElementById('emailKandidat').value.trim();
        
        // Validasi input
        if (!nama || !email) {
            alert('Mohon lengkapi semua data!');
            return;
        }
        
        // Validasi format email
        if (!isValidEmail(email)) {
            alert('Format email tidak valid!');
            return;
        }
        
        // Simpan data kandidat
        candidateData.name = nama;
        candidateData.email = email;
        
        // Update display nama di header
        document.getElementById('userName').textContent = nama;
        
        // Update status step
        updateStepStatus();
        
        // Pindah ke step berikutnya
        navigateToStep('upload-video');
        updateProgress(50); // 50% progress (step 2 of 4)
        
        console.log('Data diri saved:', candidateData);
    });
}

// Fungsi untuk validasi format email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ===== VIDEO UPLOAD =====
function setupVideoUploads() {
    // Loop untuk setiap input video (3 pertanyaan)
    for (let i = 1; i <= 3; i++) {
        const input = document.getElementById(`video${i}`);
        
        input.addEventListener('change', function(e) {
            handleVideoUpload(e, i);
        });
    }
    
    // Setup tombol submit videos
    const btnSubmit = document.getElementById('btnSubmitVideos');
    btnSubmit.addEventListener('click', function() {
        submitVideos();
    });
}

// Fungsi untuk handle upload video
function handleVideoUpload(event, questionNumber) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Validasi tipe file
    const validTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
        alert('Format video tidak didukung! Gunakan MP4, MOV, atau AVI');
        event.target.value = ''; // Reset input
        return;
    }
    
    // Validasi ukuran file (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (file.size > maxSize) {
        alert('Ukuran file terlalu besar! Maksimal 100MB');
        event.target.value = ''; // Reset input
        return;
    }
    
    // Simpan file ke state
    candidateData.videos[questionNumber - 1] = file;
    
    // Update UI - tampilkan info file dan ubah status
    const questionCard = event.target.closest('.question-card');
    const uploadLabel = questionCard.querySelector('.upload-label');
    const fileInfo = questionCard.querySelector('.file-info');
    const statusBadge = questionCard.querySelector('.status-badge');
    
    // Sembunyikan upload label, tampilkan file info
    uploadLabel.style.display = 'none';
    fileInfo.style.display = 'flex';
    fileInfo.querySelector('.file-name').textContent = file.name;
    
    // Update status badge
    statusBadge.textContent = 'Uploaded';
    statusBadge.classList.remove('pending');
    statusBadge.classList.add('uploaded');
    
    // Check apakah semua video sudah diupload
    checkAllVideosUploaded();
    
    // Update status step setiap kali ada upload
    updateStepStatus();
    
    console.log(`Video ${questionNumber} uploaded:`, file.name);
}

// Fungsi untuk mengecek apakah semua video sudah diupload
function checkAllVideosUploaded() {
    const allUploaded = candidateData.videos.every(video => video !== null);
    const btnSubmit = document.getElementById('btnSubmitVideos');
    
    // Enable/disable tombol submit berdasarkan status upload
    btnSubmit.disabled = !allUploaded;
    
    if (allUploaded) {
        btnSubmit.style.opacity = '1';
    }
}

// Fungsi untuk submit semua video
function submitVideos() {
    // Validasi sekali lagi
    const allUploaded = candidateData.videos.every(video => video !== null);
    
    if (!allUploaded) {
        alert('Mohon upload semua video terlebih dahulu!');
        return;
    }
    
    // Tampilkan konfirmasi
    if (!confirm('Apakah Anda yakin ingin submit semua video? Proses evaluasi akan dimulai.')) {
        return;
    }
    
    // Pindah ke halaman evaluasi
    navigateToStep('evaluasi');
    updateProgress(75); // 75% progress (step 3 of 4)
    
    // Update status step
    updateStepStatus();
    
    // Simulasi proses evaluasi (dalam implementasi nyata, kirim ke backend)
    console.log('Videos submitted for evaluation:', candidateData);
    
    // Di sini Anda bisa menambahkan kode untuk:
    // - Upload video ke server
    // - Kirim request ke AI API untuk evaluasi
    // - Tracking progress evaluasi
}

// ===== NAVIGATION =====
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const step = this.getAttribute('data-step');
            
            // Validasi: tidak bisa loncat ke step yang belum selesai
            const validation = canNavigateToStep(step);
            
            if (!validation.allowed) {
                // Tampilkan popup peringatan dengan pesan spesifik
                showWarningPopup(validation.message);
                return;
            }
            
            navigateToStep(step);
        });
    });
}

// Fungsi untuk validasi navigasi dengan pesan spesifik
function canNavigateToStep(step) {
    // Data diri selalu bisa diakses
    if (step === 'data-diri') {
        return { allowed: true, message: '' };
    }
    
    // Upload video hanya bisa diakses jika data diri sudah diisi
    if (step === 'upload-video') {
        if (!candidateData.name || !candidateData.email) {
            return {
                allowed: false,
                message: 'Mohon lengkapi Data Diri terlebih dahulu sebelum melanjutkan ke Upload Video!'
            };
        }
        return { allowed: true, message: '' };
    }
    
    // Evaluasi hanya bisa diakses jika video sudah diupload
    if (step === 'evaluasi') {
        if (!candidateData.name || !candidateData.email) {
            return {
                allowed: false,
                message: 'Mohon lengkapi Data Diri terlebih dahulu!'
            };
        }
        
        const uploadedVideos = candidateData.videos.filter(v => v !== null).length;
        if (uploadedVideos === 0) {
            return {
                allowed: false,
                message: 'Mohon upload video jawaban untuk semua pertanyaan terlebih dahulu!'
            };
        }
        
        if (uploadedVideos < 3) {
            return {
                allowed: false,
                message: `Anda baru mengupload ${uploadedVideos} dari 3 video yang diperlukan. Mohon lengkapi semua video terlebih dahulu!`
            };
        }
        
        return { allowed: true, message: '' };
    }
    
    // Hasil hanya bisa diakses jika evaluasi selesai
    if (step === 'hasil') {
        if (!candidateData.name || !candidateData.email) {
            return {
                allowed: false,
                message: 'Mohon lengkapi Data Diri terlebih dahulu!'
            };
        }
        
        if (candidateData.videos.every(v => v === null)) {
            return {
                allowed: false,
                message: 'Mohon upload video terlebih dahulu!'
            };
        }
        
        if (candidateData.score === 0) {
            return {
                allowed: false,
                message: 'Proses evaluasi belum selesai. Mohon tunggu hingga evaluasi AI selesai!'
            };
        }
        
        return { allowed: true, message: '' };
    }
    
    return { allowed: true, message: '' };
}

// Fungsi untuk navigasi antar section
function navigateToStep(step) {
    // Sembunyikan semua section
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Tampilkan section yang dipilih
    const targetSection = document.getElementById(`section-${step}`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update active state di sidebar
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.getAttribute('data-step') === step) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Update status completed untuk steps yang sudah selesai
    updateStepStatus();
    
    // Update judul halaman
    const titles = {
        'data-diri': 'Data Diri Kandidat',
        'upload-video': 'Upload Video Interview',
        'evaluasi': 'Proses Evaluasi AI',
        'hasil': 'Hasil Evaluasi Interview'
    };
    
    document.getElementById('pageTitle').textContent = titles[step] || 'AI Interview Assessment';
    
    // Update current step untuk progress
    const stepNumbers = {
        'data-diri': 1,
        'upload-video': 2,
        'evaluasi': 3,
        'hasil': 4
    };
    currentStep = stepNumbers[step] || 1;
    
    console.log('Navigated to step:', step);
}

// Fungsi untuk update status step (completed, locked, atau available)
function updateStepStatus() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const step = item.getAttribute('data-step');
        const validation = canNavigateToStep(step);
        
        // Remove all status classes
        item.classList.remove('completed', 'locked');
        
        if (validation.allowed) {
            // Jika step ini bisa diakses dan bukan step aktif, tandai sebagai completed
            if (!item.classList.contains('active')) {
                // Cek apakah step ini sudah selesai dikerjakan
                if (isStepCompleted(step)) {
                    item.classList.add('completed');
                }
            }
        } else {
            // Jika tidak bisa diakses, tandai sebagai locked
            item.classList.add('locked');
        }
    });
}

// Fungsi untuk mengecek apakah step sudah selesai
function isStepCompleted(step) {
    if (step === 'data-diri') {
        return candidateData.name && candidateData.email;
    }
    
    if (step === 'upload-video') {
        return candidateData.videos.every(v => v !== null);
    }
    
    if (step === 'evaluasi') {
        return candidateData.score > 0;
    }
    
    if (step === 'hasil') {
        return candidateData.score > 0;
    }
    
    return false;
}

// ===== PROGRESS BAR =====
function updateProgress(percentage) {
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');
    
    progressFill.style.width = percentage + '%';
    progressPercent.textContent = percentage + '%';
}

// ===== SIDEBAR TOGGLE (MOBILE) =====
function setupSidebarToggle() {
    const toggleBtn = document.getElementById('toggleBtn');
    const sidebar = document.getElementById('sidebar');
    
    toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
    
    // Close sidebar ketika klik di luar (mobile)
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        }
    });
}

// ===== SIMULASI EVALUASI =====
// Fungsi untuk simulasi proses evaluasi (untuk testing)
function simulateEvaluation() {
    // Tampilkan animasi progress evaluasi
    const evalSteps = document.querySelectorAll('.eval-step');
    let currentEvalStep = 0;
    
    const interval = setInterval(() => {
        if (currentEvalStep < evalSteps.length) {
            evalSteps[currentEvalStep].classList.add('active');
            currentEvalStep++;
        } else {
            clearInterval(interval);
            
            // Generate random score dan status
            const score = Math.floor(Math.random() * 40) + 60; // Score 60-100
            const passed = score >= 70; // Lulus jika score >= 70
            
            candidateData.score = score;
            candidateData.passed = passed;
            
            // Pindah ke halaman hasil
            setTimeout(() => {
                showResults();
                navigateToStep('hasil');
                updateProgress(100); // 100% complete
            }, 1000);
        }
    }, 1500); // Setiap step 1.5 detik
}

// ===== TAMPILKAN HASIL =====
function showResults() {
    const resultStatus = document.getElementById('resultStatus');
    const totalScore = document.getElementById('totalScore');
    const certificateSection = document.getElementById('certificateSection');
    
    // Update score
    totalScore.textContent = candidateData.score;
    
    // Update status lulus/tidak lulus
    if (candidateData.passed) {
        resultStatus.className = 'result-status passed';
        resultStatus.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <h2>Selamat! Anda LULUS</h2>
            <p>Anda telah berhasil melewati AI Interview Assessment</p>
        `;
        // Tampilkan section sertifikat
        certificateSection.style.display = 'block';
    } else {
        resultStatus.className = 'result-status failed';
        resultStatus.innerHTML = `
            <i class="fas fa-times-circle"></i>
            <h2>Mohon Maaf, Anda TIDAK LULUS</h2>
            <p>Anda dapat mencoba kembali untuk meningkatkan hasil evaluasi</p>
        `;
        // Sembunyikan section sertifikat
        certificateSection.style.display = 'none';
    }
    
    // Update breakdown score (simulasi - dalam implementasi nyata dari API)
    updateScoreBreakdown();
    
    // Update status step
    updateStepStatus();
    
    console.log('Results displayed:', candidateData);
}

// Fungsi untuk update breakdown score
function updateScoreBreakdown() {
    const scoreItems = document.querySelectorAll('.score-item');
    
    // Generate random scores untuk setiap kategori
    const scores = [
        Math.floor(Math.random() * 20) + 80, // Komunikasi
        Math.floor(Math.random() * 20) + 75, // Kepercayaan Diri
        Math.floor(Math.random() * 20) + 70  // Relevansi Jawaban
    ];
    
    scoreItems.forEach((item, index) => {
        const fill = item.querySelector('.score-bar-fill');
        const number = item.querySelector('.score-number');
        
        fill.style.width = scores[index] + '%';
        number.textContent = scores[index] + '/100';
    });
}

// ===== DOWNLOAD FUNCTIONS =====
// Fungsi untuk download sertifikat
function downloadCertificate() {
    alert(`Sertifikat untuk ${candidateData.name} akan diunduh.\n\nDalam implementasi nyata, ini akan generate PDF sertifikat.`);
    
    // Di sini Anda bisa menambahkan kode untuk:
    // - Generate PDF sertifikat menggunakan library seperti jsPDF
    // - Atau redirect ke endpoint backend untuk generate sertifikat
    
    console.log('Certificate download requested');
}

// Fungsi untuk download laporan
function downloadReport() {
    alert(`Laporan lengkap untuk ${candidateData.name} akan diunduh.\n\nDalam implementasi nyata, ini akan generate PDF laporan.`);
    
    // Di sini Anda bisa menambahkan kode untuk:
    // - Generate PDF laporan lengkap
    // - Termasuk detail score, feedback, dan rekomendasi
    
    console.log('Report download requested');
}

// ===== RESET ASSESSMENT =====
function resetAssessment() {
    if (!confirm('Apakah Anda yakin ingin memulai ulang? Semua data akan dihapus.')) {
        return;
    }
    
    // Reset semua data
    candidateData = {
        name: '',
        email: '',
        videos: [null, null, null],
        score: 0,
        passed: false
    };
    
    // Reset form
    document.getElementById('formDataDiri').reset();
    
    // Reset video uploads
    for (let i = 1; i <= 3; i++) {
        const input = document.getElementById(`video${i}`);
        input.value = '';
        
        const questionCard = input.closest('.question-card');
        const uploadLabel = questionCard.querySelector('.upload-label');
        const fileInfo = questionCard.querySelector('.file-info');
        const statusBadge = questionCard.querySelector('.status-badge');
        
        uploadLabel.style.display = 'flex';
        fileInfo.style.display = 'none';
        statusBadge.textContent = 'Belum Upload';
        statusBadge.classList.remove('uploaded');
        statusBadge.classList.add('pending');
    }
    
    // Reset evaluation steps
    const evalSteps = document.querySelectorAll('.eval-step');
    evalSteps.forEach((step, index) => {
        if (index === 0) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    // Kembali ke halaman awal
    navigateToStep('data-diri');
    updateProgress(25);
    document.getElementById('userName').textContent = 'Kandidat';
    
    console.log('Assessment reset');
}

// ===== HELPER FUNCTIONS =====
// Fungsi tambahan yang mungkin berguna

// Fungsi untuk menampilkan popup warning
function showWarningPopup(message) {
    // Cek apakah sudah ada popup, jika ada hapus dulu
    const existingPopup = document.querySelector('.warning-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Buat elemen popup
    const popup = document.createElement('div');
    popup.className = 'warning-popup';
    popup.innerHTML = `
        <div class="warning-popup-overlay"></div>
        <div class="warning-popup-content">
            <div class="warning-popup-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Mohon Selesaikan Tahap Sebelumnya</h3>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="closeWarningPopup()">
                <i class="fas fa-check"></i> Mengerti
            </button>
        </div>
    `;
    
    // Tambahkan ke body
    document.body.appendChild(popup);
    
    // Animasi muncul
    setTimeout(() => {
        popup.classList.add('show');
    }, 10);
    
    // Auto close setelah 5 detik
    setTimeout(() => {
        closeWarningPopup();
    }, 5000);
}

// Fungsi untuk menutup popup warning
function closeWarningPopup() {
    const popup = document.querySelector('.warning-popup');
    if (popup) {
        popup.classList.remove('show');
        setTimeout(() => {
            popup.remove();
        }, 300);
    }
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Get current date formatted
function getCurrentDate() {
    const date = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
}

// Log untuk debugging
console.log('Script loaded successfully');
console.log('Current date:', getCurrentDate());