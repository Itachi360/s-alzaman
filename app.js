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
        showUpdate(data.version);
    }
}

function showUpdate(newVersion) {
    const box = document.createElement("div");

    box.style = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #111;
        color: white;
        padding: 15px;
        border-radius: 12px;
        z-index: 999999;
    `;

    box.innerHTML = `
        <p>🔔 يوجد تحديث جديد</p>
        <button id="update">تحديث الآن</button>
        <button id="later">لاحقًا</button>
    `;

    document.body.appendChild(box);

    document.getElementById("update").onclick = async () => {

        localStorage.setItem("app_version", newVersion);

        // 🔥 أهم سطر (يجبر PWA على التحديث)
        if (navigator.serviceWorker) {
            const regs = await navigator.serviceWorker.getRegistrations();
            for (let reg of regs) {
                await reg.update();
            }
        }

        location.reload();
    };

    document.getElementById("later").onclick = () => {
        box.remove();
    };
}

setInterval(checkUpdate, 10000);
checkUpdate();