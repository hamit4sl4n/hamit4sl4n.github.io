

(function () {
  'use strict';

  var kok = document.documentElement;
  
  
  
  document.body.classList.add('js');

  var azHareket = window.matchMedia('(prefers-reduced-motion: reduce)');

  
  var tuval = document.querySelector('.murekkep');

  var GOLGE_DIKEY = [
    '#version 300 es',
    'in vec2 konum;',
    'void main(){ gl_Position = vec4(konum, 0.0, 1.0); }'
  ].join('\n');

  var GOLGE_PARCALI = [
    '#version 300 es',
    'precision highp float;',
    'uniform vec2 uCozunurluk;',
    'uniform float uZaman;',
    'uniform vec2 uImlec;',
    'uniform float uKaydirma;',
    'out vec4 cikis;',
    '',
    'float karistir(vec2 p){',
    '  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);',
    '}',
    'float gurultu(vec2 p){',
    '  vec2 i = floor(p); vec2 f = fract(p);',
    '  vec2 u = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(karistir(i), karistir(i + vec2(1.0, 0.0)), u.x),',
    '             mix(karistir(i + vec2(0.0, 1.0)), karistir(i + vec2(1.0, 1.0)), u.x), u.y);',
    '}',
    'float fbm(vec2 p){',
    '  float t = 0.0; float a = 0.5;',
    '  for (int i = 0; i < 5; i++) { t += a * gurultu(p); p = p * 2.03 + 17.3; a *= 0.5; }',
    '  return t;',
    '}',
    'void main(){',
    '  vec2 uv = gl_FragCoord.xy / uCozunurluk.xy;',
    '  vec2 p = (gl_FragCoord.xy - 0.5 * uCozunurluk.xy) / uCozunurluk.y;',
    '  float oran = uCozunurluk.x / uCozunurluk.y;',
    '  float t = uZaman * 0.055;',
    
    '  vec2 q = vec2(fbm(p * 1.7 + vec2(t, -t * 0.6)),',
    '                fbm(p * 1.7 + vec2(5.2 - t * 0.7, 1.3 + t * 0.4)));',
    
    '  vec2 imlec = (uImlec - 0.5) * vec2(oran, 1.0) * 2.0;',
    '  float uzaklik = length(p - imlec);',
    '  float itme = exp(-uzaklik * 3.2);',
    '  q += itme * 0.42 * vec2(cos(uZaman * 0.9), sin(uZaman * 0.7));',
    
    '  float alan = fbm(p * 2.3 + q * 1.55 + vec2(0.0, -uKaydirma * 1.1));',
    '  float tel = smoothstep(0.44, 0.96, alan);',
    '  float sicak = smoothstep(0.54, 1.0, alan + itme * 0.45);',
    '  vec3 murekkep = vec3(0.028, 0.033, 0.046);',
    '  vec3 pirinc = vec3(0.72, 0.55, 0.28);',
    '  vec3 renk = mix(murekkep, pirinc, sicak * 0.72);',
    '  renk += tel * 0.10 * vec3(0.92, 0.88, 0.80);',
    
    '  renk += (karistir(gl_FragCoord.xy * 0.71) - 0.5) * 0.022;',
    '  float vinyet = smoothstep(1.28, 0.30, length(uv - 0.5) * 1.55);',
    '  renk *= mix(0.42, 1.0, vinyet);',
    '  cikis = vec4(renk, 1.0);',
    '}'
  ].join('\n');

  function derle(gl, tur, kaynak) {
    var s = gl.createShader(tur);
    gl.shaderSource(s, kaynak);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  function alaniBaslat() {
    if (!tuval) return null;

    var gl = tuval.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power'
    });
    if (!gl) return null;

    var vs = derle(gl, gl.VERTEX_SHADER, GOLGE_DIKEY);
    var fs = derle(gl, gl.FRAGMENT_SHADER, GOLGE_PARCALI);
    if (!vs || !fs) return null;

    var program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
    gl.useProgram(program);

    
    
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    var tampon = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tampon);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var konum = gl.getAttribLocation(program, 'konum');
    gl.enableVertexAttribArray(konum);
    gl.vertexAttribPointer(konum, 2, gl.FLOAT, false, 0, 0);

    return {
      gl: gl,
      uCozunurluk: gl.getUniformLocation(program, 'uCozunurluk'),
      uZaman: gl.getUniformLocation(program, 'uZaman'),
      uImlec: gl.getUniformLocation(program, 'uImlec'),
      uKaydirma: gl.getUniformLocation(program, 'uKaydirma'),
      oran: 1.5,
      baslangic: performance.now(),
      imlecHedef: [0.5, 0.5],
      imlec: [0.5, 0.5],
      yavas: 0
    };
  }

  function tuvaliAyarla(alan) {
    var gl = alan.gl;
    
    
    var oran = Math.min(window.devicePixelRatio || 1, alan.oran);
    var genislik = Math.max(1, Math.round(tuval.clientWidth * oran));
    var yukseklik = Math.max(1, Math.round(tuval.clientHeight * oran));
    if (tuval.width !== genislik || tuval.height !== yukseklik) {
      tuval.width = genislik;
      tuval.height = yukseklik;
    }
    gl.viewport(0, 0, genislik, yukseklik);
    gl.uniform2f(alan.uCozunurluk, genislik, yukseklik);
  }

  function kareCiz(alan) {
    var gl = alan.gl;
    var saniye = (performance.now() - alan.baslangic) / 1000;
    
    
    alan.imlec[0] += (alan.imlecHedef[0] - alan.imlec[0]) * 0.06;
    alan.imlec[1] += (alan.imlecHedef[1] - alan.imlec[1]) * 0.06;
    var kaydirma = Math.min(1, window.scrollY / Math.max(1, window.innerHeight));
    gl.uniform1f(alan.uZaman, saniye);
    gl.uniform2f(alan.uImlec, alan.imlec[0], alan.imlec[1]);
    gl.uniform1f(alan.uKaydirma, kaydirma);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function murekkepBaslat() {
    var alan = alaniBaslat();
    if (!alan) {
      
      kok.classList.add('murekkep-yok');
      return;
    }

    tuvaliAyarla(alan);

    var calisiyor = false;
    var gorunur = true;
    var pencere = null;
    var onceki = 0;

    function dongu(simdi) {
      if (!calisiyor) return;
      pencere = window.requestAnimationFrame(dongu);
      
      
      if (onceki && alan.yavas < 60) {
        alan.yavas += 1;
        if (alan.yavas === 60 && simdi - alan.baslangic > 60 * 26) {
          alan.oran = 1.0;
          tuvaliAyarla(alan);
        }
      }
      onceki = simdi;
      kareCiz(alan);
    }

    function basla() {
      if (calisiyor || azHareket.matches || !gorunur || document.visibilityState === 'hidden') return;
      calisiyor = true;
      pencere = window.requestAnimationFrame(dongu);
    }

    function dur() {
      calisiyor = false;
      if (pencere) window.cancelAnimationFrame(pencere);
      pencere = null;
    }

    if (azHareket.matches) {
      kareCiz(alan); 
    } else {
      basla();
    }

    
    
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (girisler) {
        gorunur = girisler[0].isIntersecting;
        if (gorunur) basla(); else dur();
      }, { threshold: 0 }).observe(tuval);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') dur(); else basla();
    });
    azHareket.addEventListener('change', function () {
      if (azHareket.matches) { dur(); kareCiz(alan); } else { basla(); }
    });

    
    window.addEventListener('pointermove', function (olay) {
      alan.imlecHedef[0] = olay.clientX / Math.max(1, window.innerWidth);
      alan.imlecHedef[1] = 1 - olay.clientY / Math.max(1, window.innerHeight);
    }, { passive: true });

    
    var bekleyen = null;
    var yeniden = function () {
      if (bekleyen) window.cancelAnimationFrame(bekleyen);
      bekleyen = window.requestAnimationFrame(function () {
        tuvaliAyarla(alan);
        if (!calisiyor) kareCiz(alan);
      });
    };
    if ('ResizeObserver' in window) new ResizeObserver(yeniden).observe(tuval);
    else window.addEventListener('resize', yeniden);
  }

  murekkepBaslat();

  
  var belirenler = document.querySelectorAll('.belir, .kayit');
  if ('IntersectionObserver' in window && belirenler.length) {
    var gozlemci = new IntersectionObserver(function (girisler, kendisi) {
      girisler.forEach(function (giris) {
        if (!giris.isIntersecting) return;
        giris.target.classList.add('geldi');
        kendisi.unobserve(giris.target); 
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    belirenler.forEach(function (oge) { gozlemci.observe(oge); });
  } else {
    belirenler.forEach(function (oge) { oge.classList.add('geldi'); });
  }

  
  var sayaclar = document.querySelectorAll('[data-sayi]');
  sayaclar.forEach(function (oge) {
    var hedef = parseInt(oge.getAttribute('data-sayi'), 10);
    if (isNaN(hedef)) return;
    var yazi = oge.textContent;
    oge.setAttribute('aria-label', yazi); 
    if (azHareket.matches || hedef === 0) return;

    var basladi = false;
    var baslat = function () {
      if (basladi) return;
      basladi = true;
      var sure = 900;
      var baslangic = performance.now();
      var adim = function (simdi) {
        var oran = Math.min(1, (simdi - baslangic) / sure);
        
        
        var yumusak = 1 - Math.pow(1 - oran, 3);
        oge.textContent = String(Math.round(hedef * yumusak));
        if (oran < 1) window.requestAnimationFrame(adim);
        else oge.textContent = String(hedef);
      };
      window.requestAnimationFrame(adim);
    };

    if ('IntersectionObserver' in window) {
      var s = new IntersectionObserver(function (girisler) {
        if (girisler[0].isIntersecting) { baslat(); s.disconnect(); }
      }, { threshold: 0.4 });
      s.observe(oge);
    } else {
      baslat();
    }
  });

  
  var ustbar = document.querySelector('.ustbar');
  if (ustbar) {
    var isaretle = function () {
      if (window.scrollY > 24) ustbar.classList.add('kaydi');
      else ustbar.classList.remove('kaydi');
    };
    isaretle();
    window.addEventListener('scroll', isaretle, { passive: true });
  }

  
  document.querySelectorAll('a.kayit').forEach(function (satir) {
    satir.addEventListener('pointermove', function (olay) {
      var kutu = satir.getBoundingClientRect();
      if (!kutu.width || !kutu.height) return;
      satir.style.setProperty('--mx', (((olay.clientX - kutu.left) / kutu.width) * 100) + '%');
      satir.style.setProperty('--my', (((olay.clientY - kutu.top) / kutu.height) * 100) + '%');
    }, { passive: true });
  });

  
  var masaKokleri = document.querySelectorAll('.masa-saray');
  var buyukPlaka = document.getElementById('plaka-buyuk');

  function plakayiGetir(masa, kart) {
    var sol = kart.offsetLeft + kart.offsetWidth / 2 - masa.clientWidth / 2;
    if (!masa.scrollTo) { masa.scrollLeft = sol; return; }
    masa.scrollTo({ left: sol, behavior: 'smooth' });
  }

  masaKokleri.forEach(function (saray) {
    var masa = saray.querySelector('.masa');
    var cetvel = saray.querySelector('.cetvel');
    if (!masa) return;
    var kartlar = Array.prototype.slice.call(masa.querySelectorAll('.masa-kart'));
    if (!kartlar.length) return;
    var centikler = [];

    if (cetvel) {
      kartlar.forEach(function (kart, sira) {
        var dugme = document.createElement('button');
        dugme.type = 'button';
        dugme.setAttribute('aria-label',
          'Plaka ' + (sira + 1) + ': ' + (kart.getAttribute('data-ad') || ''));
        dugme.addEventListener('click', function () { plakayiGetir(masa, kart); });
        var li = document.createElement('li');
        li.appendChild(dugme);
        cetvel.appendChild(li);
        centikler.push(dugme);
      });
    }

    
    var tazele = function () {
      var orta = masa.scrollLeft + masa.clientWidth / 2;
      var enIyi = 0;
      var enAz = Infinity;
      kartlar.forEach(function (kart, sira) {
        var uzaklik = Math.abs(kart.offsetLeft + kart.offsetWidth / 2 - orta);
        if (uzaklik < enAz) { enAz = uzaklik; enIyi = sira; }
      });
      kartlar.forEach(function (kart, sira) {
        if (sira === enIyi) kart.setAttribute('data-aktif', '');
        else kart.removeAttribute('data-aktif');
      });
      centikler.forEach(function (dugme, sira) {
        dugme.setAttribute('aria-current', sira === enIyi ? 'true' : 'false');
      });
    };

    masa.addEventListener('scroll', function () {
      window.requestAnimationFrame(tazele);
    }, { passive: true });
    window.addEventListener('resize', tazele);
    tazele();

    
    
    
    masa.tabIndex = 0;
    masa.addEventListener('keydown', function (olay) {
      if (olay.key !== 'ArrowLeft' && olay.key !== 'ArrowRight') return;
      var suanki = 0;
      kartlar.forEach(function (kart, sira) {
        if (kart.hasAttribute('data-aktif')) suanki = sira;
      });
      var hedef = olay.key === 'ArrowRight' ? suanki + 1 : suanki - 1;
      if (hedef < 0 || hedef >= kartlar.length) return;
      olay.preventDefault();
      plakayiGetir(masa, kartlar[hedef]);
    });
  });

  if (buyukPlaka && buyukPlaka.showModal) {
    var buyukGorsel = document.getElementById('buyuk-gorsel');
    var buyukAd = document.getElementById('buyuk-ad');
    var buyukNot = document.getElementById('buyuk-not');
    document.querySelectorAll('.masa-dugme').forEach(function (dugme) {
      dugme.addEventListener('click', function () {
        var gorsel = dugme.querySelector('img');
        if (buyukGorsel) {
          buyukGorsel.setAttribute('src', dugme.getAttribute('data-buyuk'));
          buyukGorsel.setAttribute('alt', gorsel ? gorsel.alt : '');
        }
        if (buyukAd) buyukAd.textContent = dugme.getAttribute('data-ad') || '';
        if (buyukNot) buyukNot.textContent = dugme.getAttribute('data-not') || '';
        buyukPlaka.showModal();
      });
    });
    
    buyukPlaka.addEventListener('click', function (olay) {
      if (olay.target === buyukPlaka) buyukPlaka.close();
    });
  }
})();
