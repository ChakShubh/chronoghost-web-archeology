// Replace with your active AWS Lambda Function URL
const API_ENDPOINT = "https://6n7bucpnwsarkbxkxknrjerr640skati.lambda-url.ap-southeast-2.on.aws/";

let soundEnabled = true;
const audioToggle = document.getElementById('audioToggle');
if (audioToggle) {
    audioToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        audioToggle.innerText = soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
    });
}

function playDialUpSound() {
    if (!soundEnabled) return;
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
    } catch (e) { }
}

const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
    });
}

const scanBtn = document.getElementById('scanBtn');
const urlInput = document.getElementById('urlInput');
const statusBanner = document.getElementById('statusBanner');
const artifactViewport = document.getElementById('artifactViewport');
const telemetrySection = document.getElementById('telemetrySection');

if (scanBtn) {
    scanBtn.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        if (!url) return alert('Please enter a target URL.');

        playDialUpSound();
        scanBtn.disabled = true;
        scanBtn.innerText = "PARSING...";
        statusBanner.classList.remove('hidden');
        statusBanner.innerHTML = `[ CONNECTING TO AWS LAMBDA ]<br>Excavating DOM artifact and stripping trackers...`;
        artifactViewport.classList.add('hidden');
        telemetrySection.classList.add('hidden');

        try {
            const res = await fetch(API_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            document.getElementById('rawSize').innerText = data.telemetry.rawSizeKb + ' KB';
            document.getElementById('cleanSize').innerText = data.telemetry.cleanSizeKb + ' KB';
            document.getElementById('reduction').innerText = data.telemetry.weightReductionPercent + '%';
            document.getElementById('dialup56k').innerText = data.telemetry.dialup56kSec + 's';
            document.getElementById('modernLatency').innerText = `Lambda RTT: ${data.telemetry.modernLatencyMs}ms`;

            statusBanner.classList.add('hidden');
            telemetrySection.classList.remove('hidden');
            artifactViewport.innerHTML = `<h2 class="text-base font-bold pb-2 mb-2 border-b border-current">${data.title}</h2>` + data.sanitizedHtml;
            artifactViewport.classList.remove('hidden');
        } catch (err) {
            statusBanner.innerHTML = `<span class="text-red-500">[ ERROR ] ${err.message}</span>`;
        } finally {
            scanBtn.disabled = false;
            scanBtn.innerText = "▶ Excavate";
        }
    });
}