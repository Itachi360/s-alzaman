let currentVersion = localStorage.getItem("app_version");

async function checkUpdate() {
    const res = await fetch("/version.json?cache=" + Date.now(), {
        cache: "no-store"
    });

    const data = await res.json();

    if (!currentVersion) {
        localStorage.setItem("app_version", data.version);
        return;
    }

    if (data.version !== currentVersion) {
        showUpdateBox(data.version);
    }
}

function showUpdateBox(newVersion) {
    const box = document.createElement("div");

    box.style = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #111;
        color: white;
        padding: 15px;
        border-radius: 12px;
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
        z-index: 99999;
        font-family: sans-serif;
    `;

    box.innerHTML = `
        <p>🔔 يوجد تحديث جديد (${newVersion})</p>
        <button id="updateNow">تحديث الآن</button>
        <button id="later">لاحقًا</button>
    `;

    document.body.appendChild(box);

    document.getElementById("updateNow").onclick = () => {
        localStorage.setItem("app_version", newVersion);
        location.reload(true); // تحديث فوري
    };

    document.getElementById("later").onclick = () => {
        box.remove(); // تجاهل التحديث
    };
}

// تشغيل الفحص كل 10 ثواني
setInterval(checkUpdate, 10000);

// أول تشغيل
checkUpdate();
