(function () {
  var app = document.querySelector('.iv-ranking-page');
  if (!app) app = document.body;

  var baseUrl = window.location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';

function ivFormatINR(value) {
      if (!isFinite(value)) return '—';
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(Math.round(value));
    }

function ivFormatCompactINR(value) {
      if (!isFinite(value)) return '—';
      var abs = Math.abs(value);
      if (abs >= 10000000) return '₹' + (value / 10000000).toFixed(value >= 100000000 ? 0 : 1) + ' Cr';
      if (abs >= 100000) return '₹' + (value / 100000).toFixed(value >= 1000000 ? 0 : 1) + ' L';
      return ivFormatINR(value);
    }

function ivSetupCanvas(canvas) {
      if (!canvas) return null;
      var rect = canvas.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      var width = Math.max(280, Math.floor(rect.width));
      var height = Math.max(220, Math.floor(rect.height || 260));
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      var ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { ctx: ctx, width: width, height: height };
    }

function ivDrawRoundedRect(ctx, x, y, w, h, r) {
      var radius = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    }


    function ivEscapeHtml(str) {
      if (!str) return '';
      return str.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
    }


function ivRankNumber(value) {
      var number = Number(value);
      return isFinite(number) ? number : null;
    }

    function normalizeData(data) {
      return data.map(function (item) {
        return {
          companyName: item.companyName || item['Company Name'] || '',
          industry: item.industry || item['Industry'] || '',
          sector: item.sector || item['Sector'] || '',
          bseCode: item.bseCode || item['BSE Code'] || '',
          nseCode: item.nseCode || item['NSE Code'] || '',
          currentPrice: ivRankNumber(item.currentPrice || item['Current Price'] || item['CMP'] || item['Price']),
          marketCapitalization: ivRankNumber(item.marketCapitalization || item['Market Capitalization'] || item['Market Cap'] || item['Mcap'] || item['MCap']),
          promoterHolding: ivRankNumber(item.promoterHolding || item['Promoter Holding'] || item['Promoter holding'] || item['Promoter Holding %']),
          salesGrowth3Years: ivRankNumber(item.salesGrowth3Years || item['Sales Growth 3Years'] || item['Sales growth 3Years'] || item['Sales Growth 3 Years']),
          averageRoce3Years: ivRankNumber(item.averageRoce3Years || item['Average return on capital employed 3Years'] || item['Average ROCE 3Years'] || item['Average ROCE 3 Years'] || item['Avg ROCE 3Y']),
          priceToBookValue: ivRankNumber(item.priceToBookValue || item['Price to book value'] || item['Price to Book Value'] || item['P/B'] || item['Price to Book']),
          raw: item
        };
      });
    }

    function ivAssignMetricRanks(data, key, direction, outputKey) {
      var valid = data.filter(function (item) { return item[key] !== null; }).sort(function (a, b) {
        return direction === 'desc' ? b[key] - a[key] : a[key] - b[key];
      });
      var missingRank = data.length + 1;
      data.forEach(function (item) { item[outputKey] = missingRank; });
      valid.forEach(function (item, index) { item[outputKey] = index + 1; });
    }

    function calculateRanks(data) {
      var ranked = normalizeData(data);
      ivAssignMetricRanks(ranked, 'salesGrowth3Years', 'desc', 'salesRank');
      ivAssignMetricRanks(ranked, 'averageRoce3Years', 'desc', 'roceRank');
      ivAssignMetricRanks(ranked, 'priceToBookValue', 'asc', 'pbRank');
      ranked.forEach(function (item) {
        item.combinedRank = item.salesRank + item.roceRank + item.pbRank;
      });
      return ranked.sort(function (a, b) {
        if (a.combinedRank !== b.combinedRank) return a.combinedRank - b.combinedRank;
        return (a.companyName || '').localeCompare(b.companyName || '');
      }).map(function (item, index) {
        item.rank = index + 1;
        return item;
      });
    }

    function filterData(data, filters) {
      return data.filter(function (item) {
        var search = (filters.search || '').toLowerCase();
        var industryMatch = !filters.industry || item.industry === filters.industry;
        var searchMatch = !search || [item.companyName, item.nseCode, item.bseCode, item.sector, item.industry].join(' ').toLowerCase().indexOf(search) >= 0;
        var minMatch = filters.minMcap === null || (item.marketCapitalization !== null && item.marketCapitalization >= filters.minMcap);
        var maxMatch = filters.maxMcap === null || (item.marketCapitalization !== null && item.marketCapitalization <= filters.maxMcap);
        return industryMatch && searchMatch && minMatch && maxMatch;
      });
    }

    function sortData(data, sortKey, sortDirection) {
      return data.slice().sort(function (a, b) {
        var av = a[sortKey];
        var bv = b[sortKey];
        if (typeof av === 'string' || typeof bv === 'string') {
          return sortDirection === 'asc' ? String(av || '').localeCompare(String(bv || '')) : String(bv || '').localeCompare(String(av || ''));
        }
        av = av === null || av === undefined ? Number.POSITIVE_INFINITY : av;
        bv = bv === null || bv === undefined ? Number.POSITIVE_INFINITY : bv;
        return sortDirection === 'asc' ? av - bv : bv - av;
      });
    }

    var urlParams = new URLSearchParams(window.location.search);
    var industryParam = urlParams.get('industry') || '';

    var ivRankingState = window.ivRankingState || { page: 1, pageSize: 25, sortKey: 'rank', sortDirection: 'asc', rows: [], allIndustries: [], pendingIndustry: industryParam };
    if (!ivRankingState) ivRankingState = { page: 1, pageSize: 25, sortKey: 'rank', sortDirection: 'asc', rows: [], allIndustries: [], pendingIndustry: industryParam };
    if (!ivRankingState.sortKey) ivRankingState.sortKey = 'rank';
    if (!ivRankingState.sortDirection) ivRankingState.sortDirection = 'asc';
    if (!ivRankingState.page) ivRankingState.page = 1;
    if (!ivRankingState.pageSize) ivRankingState.pageSize = 25;
    if (!ivRankingState.rows) ivRankingState.rows = [];
    if (!ivRankingState.allIndustries) ivRankingState.allIndustries = [];
    if (industryParam) ivRankingState.pendingIndustry = industryParam;
    window.ivRankingState = ivRankingState;

    function ivFormatRankValue(value, suffix) {
      if (value === null || value === undefined || !isFinite(value)) return '—';
      return Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 }) + (suffix || '');
    }

    function ivGetRankingElements() {
      return {
        search: app.querySelector('#ivRankingSearch'),
        industry: app.querySelector('#ivRankingIndustry'),
        count: app.querySelector('#ivRankingCount'),
        minMcap: app.querySelector('#ivRankingMinMcap'),
        maxMcap: app.querySelector('#ivRankingMaxMcap'),
        apply: app.querySelector('#ivRankingApply'),
        reset: app.querySelector('#ivRankingReset'),
        body: app.querySelector('#ivRankingTableBody'),
        shown: app.querySelector('#ivRankingShown'),
        industries: app.querySelector('#ivRankingIndustries'),
        best: app.querySelector('#ivRankingBest'),
        prev: app.querySelector('#ivRankingPrev'),
        next: app.querySelector('#ivRankingNext'),
        pageInfo: app.querySelector('#ivRankingPageInfo')
      };
    }

    function ivGetRankingFilters() {
      var elements = ivGetRankingElements();
      var minRaw = elements.minMcap ? elements.minMcap.value : '';
      var maxRaw = elements.maxMcap ? elements.maxMcap.value : '';
      var selectedIndustry = elements.industry ? elements.industry.value : '';
      if (!selectedIndustry && ivRankingState.pendingIndustry) {
        selectedIndustry = ivRankingState.pendingIndustry;
      }
      return {
        search: elements.search ? elements.search.value.trim() : '',
        industry: selectedIndustry,
        count: elements.count ? Number(elements.count.value) : 0,
        minMcap: minRaw === '' ? null : Number(minRaw),
        maxMcap: maxRaw === '' ? null : Number(maxRaw)
      };
    }

    function ivRankingSortData(rows, sortKey, sortDir) {
      return rows.slice().sort(function (a, b) {
        var av = a[sortKey], bv = b[sortKey];
        if (typeof av === 'string' || typeof bv === 'string') {
          return sortDir === 'asc'
            ? String(av || '').localeCompare(String(bv || ''))
            : String(bv || '').localeCompare(String(av || ''));
        }
        av = (av === null || av === undefined) ? (sortDir === 'asc' ? Infinity : -Infinity) : av;
        bv = (bv === null || bv === undefined) ? (sortDir === 'asc' ? Infinity : -Infinity) : bv;
        return sortDir === 'asc' ? av - bv : bv - av;
      });
    }

    function ivRenderRankingPage() {
      var elements = ivGetRankingElements();
      if (!elements.body) return;

      var sortKey = ivRankingState.sortKey || 'rank';
      var sortDir = ivRankingState.sortDirection || 'asc';
      var sorted = ivRankingSortData(ivRankingState.rows, sortKey, sortDir);

      var totalPages = Math.max(1, Math.ceil(sorted.length / ivRankingState.pageSize));
      if (ivRankingState.page > totalPages) ivRankingState.page = totalPages;
      var start = (ivRankingState.page - 1) * ivRankingState.pageSize;
      var pageRows = sorted.slice(start, start + ivRankingState.pageSize);

      if (!pageRows.length) {
        elements.body.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#AAB6CC;padding:20px">No matching companies found.</td></tr>';
      } else {
        elements.body.innerHTML = pageRows.map(function (item) {
          var scoreColor = item.totalScore <= 100 ? '#34D399' : item.totalScore <= 300 ? '#F4D676' : '#AAB6CC';
          return '<tr>' +
            '<td><b>' + item.rank + '</b></td>' +
            '<td><b>' + item.name + '</b><br><small style="color:#AAB6CC">' + (item.nseCode || item.bseCode || '') + '</small></td>' +
            '<td><span class="iv-blur-value">' + (item.sector || item.industry || '—') + '</span></td>' +
            '<td><span class="iv-blur-value">₹' + ivFormatRankValue(item.mcap) + ' Cr</span></td>' +
            '<td><span class="iv-blur-value">' + ivFormatRankValue(item.sales3Y, '%') + ' (' + ivFormatRankValue(item.salesRank) + ')</span></td>' +
            '<td><span class="iv-blur-value">' + ivFormatRankValue(item.roce3Y, '%') + ' (' + ivFormatRankValue(item.roceRank) + ')</span></td>' +
            '<td><span class="iv-blur-value">' + ivFormatRankValue(item.pb) + ' (' + ivFormatRankValue(item.pbRank) + ')</span></td>' +
            '<td><span class="iv-blur-value"><b style="color:' + scoreColor + '">' + (item.totalScore !== null ? item.totalScore : '—') + '</b></span></td>' +
            '</tr>';
        }).join('');
      }

      if (elements.shown) elements.shown.innerHTML = '<span class="iv-blur-value">' + ivRankingState.rows.length + '</span>';
      if (elements.pageInfo) elements.pageInfo.textContent = 'Page ' + ivRankingState.page + ' of ' + totalPages;
      if (elements.prev) elements.prev.disabled = ivRankingState.page <= 1;
      if (elements.next) elements.next.disabled = ivRankingState.page >= totalPages;
    }

    function ivRenderRankingTable() {
      var elements = ivGetRankingElements();
      if (!elements.body) return;

      var companiesList = [
        { name: "Reliance Industries Ltd.", code: "RELIANCE", bse: "500325", sector: "Energy", industry: "Oil & Gas", mcap: 1980000 },
        { name: "Tata Consultancy Services Ltd.", code: "TCS", bse: "532540", sector: "Technology", industry: "IT Software", mcap: 1420000 },
        { name: "HDFC Bank Ltd.", code: "HDFCBANK", bse: "500180", sector: "Banking & Finance", industry: "Private Banks", mcap: 1220000 },
        { name: "Bharti Airtel Ltd.", code: "BHARTIARTL", bse: "532454", sector: "Telecommunication", industry: "Telecom Services", mcap: 830000 },
        { name: "State Bank of India", code: "SBIN", bse: "500112", sector: "Banking & Finance", industry: "Private Banks", mcap: 740000 },
        { name: "Infosys Ltd.", code: "INFY", bse: "500209", sector: "Technology", industry: "IT Software", mcap: 620000 },
        { name: "Larsen & Toubro Ltd.", code: "LT", bse: "500510", sector: "Infrastructure", industry: "Cement & Construction", mcap: 480000 },
        { name: "ITC Ltd.", code: "ITC", bse: "500875", sector: "FMCG", industry: "Diversified Consumer", mcap: 530000 },
        { name: "Hindustan Unilever Ltd.", code: "HINDUNILVR", bse: "500696", sector: "FMCG", industry: "Diversified Consumer", mcap: 570000 },
        { name: "ICICI Bank Ltd.", code: "ICICIBANK", bse: "532174", sector: "Banking & Finance", industry: "Private Banks", mcap: 790000 },
        { name: "Sun Pharmaceutical Industries Ltd.", code: "SUNPHARMA", bse: "524715", sector: "Healthcare", industry: "Pharmaceuticals", mcap: 380000 },
        { name: "Tata Motors Ltd.", code: "TATAMOTORS", bse: "500570", sector: "Automobile", industry: "Passenger Vehicles", mcap: 350000 },
        { name: "JSW Steel Ltd.", code: "JSWSTEEL", bse: "500228", sector: "Metal & Mining", industry: "Steel", mcap: 220000 },
        { name: "Adani Ports & SEZ Ltd.", code: "ADANIPORTS", bse: "532921", sector: "Infrastructure", industry: "Cement & Construction", mcap: 290000 },
        { name: "Maruti Suzuki India Ltd.", code: "MARUTI", bse: "532500", sector: "Automobile", industry: "Passenger Vehicles", mcap: 380000 }
      ];

      var industries = Array.from(new Set(companiesList.map(function (c) { return c.industry; })));
      var mockRows = companiesList.map(function (c, index) {
        var i = index + 1;
        return {
          rank: i,
          name: c.name,
          companyName: c.name,
          nseCode: c.code,
          bseCode: c.bse,
          sector: c.sector,
          industry: c.industry,
          mcap: c.mcap,
          marketCapitalization: c.mcap,
          sales3Y: parseFloat((30 - i * 1.5).toFixed(1)),
          salesGrowth3Years: parseFloat((30 - i * 1.5).toFixed(1)),
          salesRank: i,
          roce3Y: parseFloat((40 - i * 1.8).toFixed(1)),
          averageRoce3Years: parseFloat((40 - i * 1.8).toFixed(1)),
          roceRank: i,
          pb: parseFloat((1.1 + i * 0.35).toFixed(2)),
          priceToBookValue: parseFloat((1.1 + i * 0.35).toFixed(2)),
          pbRank: i,
          totalScore: Math.round(15 + i * 35)
        };
      });

      var filters = ivGetRankingFilters();
      var filtered = mockRows.filter(function (item) {
        var search = (filters.search || '').toLowerCase();
        var industryMatch = !filters.industry || item.industry === filters.industry;
        var searchMatch = !search || [item.companyName, item.nseCode, item.bseCode, item.sector, item.industry].join(' ').toLowerCase().indexOf(search) >= 0;
        var minMatch = filters.minMcap === null || (item.marketCapitalization !== null && item.marketCapitalization >= filters.minMcap);
        var maxMatch = filters.maxMcap === null || (item.marketCapitalization !== null && item.marketCapitalization <= filters.maxMcap);
        return industryMatch && searchMatch && minMatch && maxMatch;
      });

      if (filters.count > 0) {
        filtered = filtered.slice(0, filters.count);
      }

      ivRankingState.rows = filtered;
      ivRankingState.page = 1;

      if (ivRankingState.allIndustries.length === 0) {
        ivRankingState.allIndustries = industries;
        var ind = elements.industry;
        if (ind) {
          var cur = ind.value || ivRankingState.pendingIndustry || '';
          ind.innerHTML = '<option value="">All Industries</option>';
          industries.forEach(function (i) {
            var o = document.createElement('option');
            o.value = i; o.textContent = i;
            ind.appendChild(o);
          });
          if (cur) ind.value = cur;
          ivRankingState.pendingIndustry = '';
        }
      }

      if (elements.industries) elements.industries.innerHTML = '<span class="iv-blur-value">' + new Set(ivRankingState.rows.map(function (r) { return r.industry; })).size + '</span>';
      if (elements.best) elements.best.innerHTML = '<span class="iv-blur-value">Company 1</span>';

      ivRenderRankingPage();
    }

    function ivBindRankingTool() {
      var elements = ivGetRankingElements();
      if (!elements.body || elements.body._ivBound) return;
      elements.body._ivBound = true;

      if (elements.apply) elements.apply.addEventListener('click', function () { ivRankingState.page = 1; ivRenderRankingTable(); });
      if (elements.reset) elements.reset.addEventListener('click', function () {
        if (elements.search) elements.search.value = '';
        if (elements.industry) elements.industry.value = '';
        if (elements.count) elements.count.value = '0';
        if (elements.minMcap) elements.minMcap.value = '';
        if (elements.maxMcap) elements.maxMcap.value = '';
        ivRankingState.page = 1;
        ivRankingState.sortKey = 'rank';
        ivRankingState.sortDirection = 'asc';
        ivRenderRankingTable();
      });
      [elements.search, elements.industry, elements.count, elements.minMcap, elements.maxMcap].forEach(function (input) {
        if (input) input.addEventListener('input', function () { ivRankingState.page = 1; ivRenderRankingTable(); });
      });
      app.querySelectorAll('[data-rank-sort]').forEach(function (th) {
        th.addEventListener('click', function () {
          var key = th.getAttribute('data-rank-sort');
          if (ivRankingState.sortKey === key) {
            ivRankingState.sortDirection = ivRankingState.sortDirection === 'asc' ? 'desc' : 'asc';
          } else {
            ivRankingState.sortKey = key;
            ivRankingState.sortDirection = 'asc';
          }
          ivRankingState.page = 1;
          ivRenderRankingPage();
        });
      });
      if (elements.prev) elements.prev.addEventListener('click', function () { if (ivRankingState.page > 1) { ivRankingState.page--; ivRenderRankingPage(); } });
      if (elements.next) elements.next.addEventListener('click', function () { ivRankingState.page++; ivRenderRankingPage(); });

      ivRenderRankingTable();
    }

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        app.classList.remove('iv-sidebar-open');
        app.classList.remove('iv-turnaround-drawer-open');
      }
    });

    document.addEventListener('DOMContentLoaded', function () {
      ivBindRankingTool();
    });
})();
