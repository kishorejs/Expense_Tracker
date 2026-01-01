self.addEventListener('install', e => {
e.waitUntil(
caches.open('expense-cache').then(cache => {
return cache.addAll([
'/', '/index.html', '/styles.css', '/app.js'
]);
})
);
});