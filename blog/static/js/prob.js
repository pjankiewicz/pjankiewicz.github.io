// ======== SETUP ========
const canvas = document.getElementById("prob-chart");
const ctx = canvas.getContext("2d");
// Make the canvas high‐DPI–ready
function resizeCanvasToDisplaySize(canvas) {
    const rect = canvas.getBoundingClientRect();
    if (
        canvas.width !== rect.width ||
        canvas.height !== rect.height
    ) {
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
}
resizeCanvasToDisplaySize(canvas);

// Control elements
const baseProbInput = document.getElementById("base-prob");
const thresholdInput = document.getElementById("threshold");
const maxNInput = document.getElementById("max-n");

const crossNSpan = document.getElementById("cross-n");
const crossPctSpan = document.getElementById("cross-pct");

// When any input changes, redraw
[baseProbInput, thresholdInput, maxNInput].forEach((el) => {
    el.addEventListener("input", drawChart);
});

// ======== CORE LOGIC ========
function drawChart() {
    resizeCanvasToDisplaySize(canvas);

    // Parse inputs
    let p = parseFloat(baseProbInput.value) / 100;
    let threshold = parseFloat(thresholdInput.value) / 100;
    let maxN = parseInt(maxNInput.value, 10);

    if (isNaN(p) || p < 0) p = 0;
    if (p > 1) p = 1;
    if (isNaN(threshold) || threshold < 0) threshold = 0;
    if (threshold > 1) threshold = 1;
    if (isNaN(maxN) || maxN < 1) maxN = 1;

    // Compute cumulative probabilities for n = 1…maxN
    // cumProb[n] = 1 - (1 - p)^n
    const cumProbs = [];
    for (let n = 1; n <= maxN; n++) {
        const cp = 1 - Math.pow(1 - p, n);
        cumProbs.push(cp);
    }

    // Find smallest n where cumProbs[n-1] >= threshold
    let crossN = null;
    for (let i = 0; i < cumProbs.length; i++) {
        if (cumProbs[i] >= threshold) {
            crossN = i + 1;
            break;
        }
    }
    let crossPct = crossN !== null ? (cumProbs[crossN - 1] * 100).toFixed(1) : null;

    crossNSpan.textContent = crossN === null ? "—" : `n = ${crossN}`;
    crossPctSpan.textContent = crossPct === null ? "—" : `${crossPct}`;

    // === DRAWING ===
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    const MARGIN = { top: 40, right: 40, bottom: 40, left: 50 };
    const innerW = W - MARGIN.left - MARGIN.right;
    const innerH = H - MARGIN.top - MARGIN.bottom;

    // Clear background
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.translate(MARGIN.left, MARGIN.top);

    // Axes lines
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, innerH);
    ctx.lineTo(innerW, innerH);
    ctx.stroke();
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, innerH);
    ctx.stroke();

    // Labels
    ctx.fillStyle = "#333";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("n (attempts)", innerW / 2, innerH + 30);
    ctx.save();
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText("Cum. Probability (%)", -innerH / 2, -35);
    ctx.restore();

    // Determine Y-axis scale: from 0% up to 100%
    const yMin = 0;
    const yMax = 1; // represent 100% as 1

    // Tick marks and gridlines
    ctx.strokeStyle = "#ddd";
    ctx.fillStyle = "#333";
    ctx.lineWidth = 0.5;
    ctx.font = "12px sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    // Horizontal grid at 0.0, 0.2, 0.4, 0.6, 0.8, 1.0
    for (let frac = 0; frac <= 1.0 + 1e-9; frac += 0.2) {
        const y = innerH - (frac - yMin) / (yMax - yMin) * innerH;
        // light grid line
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(innerW, y);
        ctx.stroke();
        // label at left
        ctx.fillStyle = "#333";
        const pctLabel = Math.round(frac * 100);
        ctx.fillText(pctLabel + "%", -8, y);
    }

    // X-axis ticks for each integer n = 1…maxN
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let n = 1; n <= maxN; n++) {
        const x = ((n - 1) / (maxN - 1)) * innerW;
        // small vertical tick
        ctx.beginPath();
        ctx.moveTo(x, innerH);
        ctx.lineTo(x, innerH + 6);
        ctx.stroke();
        // label
        ctx.fillStyle = "#333";
        ctx.fillText(n.toString(), x, innerH + 8);
    }

    // Plot cumulative-probability curve
    ctx.strokeStyle = "#007bff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < cumProbs.length; i++) {
        const n = i + 1;
        const pct = cumProbs[i]; // between 0 and 1
        const x = ((n - 1) / (maxN - 1)) * innerW;
        const y = innerH - ((pct - yMin) / (yMax - yMin)) * innerH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw points as dots
    ctx.fillStyle = "#007bff";
    for (let i = 0; i < cumProbs.length; i++) {
        const n = i + 1;
        const pct = cumProbs[i];
        const x = ((n - 1) / (maxN - 1)) * innerW;
        const y = innerH - ((pct - yMin) / (yMax - yMin)) * innerH;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Draw threshold horizontal line
    ctx.strokeStyle = "#ff4d4d";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    const yThresh = innerH - ((threshold - yMin) / (yMax - yMin)) * innerH;
    ctx.beginPath();
    ctx.moveTo(0, yThresh);
    ctx.lineTo(innerW, yThresh);
    ctx.stroke();
    ctx.setLineDash([]); // reset

    // If crossN exists, highlight that point
    if (crossN !== null) {
        const i = crossN - 1;
        const x = ((crossN - 1) / (maxN - 1)) * innerW;
        const y = innerH - ((cumProbs[i] - yMin) / (yMax - yMin)) * innerH;
        // draw a larger circle
        ctx.fillStyle = "#ff4d4d";
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();
    }

    ctx.restore();
}

// Initial draw
drawChart();

// Redraw on window resize
window.addEventListener("resize", drawChart);