/* Virtual tour kawasan (Pannellum).
   Foto: kawasan-1.jpg (jalan utama) dan kawasan-2.jpg (deretan rumah).
   Jika punya foto 360 asli, ganti file di SCENES dan ubah FLAT menjadi false. */
(function () {
  var el = document.getElementById('vt-pano');
  if (!el || !window.pannellum) return;

  var FLAT = true;   // true = foto biasa (bukan 360)
  var HAOV = 80;     // lebar sudut pandang foto (derajat)

  // w,h = ukuran foto asli (sebelum diperbesar) agar posisi panah tetap akurat
  var SCENES = {
    jalan:  { title: 'Jalan utama kawasan', img: 'kawasan-1.jpg', w: 1400, h: 1488 },
    deretan:{ title: 'Deretan rumah',       img: 'kawasan-2.jpg', w: 1400, h: 1394 }
  };
  function vaov(s) { return HAOV * s.h / s.w; }
  // piksel foto asli (x,y) -> yaw/pitch
  function pos(k, x, y) { var s = SCENES[k]; return { yaw: (x / s.w - 0.5) * HAOV, pitch: (0.5 - y / s.h) * vaov(s) }; }

  var LINKS = {
    jalan:   [{ to: 'deretan', x: 1010, y: 1010, text: 'Lihat deretan rumah' }],
    deretan: [{ to: 'jalan', x: 1000, y: 1120, text: 'Kembali ke jalan utama' }]
  };
  var INFO = {
    jalan:   [{ x: 230, y: 1010, text: 'Carport & taman depan' }, { x: 700, y: 560, text: 'Jalan lingkungan 2 jalur' }],
    deretan: [{ x: 420, y: 560, text: 'Atap pelana & lis kayu' }, { x: 1075, y: 640, text: 'Penerangan jalan (PJU)' }]
  };

  var cfg = { default: { firstScene: 'jalan', sceneFadeDuration: 900, autoLoad: true, compass: false,
    showFullscreenCtrl: true, showZoomCtrl: true, mouseZoom: true, hfov: 80, minHfov: 55, maxHfov: 80 }, scenes: {} };

  Object.keys(SCENES).forEach(function (k) {
    var s = SCENES[k], spots = [];
    (LINKS[k] || []).forEach(function (l) {
      var p = pos(k, l.x, l.y);
      spots.push({ yaw: p.yaw, pitch: p.pitch, type: 'scene', sceneId: l.to, text: l.text, cssClass: 'vt-hot' });
    });
    (INFO[k] || []).forEach(function (i) {
      var p = pos(k, i.x, i.y);
      spots.push({ yaw: p.yaw, pitch: p.pitch, type: 'info', text: i.text, cssClass: 'vt-info' });
    });
    var sc = { title: s.title, type: 'equirectangular', panorama: s.img, hotSpots: spots, yaw: 0, pitch: 0 };
    if (FLAT) {
      var v = vaov(s);
      sc.haov = HAOV; sc.vaov = v; sc.vOffset = 0;
      sc.minYaw = -HAOV / 2; sc.maxYaw = HAOV / 2; sc.minPitch = -v / 2; sc.maxPitch = v / 2;
    }
    cfg.scenes[k] = sc;
  });

  var viewer = pannellum.viewer('vt-pano', cfg);

  var bar = document.getElementById('vt-scenes');
  Object.keys(SCENES).forEach(function (k) {
    var b = document.createElement('button');
    b.type = 'button'; b.textContent = SCENES[k].title; b.dataset.scene = k;
    b.addEventListener('click', function () { viewer.loadScene(k); });
    bar.appendChild(b);
  });
  function mark() { var cur = viewer.getScene(); [].forEach.call(bar.children, function (b) { b.classList.toggle('on', b.dataset.scene === cur); }); }
  viewer.on('scenechange', mark); viewer.on('load', mark);
})();
