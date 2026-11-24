// Service Worker SiLapor — tanpa VAPID
// Menangani notifikasi native via registration.showNotification()

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Listener pesan dari halaman utama untuk menampilkan notifikasi
self.addEventListener('message', (event) => {
  if (!event.data || event.data.type !== 'SHOW_NOTIFICATION') return;

  const { title, body, icon, tag, data } = event.data.payload;

  event.waitUntil(
    self.registration.showNotification(title, {
      body: body || '',
      icon: icon || '/dashboard_banner.png',
      badge: '/dashboard_banner.png',
      tag: tag || 'silapor-notif',
      renotify: true,
      data: data || {},
      vibrate: [200, 100, 200],
    })
  );
});

// Klik notifikasi → buka/fokus halaman SiLapor
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const laporanId = event.notification.data?.laporan_id;
  const targetUrl = laporanId
    ? `/laporan/tracking/${laporanId}`
    : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Jika sudah ada tab SiLapor yang terbuka, fokus dan navigasi
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      // Tidak ada tab terbuka — buka jendela baru
      return clients.openWindow(targetUrl);
    })
  );
});
