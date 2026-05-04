import { db, collection, addDoc } from "./firebase.js";
import { CONFIG } from "./config.js";


// bikin global biar bisa dipanggil HTML
window.cekKode = function () {
  const input = document.getElementById("kodeInput").value;

  if (input === CONFIG.PPDB_CODE) {
    document.getElementById("kodeSection").style.display = "none";
    document.getElementById("formSection").style.display = "block";
  } else {
    alert("Kode salah!");
  }
};

window.kirimData = async function () {

  const data = {
    nama: document.getElementById("nama").value,
    ttl: document.getElementById("ttl").value,
    tempatLahir: document.getElementById("tempatLahir").value,
    namaIbu: document.getElementById("namaIbu").value,
    namaAyah: document.getElementById("namaAyah").value,

    nik: document.getElementById("nik").value,
    asalSekolah: document.getElementById("asalSekolah").value,
    alamatDomisili: document.getElementById("alamatDomisili").value,
    alamatKK: document.getElementById("alamatKK").value,

    status: "Menunggu",
    deleted: false,
    timestamp: new Date()
  };

if (!data.nik || data.nik.length !== 16) {
  showToast("NIK harus 16 digit", "error");
  return;
}

  try {
    await addDoc(collection(db, "ppdb"), data);

showToast("Pendaftaran berhasil! Silakan hubungi sekolah untuk info lanjut 🙏", "success");

document.getElementById("robotText").innerHTML =
  "🎉 Yeay! Data kamu sudah terkirim! Sampai jumpa di sekolah ya!";

confetti({
  particleCount: 120,
  spread: 70,
  origin: { y: 0.6 }
});

confetti({
  particleCount: 120,
  spread: 70,
  origin: { y: 0.6 }
});

// ⏳ delay lalu reset
setTimeout(() => {
  resetForm();
}, 2500);

  } catch (error) {
    showToast("Gagal menyimpan data", "error");
    console.error(error);
  }
};

let currentStep = 0;
const steps = document.querySelectorAll(".step");

window.nextStep = function () {

  updateSummary(currentStep); // ⬅️ TAMBAHKAN INI

  if (currentStep < steps.length - 1) {
    steps[currentStep].classList.remove("active");
    currentStep++;
    steps[currentStep].classList.add("active");
    updateProgress();
    updateRobotText(currentStep);
  }

  if (currentStep === steps.length - 1) {
     document.getElementById("nextBtn").style.display = "none";
    document.getElementById("submitBtn").style.display = "inline-block";
  }
};


window.prevStep = function () {
  if (currentStep > 0) {
    steps[currentStep].classList.remove("active");
    currentStep--;
    steps[currentStep].classList.add("active");
    updateProgress();
    updateRobotText(currentStep);
  }

  document.getElementById("submitBtn").style.display = "none";
};

function updateProgress() {
  const percent = ((currentStep + 1) / steps.length) * 100;
  document.getElementById("progressBar").style.width = percent + "%";
}

function showToast(message, type = "success") {
  const container = document.getElementById("toast");

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const icon = type === "success" ? "🎉" : "⚠️";

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function resetForm() {

  // kosongkan semua input
  document.querySelectorAll("input").forEach(input => input.value = "");

  // balik ke step awal
  currentStep = 0;

  document.querySelectorAll(".step").forEach((step, i) => {
    step.classList.remove("active");
    if (i === 0) step.classList.add("active");
  });

  // reset progress bar
  document.getElementById("progressBar").style.width = "0%";

  // sembunyikan form
  document.getElementById("formSection").style.display = "none";

  // tampilkan kode lagi
  document.getElementById("kodeSection").style.display = "block";

  // sembunyikan tombol submit
  document.getElementById("submitBtn").style.display = "none";
}

function updateSummary(stepIndex) {
  const summary = document.getElementById("summaryContainer");

  if (stepIndex === 0) {
    summary.innerHTML += `
      <div class="summary-item">
        👤 <b>${document.getElementById("nama").value}</b><br>
        ${document.getElementById("tempatLahir").value}, ${document.getElementById("ttl").value}<br>
        NIK: ${document.getElementById("nik").value}<br>
        ${document.getElementById("asalSekolah").value}
      </div>
    `;
  }

  if (stepIndex === 1) {
    summary.innerHTML += `
      <div class="summary-item">
        👨 Ayah: <b>${document.getElementById("namaAyah").value}</b><br>
        👩 Ibu: <b>${document.getElementById("namaIbu").value}</b>
      </div>
    `;
  }
}

function updateRobotText(step) {
  const text = document.getElementById("robotText");

  if (!text) return;

  if (step === 0) {
    text.innerHTML = "🤖 Halo! Aku <b>SemaBot</b>, yuk isi data dirimu dulu ya!";
  }

  if (step === 1) {
    text.innerHTML = "🤖 Sekarang isi data orang tua ya, biar lengkap 😊";
  }

  if (step === 2) {
    text.innerHTML = "🤖 Hampir selesai! Isi alamat dengan benar ya 🚀";
  }
}