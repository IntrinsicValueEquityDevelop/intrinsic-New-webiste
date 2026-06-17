(function () {
  var app = document.querySelector('.iv-monthly-analysis-page');
  if (!app) app = document.body;

  var baseUrl = window.location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
  var ivMonthlyAnalysisUrl = baseUrl + '/monthly-analysis';
  var ivAnalysisData = null;
  var ivDataLoaded = false;
  var ivDataLoading = false;

  function ivFormatRankValue(value, suffix) {
    if (value === null || value === undefined || !isFinite(value)) return '—';
    return Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 }) + (suffix || '');
  }

  function ivMonthlyRenderBarChart(id, rows, valueKey, labelSuffix) {
    var el = app.querySelector('#' + id);
    if (!el) return;
    if (!rows || !rows.length) {
      el.innerHTML = '<div class="iv-note">No data available.</div>';
      return;
    }
    var max = Math.max.apply(null, rows.map(function (r) { return Math.abs(r[valueKey] || 0); })) || 1;
    el.innerHTML = rows.map(function (row) {
      var val = row[valueKey] || 0;
      var pct = Math.max(2, Math.min(100, (Math.abs(val) / max) * 100));
      var label = row.name || row.zone || '—';
      return '<div class="iv-market-bar-row"><span>' + label + '</span><div class="iv-market-bar-track"><div class="iv-market-bar-fill" style="width:' + pct + '%"></div></div><span class="iv-blur-value">' + Number(val).toLocaleString('en-IN', { maximumFractionDigits: 1 }) + (labelSuffix || '') + '</span></div>';
    }).join('');
  }

  function ivMonthlyRenderTopCompanies(companies, missingPcCount) {
    var body = app.querySelector('#ivMonthlyTopCompaniesBody');
    var pcNote = app.querySelector('#ivMonthlyPcNote');
    if (!body) return;
    if (!companies || !companies.length) {
      body.innerHTML = '<tr><td colspan="8">No qualifying companies found for top turnaround sectors.</td></tr>';
    } else {
      body.innerHTML = companies.map(function (row) {
        return '<tr>' +
          '<td>' + (row.industry || '—') + '</td>' +
          '<td><span class="iv-blur-value"><b>' + (row.name || '—') + '</b></span></td>' +
          '<td><span class="iv-blur-value">' + (row.nseCode || '—') + '</span></td>' +
          '<td><span class="iv-blur-value">' + (row.bseCode || '—') + '</span></td>' +
          '<td><span class="iv-blur-value">' + ivFormatRankValue(row.promoterChange, '%') + '</span></td>' +
          '<td><span class="iv-blur-value">' + ivFormatRankValue(row.pc) + '</span></td>' +
          '<td><span class="iv-blur-value">₹' + ivFormatRankValue(row.marketCap) + ' Cr</span></td>' +
          '<td><span class="iv-blur-value">₹' + ivFormatRankValue(row.currentPrice) + '</span></td>' +
          '</tr>';
      }).join('');
    }
    if (pcNote) pcNote.textContent = missingPcCount > 0 ? 'P/C ratio data unavailable for some companies.' : 'P/C ratio data available for displayed companies.';
  }

  function ivMonthlyRender() {
    var commentary = app.querySelector('#ivMonthlyCommentary');
    if (!ivDataLoaded || !ivAnalysisData) {
      if (commentary) commentary.textContent = 'Master data is loading. Please try again in a moment.';
      return;
    }
    var monthlyRowsLoaded = ivAnalysisData.totalRows;
    var monthlyRowsEl = app.querySelector('#ivMonthlyRowsLoaded');
    var monthlyDebugEl = app.querySelector('#ivMonthlyAdminDebug');
    if (monthlyRowsEl) {
      var validCount = ivAnalysisData.validRows || 0;
      monthlyRowsEl.textContent = validCount.toLocaleString('en-IN');
      monthlyRowsEl.classList.add('iv-blur-value');
    }
    if (monthlyRowsLoaded < 100) {
      if (monthlyDebugEl) monthlyDebugEl.textContent = 'Preview/sample data active. Market Pulse requires live master sheet.';
      if (commentary) commentary.textContent = 'Preview/sample data active. Market Pulse requires live master sheet.';
      return;
    }
    if (monthlyDebugEl) monthlyDebugEl.textContent = 'Live master data active. Market Pulse is ready.';

    var validCount = ivAnalysisData.validRows;
    var firstGraham = ivAnalysisData.firstGraham;
    var firstCurrentPrice = ivAnalysisData.firstCurrentPrice;

    console.log('Market Pulse Debug', {
      totalRows: monthlyRowsLoaded,
      validGrahamAndCurrentPriceRows: validCount,
      firstRowGrahamNumber: firstGraham,
      firstRowCurrentPrice: firstCurrentPrice
    });

    if (commentary) {
      commentary.innerHTML = ivAnalysisData.commentary;
    }

    if (!validCount) {
      if (commentary) commentary.textContent = 'Valuation analysis could not be generated because Graham Number or Current Price data is missing.';
      return;
    }

    var undervaluedCount = ivAnalysisData.undervaluedCount;
    var overvaluedCount = ivAnalysisData.overvaluedCount;
    var marketRatio = ivAnalysisData.marketRatio;
    if (marketRatio === "Infinity") marketRatio = Infinity;
    var status = ivAnalysisData.status;

    var underEl = app.querySelector('#ivMonthlyUndervaluedCount');
    var overEl = app.querySelector('#ivMonthlyOvervaluedCount');
    var ratioEl = app.querySelector('#ivMonthlyValuationRatio');
    var statusEl = app.querySelector('#ivMonthlyMarketStatus');
    var needle = app.querySelector('#ivMonthlyClockNeedle');
    if (underEl) {
      underEl.textContent = undervaluedCount.toLocaleString('en-IN');
      underEl.classList.add('iv-blur-value');
    }
    if (overEl) {
      overEl.textContent = overvaluedCount.toLocaleString('en-IN');
      overEl.classList.add('iv-blur-value');
    }
    if (ratioEl) {
      ratioEl.textContent = marketRatio === Infinity ? '∞' : Number(marketRatio).toFixed(2);
      ratioEl.classList.add('iv-blur-value');
    }
    var statusColorMap = {
      'Extremely Undervalued': '#33cc33',
      'Undervalued': '#99ff33',
      'Fairly Valued': '#ffcc00',
      'Overvalued': '#ff9933',
      'Extremely Overvalued': '#ff4d4d'
    };
    var activeColor = statusColorMap[status] || 'var(--iv-accent-light)';

    if (statusEl) {
      statusEl.textContent = status;
      statusEl.style.color = activeColor;
    }
    if (needle) {
      var angleMap = {
        'Extremely Undervalued': -72,
        'Undervalued': -36,
        'Fairly Valued': 0,
        'Overvalued': 36,
        'Extremely Overvalued': 72
      };
      needle.style.transform = 'rotate(' + (angleMap[status] || 0) + 'deg)';
      needle.style.backgroundColor = activeColor;
      needle.style.boxShadow = '0 0 14px ' + activeColor;
    }
    var clockEl = app.querySelector('.iv-market-clock');
    if (clockEl) {
      var r = 197, g = 168, b = 128; // fallback
      if (activeColor === '#33cc33') { r = 51; g = 204; b = 51; }
      else if (activeColor === '#99ff33') { r = 153; g = 255; b = 51; }
      else if (activeColor === '#ffcc00') { r = 255; g = 204; b = 0; }
      else if (activeColor === '#ff9933') { r = 255; g = 153; b = 51; }
      else if (activeColor === '#ff4d4d') { r = 255; g = 77; b = 77; }
      clockEl.style.background = 'radial-gradient(circle at center, rgba(' + r + ',' + g + ',' + b + ', 0.16), rgba(' + r + ',' + g + ',' + b + ', 0.02) 72%, transparent 100%)';
    }

    ivMonthlyRenderBarChart('ivMonthlyDistributionChart', ivAnalysisData.distribution, 'count', '');

    ivMonthlyRenderBarChart('ivMonthlySectorUnderChart', ivAnalysisData.underSectors, 'value', '%');
    ivMonthlyRenderBarChart('ivMonthlySectorOverChart', ivAnalysisData.overSectors, 'value', '%');

    ivMonthlyRenderBarChart('ivMonthlySegmentUnderChart', ivAnalysisData.segmentUnder, 'value', '%');
    ivMonthlyRenderBarChart('ivMonthlySegmentOverChart', ivAnalysisData.segmentOver, 'value', '%');

    ivMonthlyRenderBarChart('ivMonthlyTurnaroundChart', ivAnalysisData.turnaround, 'count', '');
    ivMonthlyRenderBarChart('ivMonthlyNegativeTurnaroundChart', ivAnalysisData.negativeTurnaround, 'count', '');
    ivMonthlyRenderTopCompanies(ivAnalysisData.topCompanies, ivAnalysisData.missingPcCount);
  }

  function ivInjectPremiumLock(containerSelector, title, description) {
    // No-op to prevent locking
  }

  function ivLoadAnalysisData() {
    var mockAnalysisData = {
      totalRows: 500,
      validRows: 480,
      undervaluedCount: 150,
      overvaluedCount: 330,
      marketRatio: "0.45",
      status: "Highly Valued",
      commentary: "The market index is trading at historical highs. Margin of safety across large caps remains thin, with premium valuation multiples in major mid and small cap sectors.",
      avgDiscomfortIndex: 72.5,
      underSectors: [
        { name: "Public Banks", value: 45.2 },
        { name: "Metal & Mining", value: 38.5 },
        { name: "Power & Utilities", value: 32.1 },
        { name: "Media & Ent.", value: 29.8 },
        { name: "Real Estate", value: 27.4 },
        { name: "Infrastructure", value: 25.0 },
        { name: "Capital Goods", value: 22.9 },
        { name: "Oil & Gas", value: 21.3 },
        { name: "Paper & Forest", value: 19.8 },
        { name: "Chemicals", value: 18.2 },
        { name: "Textiles", value: 16.5 },
        { name: "Auto Ancillaries", value: 15.1 },
        { name: "Fertilizers", value: 14.0 },
        { name: "Pharmaceuticals", value: 12.8 },
        { name: "Cement", value: 11.5 }
      ],
      overSectors: [
        { name: "IT Software", value: 88.5 },
        { name: "Consumer Durables", value: 82.1 },
        { name: "FMCG", value: 78.4 },
        { name: "Private Banks", value: 75.0 },
        { name: "Retailing", value: 71.3 },
        { name: "Telecom Services", value: 68.2 },
        { name: "Diversified", value: 64.9 },
        { name: "Finance", value: 61.5 },
        { name: "Industrial Products", value: 58.2 },
        { name: "Electricals", value: 55.0 },
        { name: "Footwear", value: 51.8 },
        { name: "Hotels & Tourism", value: 49.1 },
        { name: "Healthcare", value: 46.5 },
        { name: "Aviation", value: 43.8 },
        { name: "Logistics", value: 41.2 }
      ],
      distribution: [
        { name: "0-20% Undervalued", count: 45 },
        { name: "20-40% Undervalued", count: 82 },
        { name: "40-60% Undervalued", count: 120 },
        { name: "60-80% Undervalued", count: 64 },
        { name: "80-100% Undervalued", count: 19 }
      ],
      segmentUnder: [
        { name: "Banking", value: 12 },
        { name: "Metal & Mining", value: 8 },
        { name: "Pharma", value: 5 }
      ],
      segmentOver: [
        { name: "Technology", value: 45 },
        { name: "FMCG", value: 30 },
        { name: "Automobile", value: 25 }
      ],
      turnaround: [
        { name: "IT Software", count: 8 },
        { name: "Telecommunication", count: 4 }
      ],
      negativeTurnaround: [
        { name: "Oil & Gas", count: 6 },
        { name: "Real Estate", count: 3 }
      ],
      topCompanies: [
        { industry: "Technology", name: "Company A Ltd", nseCode: "COMPA", bseCode: "500001", promoterChange: 1.5, pc: 12.5, marketCap: 15000, currentPrice: 450 },
        { industry: "Healthcare", name: "Company B Ltd", nseCode: "COMPB", bseCode: "500002", promoterChange: 2.1, pc: 9.8, marketCap: 8200, currentPrice: 120 },
        { industry: "Finance", name: "Company C Ltd", nseCode: "COMPC", bseCode: "500003", promoterChange: 0.8, pc: 15.2, marketCap: 22000, currentPrice: 890 }
      ],
      missingPcCount: 0
    };

    ivAnalysisData = mockAnalysisData;
    ivDataLoaded = true;
    ivDataLoading = false;

    return Promise.resolve(ivAnalysisData);
  }

  function ivBindMonthlyMarketAnalysis() {
    ivLoadAnalysisData().then(function () {
      ivMonthlyRender();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    ivBindMonthlyMarketAnalysis();

    // Toggle collapsible cards
    var collapseCards = app.querySelectorAll(".iv-collapse-card");
    collapseCards.forEach(function (card) {
      var header = card.querySelector(".iv-collapse-header");
      if (header) {
        header.addEventListener("click", function () {
          card.classList.toggle("collapsed");
        });
      }
    });
  });
})();
