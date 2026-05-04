import { db, collection, doc, updateDoc, auth, onSnapshot } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";


onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "login.html";
});
let globalData = [];
/* =====================
   REALTIME DATA
===================== */
let unsubscribe = null;

window.loadData = function (filter = "SEMUA") {

  const list = document.getElementById("list");

  if (unsubscribe) unsubscribe();

  unsubscribe = onSnapshot(collection(db, "ppdb"), (snapshot) => {

    list.innerHTML = "";

    globalData = [];

    snapshot.forEach((item) => {
      const data = item.data();
      const id = item.id;

      const isTrashMode = filter === "SAMPAH";

      if (isTrashMode && data.deleted !== true) return;
      if (!isTrashMode && data.deleted === true) return;
      if (!isTrashMode && filter !== "SEMUA" && data.status !== filter) return;

      globalData.push(data);

      let warna = "";
      if (data.status === "Diterima") warna = "green";
      else if (data.status === "Ditolak") warna = "red";
      else warna = "orange";

      list.innerHTML += `
  <div class="card" style="border-left:6px solid ${warna};">

    <h3 style="margin:0 0 8px 0;">${data.nama}</h3>

    <p style="margin:5px 0;">
      <b>Status:</b>
      <span class="badge" style="background:${warna};">
        ${data.status}
      </span>
    </p>

    <div style="font-size:14px; margin:10px 0; color:#555;">
      <div>📅 TTL: ${data.ttl || "-"}</div>
      <div>🏠 Alamat: ${data.alamatDomisili || "-"}</div>
      <div>👨‍👩‍👧 Orang Tua: ${data.namaAyah || ""} / ${data.namaIbu || ""}</div>
    </div>

    <div style="margin-top:10px;">
      <button class="action" onclick="updateStatus('${id}', 'Diterima')">✔ Terima</button>
      <button class="action" onclick="updateStatus('${id}', 'Ditolak')">✖ Tolak</button>
      <button class="action" onclick="updateStatus('${id}', 'Menunggu')">↩ Reset</button>

      <button class="action" style="background:#ef4444;color:white;" onclick="deleteData('${id}')">
        🗑 Hapus
      </button>

      ${data.deleted ? `
        <button class="action" style="background:#22c55e;color:white;" onclick="restoreData('${id}')">
          ♻ Pulihkan
        </button>
      ` : ""}
    </div>

  </div>
`;

    });

    updateStats(globalData);
  });
};

/* =====================
   UPDATE STATUS
===================== */
window.updateStatus = async function (id, statusBaru) {
  try {
    const ref = doc(db, "ppdb", id);

    await updateDoc(ref, {
      status: statusBaru
    });

    showToast("Status diubah jadi: " + statusBaru);

  } catch (error) {
    console.error(error);
    showToast("Gagal update status");
  }
};

/* =====================
   LOGOUT
===================== */
window.logout = function () {
  signOut(auth).then(() => {
    showToast("Logout berhasil");
    window.location.href = "login.html";
  });
};

/* =====================
   STATISTIK
===================== */
function updateStats(dataList) {

  let total = dataList.length;
  let menunggu = 0;
  let diterima = 0;
  let ditolak = 0;

  dataList.forEach(item => {
    if (item.status === "Menunggu") menunggu++;
    if (item.status === "Diterima") diterima++;
    if (item.status === "Ditolak") ditolak++;
  });

  document.getElementById("total").innerText = total;
  document.getElementById("menunggu").innerText = menunggu;
  document.getElementById("diterima").innerText = diterima;
  document.getElementById("ditolak").innerText = ditolak;
}

/* =====================
   DELETE
===================== */
window.deleteData = async function (id) {
  const yakin = await showConfirm("Yakin mau menghapus data ini?");
  if (!yakin) return;

  try {
    const ref = doc(db, "ppdb", id);

    await updateDoc(ref, {
      deleted: true
    });

    showToast("Data dipindahkan ke sampah");
  } catch (error) {
    console.error(error);
    showToast("Gagal menghapus data");
  }
};

/* =====================
   RESTORE
===================== */
window.restoreData = async function (id) {
  const yakin = await showConfirm("Pulihkan data ini?");
  if (!yakin) return;

  try {
    const ref = doc(db, "ppdb", id);

    await updateDoc(ref, {
      deleted: false
    });

    showToast("Data berhasil dipulihkan!", "success");
  } catch (error) {
    console.error(error);
    showToast("Gagal memulihkan data", "error");
  }
};

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(40px)";
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function showConfirm(message) {
  return new Promise((resolve) => {
    const box = document.getElementById("confirmBox");
    const text = document.getElementById("confirmText");
    const yes = document.getElementById("confirmYes");
    const no = document.getElementById("confirmNo");

    text.innerText = message;
    box.style.display = "flex";

    yes.onclick = () => {
      box.style.display = "none";
      resolve(true);
    };

    no.onclick = () => {
      box.style.display = "none";
      resolve(false);
    };
  });
}

window.exportExcel = function () {

  if (globalData.length === 0) {
    showToast("Tidak ada data", "error");
    return;
  }

  const dataExcel = globalData.map(item => ({
    Nama: item.nama || "",
    Status: item.status || "",
    TTL: item.ttl || "",
    TempatLahir: item.tempatLahir || "",
    NIK: item.nik || "",
    AsalSekolah: item.asalSekolah || "",
    Alamat: item.alamatDomisili || "",
    OrangTua: `${item.namaAyah || ""} / ${item.namaIbu || ""}`
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataExcel);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "PPDB");

  XLSX.writeFile(workbook, "Data_PPDB.xlsx");

  showToast("Export berhasil 📊", "success");
};