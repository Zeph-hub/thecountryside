const rooms = [
  { id: 'cottage-vip', name: 'Acacia VIP Stone Cottage', category: 'Premium cottage', price: 4500, capacity: 2, image: 'assets/images/canopy.png', description: 'A private volcanic-stone cottage beneath the acacia canopy.' },
  { id: 'family-cottage', name: 'Family Garden Cottage', category: 'Family stay', price: 5000, capacity: 5, image: 'assets/images/family.png', description: 'A generous garden-facing cottage for families and small groups.' },
  { id: 'star-dome', name: 'Starlit Geodesic Dome', category: 'Signature stay', price: 1500, capacity: 2, image: 'assets/images/WhatsApp%20Image%202026-08-11%20at%2018.14.00%20(1).jpeg', description: 'A clear-sky retreat designed for quiet nights and stargazing.' }
];

const destinations = [
  { name: 'Lake Baringo Islands & Birding Hives', type: 'Lake Safari', distance: '22 km north', time: '25 mins drive', image: 'assets/images/gateway.jpg', text: 'Freshwater islands, hippos, fish eagles, and traditional boat cruises.' },
  { name: 'Lake Bogoria Geysers & Flamingos', type: 'Thermal Springs', distance: '38 km south-east', time: '45 mins drive', image: 'assets/images/rift.jpg', text: 'Thermal geysers and flamingos along the alkaline lake edge.' },
  { name: 'Kamariny Gorge & Honey Hives', type: 'Scenic Gorge', distance: '12 km west', time: '15 mins drive', image: 'assets/images/geological.webp', text: 'Sandstone canyons, seasonal pools, and community honey guides.' },
  { name: 'The Hominid Paths of Tugen Hills', type: 'Historical Hills', distance: '28 km west', time: '40 mins drive', image: 'assets/images/WhatsApp%20Image%202026-08-11%20at%2018.14.00.jpeg', text: 'Highland ridges, fossil layers, cloud forests, and Rift Valley views.' }
];

const experienceData = [
  { title: 'Marigat: gateway to Rift Valley wonders', copy: 'Freshwater lakes, alkaline geysers, sandstone gorges, and ancient highland ridges are all within direct reach from our central campsite.', img: 'assets/images/gateway.jpg' },
  { title: 'Pioneering field studies & scientific research', copy: 'Access rich geological formations, archaeological excavations, and hydrological sites with certified regional tracking guides and administrative support.', img: 'assets/images/geological.webp' },
  { title: 'Traditional Baringo hospitality & cuisine', copy: 'Savor authentic Nyama Choma platters, participate in traditional storytelling, and immerse yourself in South Rift community heritage.', img: 'assets/images/dine.jpg' }
];

const $ = (selector) => document.querySelector(selector);
const money = (value) => `KES ${Number(value).toLocaleString()}`;
const validScreens = ['home', 'stay', 'experiences', 'explore', 'plan', 'contact'];
const weatherLabels = { 0: 'Clear skies', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Foggy', 48: 'Rime fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle', 61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 71: 'Light snow', 80: 'Rain showers', 81: 'Rain showers', 82: 'Heavy showers', 95: 'Thunderstorms' };
const routeFor = (path) => {
  const segment = path.replace(/\/$/, '').split('/').pop();
  return validScreens.includes(segment) ? segment : 'home';
};

function showConfirmation(title, copy) {
  $('#confirmation-title').textContent = title;
  $('#confirmation-copy').textContent = copy;
  if (window.bootstrap?.Modal) window.bootstrap.Modal.getOrCreateInstance($('#confirmation-modal')).show();
}

function showScreen(name) {
  const screen = validScreens.includes(name) ? name : 'home';
  document.querySelectorAll('.screen').forEach((item) => item.classList.toggle('active', item.id === `screen-${screen}`));
  document.querySelectorAll('[data-screen]').forEach((item) => item.classList.toggle('active', item.dataset.screen === screen));
  document.querySelector('.navbar-collapse')?.classList.remove('show');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function navigateTo(name) {
  const screen = validScreens.includes(name) ? name : 'home';
  const path = screen === 'home' ? '/' : `/${screen}`;
  if (location.pathname !== path) history.pushState({ screen }, '', path);
  showScreen(screen);
}

async function loadWeather() {
  const metric = $('#weather-metric');
  const context = $('#weather-context');
  const explore = $('#explore-weather');
  try {
    const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=0.46&longitude=36.02&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Africa%2FNairobi');
    if (!response.ok) throw new Error('Weather request failed');
    const weather = await response.json();
    const current = weather.current;
    const label = weatherLabels[current.weather_code] || 'Current conditions';
    const summary = `${Math.round(current.temperature_2m)}°C · ${label}`;
    const details = `${Math.round(current.relative_humidity_2m)}% humidity · wind ${Math.round(current.wind_speed_10m)} km/h · updated ${new Date(current.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    if (metric) metric.textContent = summary;
    if (context) context.textContent = details;
    if (explore) explore.innerHTML = `<strong>${summary}</strong><span>${details}. Check conditions before setting out.</span>`;
  } catch (error) {
    const fallback = 'Weather unavailable right now';
    if (metric) metric.textContent = fallback;
    if (context) context.textContent = 'Ask the travel desk for the latest local conditions.';
    if (explore) explore.innerHTML = `<strong>${fallback}</strong><span>Ask the travel desk for the latest local conditions.</span>`;
  }
}

document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-screen]');
  if (target) {
    event.preventDefault();
    navigateTo(target.dataset.screen);
  }
});

let selectedRoom = rooms[0];
const savedBookings = JSON.parse(localStorage.getItem('countryside_bookings') || '[]');

function updateBooking() {
  const form = $('#booking-form');
  if (!form) return;
  $('#selected-room').innerHTML = `<small class="eyebrow mb-1">Chosen room</small><strong>${selectedRoom.name}</strong><br><span class="text-primary">${money(selectedRoom.price)} / night</span>`;
  const start = new Date($('#check-in').value);
  const end = new Date($('#check-out').value);
  const nights = Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) ? 1 : Math.max(1, Math.ceil((end - start) / 86400000));
  const total = selectedRoom.price * nights + ($('#welcome-package').checked ? 1800 : 0);
  $('#booking-total').innerHTML = `<div class="d-flex justify-content-between"><span>${nights} night${nights === 1 ? '' : 's'}</span><strong>${money(total)}</strong></div><small>${selectedRoom.name} · ${$('#guest-count').value} guest(s)</small>`;
}

function renderRooms() {
  $('#rooms').innerHTML = rooms.map((room) => `<article class="card room-option mb-3 ${room.id === selectedRoom.id ? 'selected' : ''}" data-room="${room.id}" tabindex="0" role="button" aria-pressed="${room.id === selectedRoom.id}"><div class="row g-0"><div class="col-sm-4"><img src="${room.image}" alt="${room.name}" loading="lazy"></div><div class="col-sm-8"><div class="card-body"><div class="d-flex justify-content-between gap-2"><span class="eyebrow mb-1">${room.category}</span><strong class="text-primary">${money(room.price)}<small>/night</small></strong></div><h3>${room.name}</h3><p>${room.description}</p><small>Capacity: ${room.capacity} guests</small></div></div></div></article>`).join('');
  document.querySelectorAll('[data-room]').forEach((card) => {
    const chooseRoom = () => { selectedRoom = rooms.find((room) => room.id === card.dataset.room); renderRooms(); updateBooking(); };
    card.addEventListener('click', chooseRoom);
    card.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); chooseRoom(); } });
  });
  updateBooking();
}

function renderBookingLedger() {
  const ledger = $('#booking-ledger');
  if (!ledger) return;
  ledger.innerHTML = savedBookings.length ? savedBookings.map((booking, index) => `<div class="alert alert-light border d-flex justify-content-between align-items-center gap-2"><span><strong>${booking.room}</strong><br><small>${booking.name} · ${booking.checkIn} to ${booking.checkOut}</small></span><button class="btn btn-sm btn-outline-danger" data-cancel-booking="${index}" type="button">Cancel</button></div>`).join('') : '<p class="text-muted small">No active reservations yet.</p>';
  document.querySelectorAll('[data-cancel-booking]').forEach((button) => button.addEventListener('click', () => {
    savedBookings.splice(Number(button.dataset.cancelBooking), 1);
    localStorage.setItem('countryside_bookings', JSON.stringify(savedBookings));
    renderBookingLedger();
    updateBookingBadge();
  }));
}

function updateBookingBadge() {
  const badge = $('.booking-badge');
  if (badge) { badge.textContent = savedBookings.length; badge.classList.toggle('d-none', savedBookings.length === 0); }
}

function renderExperiences() {
  const tabs = document.querySelectorAll('.experience-control-tab');
  const title = $('.canvas-display-title');
  const copy = $('.canvas-display-copy');
  const image = $('.canvas-image-container img');
  tabs.forEach((tab, index) => tab.addEventListener('click', () => {
    tabs.forEach((item) => { item.classList.remove('active'); item.setAttribute('aria-current', 'false'); });
    tab.classList.add('active');
    tab.setAttribute('aria-current', 'true');
    const experience = experienceData[index];
    title.textContent = experience.title;
    copy.textContent = experience.copy;
    image.src = experience.img;
    image.alt = experience.title;
  }));
}

function renderDestinations() {
  $('#destination-list').innerHTML = destinations.map((destination, index) => `<button class="list-group-item list-group-item-action destination-item ${index === 0 ? 'active' : ''}" data-destination="${index}" type="button"><strong>${destination.name}</strong><small>${destination.type} · ${destination.time}</small></button>`).join('');
  document.querySelectorAll('[data-destination]').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('[data-destination]').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    renderDestination(Number(button.dataset.destination));
  }));
  renderDestination(0);
}

function renderDestination(index) {
  const destination = destinations[index];
  $('#destination-detail').innerHTML = `<div class="card card-body destination-detail"><img src="${destination.image}" alt="${destination.name}" loading="lazy"><span class="eyebrow mt-3">${destination.type}</span><h2>${destination.name}</h2><p>${destination.text}</p><small>${destination.distance} · Best reached with a local guide</small></div>`;
}

$('#booking-form')?.addEventListener('input', updateBooking);
$('#booking-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const checkIn = new Date($('#check-in').value);
  const checkOut = new Date($('#check-out').value);
  if (checkOut <= checkIn) { $('#check-out').setCustomValidity('Check-out must be after check-in.'); $('#check-out').reportValidity(); return; }
  $('#check-out').setCustomValidity('');
  if (Number($('#guest-count').value) > selectedRoom.capacity) { $('#guest-count').setCustomValidity(`This room accommodates up to ${selectedRoom.capacity} guests.`); $('#guest-count').reportValidity(); return; }
  $('#guest-count').setCustomValidity('');
  savedBookings.unshift({ name: $('#guest-name').value, email: $('#guest-email').value, room: selectedRoom.name, checkIn: $('#check-in').value, checkOut: $('#check-out').value, guests: Number($('#guest-count').value), welcomePackage: $('#welcome-package').checked });
  localStorage.setItem('countryside_bookings', JSON.stringify(savedBookings));
  $('#booking-message').textContent = `Reservation request received for ${selectedRoom.name}. The reception team will contact you shortly.`;
  $('#booking-message').classList.remove('d-none');
  showConfirmation('Reservation request received', `Thanks, ${$('#guest-name').value}. We have held the ${selectedRoom.name} request for review and will contact you at ${$('#guest-email').value}.`);
  renderBookingLedger(); updateBookingBadge(); event.target.reset(); updateBooking();
});

$('#plan-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.target;
  if (form.elements.website.value) return;
  const savedRequests = JSON.parse(localStorage.getItem('countryside_plan_requests') || '[]');
  const requests = Array.isArray(savedRequests) ? savedRequests : [];
  const request = Object.fromEntries(new FormData(form).entries());
  requests.unshift({ ...request, createdAt: new Date().toISOString() });
  localStorage.setItem('countryside_plan_requests', JSON.stringify(requests));
  $('#plan-message').textContent = `Saved. We will shape a ${request.visitType.toLowerCase()} route for ${request.name} and reply to ${request.email}.`;
  $('#plan-message').classList.remove('d-none');
  showConfirmation('Your visit is taking shape', `The travel desk has your ${request.groupCount}-guest request. We will reply to ${request.email} with the next steps.`);
  form.reset();
});
$('#contact-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.target;
  if (form.elements.website.value) return;
  const inquiry = Object.fromEntries(new FormData(form).entries());
  const savedInquiries = JSON.parse(localStorage.getItem('countryside_contact_inquiries') || '[]');
  const inquiries = Array.isArray(savedInquiries) ? savedInquiries : [];
  inquiries.unshift({ ...inquiry, createdAt: new Date().toISOString() });
  localStorage.setItem('countryside_contact_inquiries', JSON.stringify(inquiries));
  const subject = encodeURIComponent(`Countryside Marigat enquiry - ${inquiry.topic}`);
  const body = encodeURIComponent(`Name: ${inquiry.name}\nEmail: ${inquiry.email}\nTopic: ${inquiry.topic}\n\n${inquiry.message}`);
  $('#contact-message').textContent = 'Saved locally. Your email draft is ready to open.';
  $('#contact-message').classList.remove('d-none');
  showConfirmation('Your message is ready', `Your ${inquiry.topic.toLowerCase()} enquiry is saved on this device. Choose “Keep exploring” to continue, or use the email draft that opens next.`);
  window.setTimeout(() => { window.location.href = `mailto:info@thecountrysidemarigat.com?subject=${subject}&body=${body}`; }, 350);
});

renderRooms();
renderBookingLedger();
updateBookingBadge();
renderExperiences();
renderDestinations();
const today = new Date().toISOString().split('T')[0];
if ($('#check-in')) $('#check-in').min = today;
if ($('#check-out')) $('#check-out').min = today;
if ($('#plan-form')) $('#plan-form').elements.arrivalDate.min = today;
loadWeather();
const legacyRoute = location.hash.slice(1);
const initialRoute = validScreens.includes(legacyRoute) ? legacyRoute : routeFor(location.pathname);
if (legacyRoute) history.replaceState({ screen: initialRoute }, '', initialRoute === 'home' ? '/' : `/${initialRoute}`);
showScreen(initialRoute);
window.addEventListener('popstate', () => showScreen(routeFor(location.pathname)));
if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('reduced-motion');
