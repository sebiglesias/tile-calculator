(() => {
  'use strict';

  const state = {
    length: 12,
    width: 10,
    deductions: 0,
    tilePreset: '12x24',
    tileSqFtPerPiece: 2.0,
    boxCoverageSqFt: 15.5,
    wastePct: 0.10,
    jointWidth: 0.125
  };

  const $ = s => document.querySelector(s);

  function calculate() {
    const netArea = Math.max(1, (state.length * state.width) - state.deductions);
    const totalAreaWithWaste = netArea * (1 + state.wastePct);

    // Boxes of tile
    const boxesCount = Math.ceil(totalAreaWithWaste / state.boxCoverageSqFt);
    const totalPurchasedSqFt = (boxesCount * state.boxCoverageSqFt).toFixed(1);
    const totalPieces = Math.ceil(totalAreaWithWaste / state.tileSqFtPerPiece);

    // Thin-Set Mortar (50 lb bag covers ~45-50 sq ft with 1/2" trowel)
    const mortarBags50lb = Math.max(1, Math.ceil(totalAreaWithWaste / 45));

    // Grout (25 lb bag covers ~100-150 sq ft depending on joint size)
    const coveragePerGroutBag = state.jointWidth >= 0.25 ? 75 : (state.jointWidth <= 0.0625 ? 150 : 110);
    const groutBags25lb = Math.max(1, Math.ceil(totalAreaWithWaste / coveragePerGroutBag));

    // Tile Spacers (pack of 250 or 500)
    const spacersPacks = Math.max(1, Math.ceil(totalPieces / 100));

    return {
      netArea: Math.round(netArea),
      totalAreaWithWaste: Math.round(totalAreaWithWaste),
      boxesCount,
      totalPurchasedSqFt,
      totalPieces,
      mortarBags50lb,
      groutBags25lb,
      spacersPacks
    };
  }

  function render() {
    const res = calculate();

    $('#metricTotalArea').textContent = res.totalAreaWithWaste;
    $('#metricNetArea').textContent = `Net room: ${res.netArea} sq ft · ${Math.round(state.wastePct * 100)}% pattern waste`;
    $('#metricBoxes').textContent = res.boxesCount;
    $('#metricTilePieces').textContent = `~${res.totalPieces} tiles (${res.totalPurchasedSqFt} sq ft total purchased)`;

    const tileName = $('#selectTilePreset').options[$('#selectTilePreset').selectedIndex].text;

    const materialsEl = $('#tileMaterialsList');
    materialsEl.innerHTML = `
      <div class="material-card">
        <div class="mat-left">
          <span class="mat-title">📦 ${tileName}</span>
          <span class="mat-sub">${res.boxesCount} boxes @ ${state.boxCoverageSqFt} sq ft/box · Covers ${res.totalPurchasedSqFt} sq ft</span>
        </div>
        <span class="mat-qty">${res.boxesCount} boxes</span>
      </div>

      <div class="material-card">
        <div class="mat-left">
          <span class="mat-title">🧱 Polymer-Modified Thin-Set Mortar (Gray or White)</span>
          <span class="mat-sub">50 lb bags · Formulated for large format porcelain & ceramic tile (~45 sq ft/bag)</span>
        </div>
        <span class="mat-qty">${res.mortarBags50lb} bags (50 lb)</span>
      </div>

      <div class="material-card">
        <div class="mat-left">
          <span class="mat-title">🧴 ${state.jointWidth >= 0.125 ? 'Sanded Grout' : 'Unsanded Grout'} (Joint width: ${$('#inputGroutJoint').options[$('#inputGroutJoint').selectedIndex].text})</span>
          <span class="mat-sub">25 lb bags · Stain-resistant formula for indoor/outdoor installation</span>
        </div>
        <span class="mat-qty">${res.groutBags25lb} bag${res.groutBags25lb > 1 ? 's' : ''} (25 lb)</span>
      </div>

      <div class="material-card">
        <div class="mat-left">
          <span class="mat-title">➕ Cross / T-Spacers or Leveling Clips</span>
          <span class="mat-sub">Packs of 250 spacers for uniform joints & lippage-free installation</span>
        </div>
        <span class="mat-qty">${res.spacersPacks} pack${res.spacersPacks > 1 ? 's' : ''}</span>
      </div>
    `;
  }

  // Bind Events
  document.addEventListener('DOMContentLoaded', () => {
    $('#inputLength').oninput = e => { state.length = parseFloat(e.target.value) || 1; render(); };
    $('#inputWidth').oninput = e => { state.width = parseFloat(e.target.value) || 1; render(); };
    $('#inputDeductions').oninput = e => { state.deductions = parseFloat(e.target.value) || 0; render(); };

    $('#selectTilePreset').onchange = e => {
      const val = e.target.value;
      state.tilePreset = val;
      if (val === '12x24') { state.tileSqFtPerPiece = 2.0; state.boxCoverageSqFt = 16.0; }
      else if (val === '12x12') { state.tileSqFtPerPiece = 1.0; state.boxCoverageSqFt = 15.0; }
      else if (val === '3x6') { state.tileSqFtPerPiece = 0.125; state.boxCoverageSqFt = 10.0; }
      else if (val === '6x24') { state.tileSqFtPerPiece = 1.0; state.boxCoverageSqFt = 12.0; }
      else if (val === '24x24') { state.tileSqFtPerPiece = 4.0; state.boxCoverageSqFt = 16.0; }
      $('#inputBoxSqFt').value = state.boxCoverageSqFt;
      render();
    };

    $('#inputBoxSqFt').oninput = e => { state.boxCoverageSqFt = parseFloat(e.target.value) || 1; render(); };
    $('#selectPattern').onchange = e => { state.wastePct = parseFloat(e.target.value); render(); };
    $('#inputGroutJoint').onchange = e => { state.jointWidth = parseFloat(e.target.value); render(); };

    $('#btnCopyTileMaterials').onclick = () => {
      const res = calculate();
      const btn = $('#btnCopyTileMaterials');
      const tileName = $('#selectTilePreset').options[$('#selectTilePreset').selectedIndex].text;
      const text = `Tile Renovation Shopping List:
• Tile: ${res.boxesCount} boxes (${tileName}, ~${res.totalPurchasedSqFt} sq ft total)
• Thin-Set Mortar (50 lb): ${res.mortarBags50lb} bags
• Grout (25 lb): ${res.groutBags25lb} bags
• Spacers: ${res.spacersPacks} pack(s)
Total Floor Area: ${res.netArea} sq ft (+${Math.round(state.wastePct * 100)}% waste = ${res.totalAreaWithWaste} sq ft)

Calculated with: https://sebiglesias.com.ar/tile-calculator/`;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          const orig = btn.innerHTML;
          btn.innerHTML = '<span>✅</span> Checklist Copied to Clipboard!';
          btn.style.background = '#059669';
          setTimeout(() => {
            btn.innerHTML = orig;
            btn.style.background = '';
          }, 2500);
        });
      }
    };

    render();
  });
})();
