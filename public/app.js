const DB = {
  clients: 'beautysalon_clients',
  services: 'beautysalon_services',
  appointments: 'beautysalon_appointments'
};

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getData(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

const API = {
  clients: {
    getAll: () => getData(DB.clients),
    getById: (id) => getData(DB.clients).find(c => c._id === id),
    create: (data) => {
      const clients = getData(DB.clients);
      const client = { ...data, _id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      clients.push(client);
      setData(DB.clients, clients);
      return client;
    },
    update: (id, data) => {
      const clients = getData(DB.clients);
      const index = clients.findIndex(c => c._id === id);
      if (index !== -1) {
        clients[index] = { ...clients[index], ...data, updatedAt: new Date().toISOString() };
        setData(DB.clients, clients);
        return clients[index];
      }
      return null;
    },
    delete: (id) => {
      const clients = getData(DB.clients).filter(c => c._id !== id);
      setData(DB.clients, clients);
    }
  },
  services: {
    getAll: () => getData(DB.services),
    getById: (id) => getData(DB.services).find(s => s._id === id),
    create: (data) => {
      const services = getData(DB.services);
      const service = { ...data, _id: generateId(), isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      services.push(service);
      setData(DB.services, services);
      return service;
    },
    update: (id, data) => {
      const services = getData(DB.services);
      const index = services.findIndex(s => s._id === id);
      if (index !== -1) {
        services[index] = { ...services[index], ...data, updatedAt: new Date().toISOString() };
        setData(DB.services, services);
        return services[index];
      }
      return null;
    },
    delete: (id) => {
      const services = getData(DB.services).filter(s => s._id !== id);
      setData(DB.services, services);
    }
  },
  appointments: {
    getAll: () => {
      const appointments = getData(DB.appointments);
      const clients = getData(DB.clients);
      const services = getData(DB.services);
      return appointments.map(apt => {
        const client = clients.find(c => c._id === apt.client);
        const service = services.find(s => s._id === apt.service);
        return {
          ...apt,
          clientName: client ? client.name : 'Unknown Client',
          serviceName: service ? service.name : 'Unknown Service'
        };
      });
    },
    getById: (id) => {
      const apt = getData(DB.appointments).find(a => a._id === id);
      if (apt) {
        const clients = getData(DB.clients);
        const services = getData(DB.services);
        const client = clients.find(c => c._id === apt.client);
        const service = services.find(s => s._id === apt.service);
        return {
          ...apt,
          clientName: client ? client.name : 'Unknown Client',
          serviceName: service ? service.name : 'Unknown Service'
        };
      }
      return apt;
    },
    getByClientId: (clientId) => {
      return getData(DB.appointments).filter(a => a.client === clientId);
    },
    create: (data) => {
      const appointments = getData(DB.appointments);
      const appointment = { ...data, _id: generateId(), status: data.status || 'scheduled', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      appointments.push(appointment);
      setData(DB.appointments, appointments);
      return appointment;
    },
    update: (id, data) => {
      const appointments = getData(DB.appointments);
      const index = appointments.findIndex(a => a._id === id);
      if (index !== -1) {
        appointments[index] = { ...appointments[index], ...data, updatedAt: new Date().toISOString() };
        setData(DB.appointments, appointments);
        return appointments[index];
      }
      return null;
    },
    delete: (id) => {
      const appointments = getData(DB.appointments).filter(a => a._id !== id);
      setData(DB.appointments, appointments);
    }
  }
};

function getDiscountSuggestion(clientId) {
  const appointments = API.appointments.getByClientId(clientId);
  const completedAppointments = appointments.filter(a => a.status === 'completed' || a.status === 'scheduled');
  
  if (completedAppointments.length === 0) return null;
  
  const discounts = completedAppointments.filter(a => a.discount > 0).map(a => a.discount);
  
  if (discounts.length === 0) return null;
  
  const avgDiscount = discounts.reduce((a, b) => a + b, 0) / discounts.length;
  const roundedDiscount = Math.round(avgDiscount * 10) / 10;
  
  return {
    avgDiscount: roundedDiscount,
    timesDiscounted: discounts.length,
    totalAppointments: completedAppointments.length
  };
}

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  loadClients();
  loadServices();
  loadAppointments();
  loadStatistics();
});

function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
      });
      
      const targetTab = document.getElementById(btn.dataset.tab);
      targetTab.classList.add('active');
      
      if (btn.dataset.tab === 'statistics') {
        loadStatistics();
      }
    });
  });
}

function loadClients() {
  try {
    const clients = API.clients.getAll();
    renderClients(clients);
  } catch (error) {
    console.error('Error loading clients:', error);
    document.getElementById('clientsList').innerHTML = '<div class="empty-state">Error loading clients.</div>';
  }
}

function renderClients(clients) {
  const container = document.getElementById('clientsList');
  
  if (clients.length === 0) {
    container.innerHTML = '<div class="empty-state">No clients yet. Add your first client!</div>';
    return;
  }
  
  container.innerHTML = clients.map(client => {
    const phones = client.phones || [];
    const phoneHtml = phones.filter(p => p.number).map(p => `<p>${p.label}: ${p.number}</p>`).join('');
    
    return `
      <div class="card">
        <h3>${client.name}</h3>
        ${phoneHtml || '<p><em>No phone</em></p>'}
        ${client.address ? `<p>${client.address}</p>` : ''}
        ${client.birthday ? `<p>Birthday: ${new Date(client.birthday).toLocaleDateString()}</p>` : ''}
        ${client.notes ? `<p><em>${client.notes}</em></p>` : ''}
        <div class="card-actions">
          <button class="edit-btn" onclick="editClient('${client._id}')">Edit</button>
          <button class="delete-btn" onclick="deleteClient('${client._id}')">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

const PHONE_LABELS = ['Mobile', 'Home', 'Work', 'Father', 'Mother', 'Partner', 'Other'];

function addPhoneField(label = 'Mobile', number = '') {
  const container = document.getElementById('phoneFieldsContainer');
  const fieldId = Date.now();
  
  const labelOptions = PHONE_LABELS.map(l => 
    `<option value="${l}" ${l === label ? 'selected' : ''}>${l}</option>`
  ).join('');
  
  const fieldHtml = `
    <div class="phone-field" id="phone-${fieldId}">
      <select class="phone-label">${labelOptions}</select>
      <input type="text" class="phone-number" placeholder="Phone number" value="${number}">
      <button type="button" class="remove-field" onclick="removePhoneField('phone-${fieldId}')">&times;</button>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', fieldHtml);
}

function removePhoneField(fieldId) {
  const field = document.getElementById(fieldId);
  if (field) {
    field.remove();
  }
}

function toggleOptionalFields() {
  const optionalFields = document.getElementById('optionalFields');
  const toggleBtn = document.querySelector('.toggle-btn');
  
  if (optionalFields.classList.contains('hidden')) {
    optionalFields.classList.remove('hidden');
    toggleBtn.textContent = '▲ Less Fields';
  } else {
    optionalFields.classList.add('hidden');
    toggleBtn.textContent = '▼ More Fields';
  }
}

function showClientForm(client = null) {
  const form = document.getElementById('clientForm');
  const title = document.getElementById('clientFormTitle');
  const formData = document.getElementById('clientFormData');
  
  formData.reset();
  document.getElementById('clientId').value = '';
  document.getElementById('phoneFieldsContainer').innerHTML = '';
  document.getElementById('optionalFields').classList.add('hidden');
  document.querySelector('.toggle-btn').textContent = '▼ More Fields';
  
  if (client) {
    title.textContent = 'Edit Client';
    document.getElementById('clientId').value = client._id;
    document.getElementById('clientName').value = client.name;
    
    const phones = client.phones || [];
    if (phones.length > 0) {
      phones.forEach(p => addPhoneField(p.label || 'Mobile', p.number || ''));
    } else {
      addPhoneField('Mobile', '');
    }
    
    document.getElementById('clientAddress').value = client.address || '';
    document.getElementById('clientBirthday').value = client.birthday ? client.birthday.split('T')[0] : '';
    document.getElementById('clientNotes').value = client.notes || '';
  } else {
    title.textContent = 'Add New Client';
    addPhoneField('Mobile', '');
  }
  
  form.classList.remove('hidden');
}

function hideClientForm() {
  document.getElementById('clientForm').classList.add('hidden');
}

document.getElementById('clientFormData').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('clientId').value;
  
  const phoneFields = document.querySelectorAll('.phone-field');
  const phones = [];
  phoneFields.forEach(field => {
    const label = field.querySelector('.phone-label').value;
    const number = field.querySelector('.phone-number').value;
    if (number.trim()) {
      phones.push({ label, number: number.trim() });
    }
  });
  
  const clientData = {
    name: document.getElementById('clientName').value,
    phones: phones,
    address: document.getElementById('clientAddress').value,
    birthday: document.getElementById('clientBirthday').value,
    notes: document.getElementById('clientNotes').value
  };
  
  try {
    if (id) {
      API.clients.update(id, clientData);
    } else {
      API.clients.create(clientData);
    }
    
    hideClientForm();
    loadClients();
  } catch (error) {
    console.error('Error saving client:', error);
  }
});

function editClient(id) {
  const client = API.clients.getById(id);
  if (client) {
    showClientForm(client);
  }
}

function deleteClient(id) {
  if (!confirm('Are you sure you want to delete this client?')) return;
  
  try {
    API.clients.delete(id);
    loadClients();
  } catch (error) {
    console.error('Error deleting client:', error);
  }
}

function loadServices() {
  try {
    const services = API.services.getAll();
    renderServices(services);
  } catch (error) {
    console.error('Error loading services:', error);
    document.getElementById('servicesList').innerHTML = '<div class="empty-state">Error loading services.</div>';
  }
}

function renderServices(services) {
  const container = document.getElementById('servicesList');
  
  if (services.length === 0) {
    container.innerHTML = '<div class="empty-state">No services yet. Add your first service!</div>';
    return;
  }
  
  container.innerHTML = services.map(service => `
    <div class="card">
      <h3>${service.name}</h3>
      ${service.description ? `<p>${service.description}</p>` : ''}
      <p>Duration: ${service.duration} minutes</p>
      <p class="price">€${(service.basePrice || 0).toFixed(2)}</p>
      <div class="card-actions">
        <button class="edit-btn" onclick="editService('${service._id}')">Edit</button>
        <button class="delete-btn" onclick="deleteService('${service._id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

function showServiceForm(service = null) {
  const form = document.getElementById('serviceForm');
  const title = document.getElementById('serviceFormTitle');
  const formData = document.getElementById('serviceFormData');
  
  formData.reset();
  document.getElementById('serviceId').value = '';
  
  if (service) {
    title.textContent = 'Edit Service';
    document.getElementById('serviceId').value = service._id;
    document.getElementById('serviceName').value = service.name;
    document.getElementById('serviceDescription').value = service.description || '';
    document.getElementById('serviceDuration').value = service.duration;
    document.getElementById('servicePrice').value = service.basePrice;
  } else {
    title.textContent = 'Add New Service';
  }
  
  form.classList.remove('hidden');
}

function hideServiceForm() {
  document.getElementById('serviceForm').classList.add('hidden');
}

document.getElementById('serviceFormData').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('serviceId').value;
  const serviceData = {
    name: document.getElementById('serviceName').value,
    description: document.getElementById('serviceDescription').value,
    duration: parseInt(document.getElementById('serviceDuration').value),
    basePrice: parseFloat(document.getElementById('servicePrice').value)
  };
  
  try {
    if (id) {
      API.services.update(id, serviceData);
    } else {
      API.services.create(serviceData);
    }
    
    hideServiceForm();
    loadServices();
  } catch (error) {
    console.error('Error saving service:', error);
  }
});

function editService(id) {
  const service = API.services.getById(id);
  if (service) {
    showServiceForm(service);
  }
}

function deleteService(id) {
  if (!confirm('Are you sure you want to delete this service?')) return;
  
  try {
    API.services.delete(id);
    loadServices();
  } catch (error) {
    console.error('Error deleting service:', error);
  }
}

function loadAppointments() {
  try {
    const appointments = API.appointments.getAll();
    renderAppointments(appointments);
  } catch (error) {
    console.error('Error loading appointments:', error);
    document.getElementById('appointmentsList').innerHTML = '<div class="empty-state">Error loading appointments.</div>';
  }
}

function renderAppointments(appointments) {
  const container = document.getElementById('appointmentsList');
  
  if (appointments.length === 0) {
    container.innerHTML = '<div class="empty-state">No appointments yet. Schedule your first appointment!</div>';
    return;
  }
  
  const sortedAppointments = [...appointments].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  container.innerHTML = sortedAppointments.map(apt => {
    const total = (apt.price || 0) - (apt.discount || 0);
    
    return `
      <div class="card">
        <h3>${apt.clientName}</h3>
        <p>Service: ${apt.serviceName}</p>
        <p>Date: ${new Date(apt.date).toLocaleString()}</p>
        <p>Price: €${(apt.price || 0).toFixed(2)} ${(apt.discount || 0) > 0 ? `(Discount: €${apt.discount.toFixed(2)})` : ''}</p>
        <p class="price">Total: €${total.toFixed(2)}</p>
        <span class="status ${apt.status}">${apt.status}</span>
        ${apt.notes ? `<p><em>${apt.notes}</em></p>` : ''}
        <div class="card-actions">
          <button class="edit-btn" onclick="editAppointment('${apt._id}')">Edit</button>
          <button class="delete-btn" onclick="deleteAppointment('${apt._id}')">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

function showAppointmentForm(appointment = null) {
  const clients = API.clients.getAll();
  const services = API.services.getAll();
  
  const clientSelect = document.getElementById('appointmentClient');
  const serviceSelect = document.getElementById('appointmentService');
  
  clientSelect.innerHTML = clients.map(c => `<option value="${c._id}">${c.name}</option>`).join('');
  serviceSelect.innerHTML = services.map(s => `<option value="${s._id}" data-price="${s.basePrice}">${s.name} - €${(s.basePrice || 0).toFixed(2)}</option>`).join('');
  
  const form = document.getElementById('appointmentForm');
  const title = document.getElementById('appointmentFormTitle');
  const formData = document.getElementById('appointmentFormData');
  
  formData.reset();
  document.getElementById('appointmentId').value = '';
  document.getElementById('appointmentDiscount').value = '0';
  document.getElementById('appointmentStatus').value = 'scheduled';
  
  if (clients.length === 0 || services.length === 0) {
    alert('Please add clients and services first before creating an appointment.');
    return;
  }
  
  if (appointment) {
    title.textContent = 'Edit Appointment';
    document.getElementById('appointmentId').value = appointment._id;
    document.getElementById('appointmentClient').value = appointment.client;
    document.getElementById('appointmentService').value = appointment.service;
    document.getElementById('appointmentDate').value = appointment.date ? appointment.date.slice(0, 16) : '';
    document.getElementById('appointmentPrice').value = appointment.price;
    document.getElementById('appointmentDiscount').value = appointment.discount || 0;
    document.getElementById('appointmentStatus').value = appointment.status;
    document.getElementById('appointmentNotes').value = appointment.notes || '';
  } else {
    title.textContent = 'New Appointment';
  }
  
  form.classList.remove('hidden');
  
  updateDiscountSuggestion();
}

function hideAppointmentForm() {
  document.getElementById('appointmentForm').classList.add('hidden');
}

function updateDiscountSuggestion() {
  const clientId = document.getElementById('appointmentClient').value;
  const suggestion = getDiscountSuggestion(clientId);
  
  let suggestionHtml = '';
  if (suggestion) {
    suggestionHtml = `
      <div class="discount-suggestion">
        <p>💡 Based on ${suggestion.totalAppointments} past appointments, you usually give <strong>€${suggestion.avgDiscount.toFixed(2)}</strong> discount</p>
        <button type="button" class="suggestion-btn" onclick="applyDiscount(${suggestion.avgDiscount})">Apply €${suggestion.avgDiscount.toFixed(2)}</button>
      </div>
    `;
  }
  
  const discountGroup = document.getElementById('appointmentDiscount').parentElement;
  let suggestionContainer = discountGroup.querySelector('.discount-suggestion');
  if (suggestionContainer) {
    suggestionContainer.remove();
  }
  discountGroup.insertAdjacentHTML('beforeend', suggestionHtml);
}

function applyDiscount(amount) {
  document.getElementById('appointmentDiscount').value = amount.toFixed(2);
}

document.getElementById('appointmentClient').addEventListener('change', function() {
  updateDiscountSuggestion();
});

document.getElementById('appointmentService').addEventListener('change', function() {
  const selectedOption = this.options[this.selectedIndex];
  const price = selectedOption.dataset.price;
  if (price) {
    document.getElementById('appointmentPrice').value = price;
  }
});

document.getElementById('appointmentFormData').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('appointmentId').value;
  const appointmentData = {
    client: document.getElementById('appointmentClient').value,
    service: document.getElementById('appointmentService').value,
    date: document.getElementById('appointmentDate').value,
    price: parseFloat(document.getElementById('appointmentPrice').value),
    discount: parseFloat(document.getElementById('appointmentDiscount').value) || 0,
    status: document.getElementById('appointmentStatus').value,
    notes: document.getElementById('appointmentNotes').value
  };
  
  try {
    if (id) {
      API.appointments.update(id, appointmentData);
    } else {
      API.appointments.create(appointmentData);
    }
    
    hideAppointmentForm();
    loadAppointments();
  } catch (error) {
    console.error('Error saving appointment:', error);
  }
});

function editAppointment(id) {
  const appointment = API.appointments.getById(id);
  if (appointment) {
    showAppointmentForm(appointment);
  }
}

function deleteAppointment(id) {
  if (!confirm('Are you sure you want to delete this appointment?')) return;
  
  try {
    API.appointments.delete(id);
    loadAppointments();
  } catch (error) {
    console.error('Error deleting appointment:', error);
  }
}

function loadStatistics() {
  const period = document.getElementById('statsPeriod')?.value || 'all';
  const appointments = API.appointments.getAll();
  const clients = API.clients.getAll();
  const services = API.services.getAll();
  
  const now = new Date();
  let filteredAppointments = appointments;
  
  if (period !== 'all') {
    const days = parseInt(period);
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    filteredAppointments = appointments.filter(a => new Date(a.date) >= cutoff);
  }
  
  const completedAppointments = filteredAppointments.filter(a => a.status === 'completed');
  const totalRevenue = completedAppointments.reduce((sum, a) => sum + (a.price - a.discount), 0);
  
  document.getElementById('statTotalRevenue').textContent = `€${totalRevenue.toFixed(2)}`;
  document.getElementById('statTotalAppointments').textContent = filteredAppointments.length;
  document.getElementById('statTotalClients').textContent = clients.length;
  
  const completionRate = filteredAppointments.length > 0 
    ? Math.round((completedAppointments.length / filteredAppointments.length) * 100) 
    : 0;
  document.getElementById('statCompletionRate').textContent = `${completionRate}%`;
  
  const clientStats = {};
  filteredAppointments.forEach(apt => {
    const clientId = apt.client;
    if (!clientStats[clientId]) {
      clientStats[clientId] = {
        name: apt.clientName,
        revenue: 0,
        appointments: 0,
        completed: 0,
        cancelled: 0,
        noShow: 0,
        dates: []
      };
    }
    clientStats[clientId].appointments++;
    clientStats[clientId].revenue += (apt.price - apt.discount);
    clientStats[clientId].dates.push(new Date(apt.date));
    if (apt.status === 'completed') clientStats[clientId].completed++;
    if (apt.status === 'cancelled') clientStats[clientId].cancelled++;
    if (apt.status === 'no-show') clientStats[clientId].noShow++;
  });
  
  const topClients = Object.values(clientStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
  
  document.getElementById('statTopClients').innerHTML = topClients.map((c, i) => `
    <div class="stat-item">
      <span class="rank">#${i + 1}</span>
      <span class="name">${c.name}</span>
      <span class="value">€${c.revenue.toFixed(2)}</span>
    </div>
  `).join('') || '<p>No data</p>';
  
  const frequentClients = Object.values(clientStats)
    .sort((a, b) => b.appointments - a.appointments)
    .slice(0, 5);
  
  document.getElementById('statFrequentClients').innerHTML = frequentClients.map((c, i) => `
    <div class="stat-item">
      <span class="rank">#${i + 1}</span>
      <span class="name">${c.name}</span>
      <span class="value">${c.appointments} visits</span>
    </div>
  `).join('') || '<p>No data</p>';
  
  const stabilityClients = Object.values(clientStats)
    .filter(c => c.appointments >= 2)
    .map(c => ({
      ...c,
      stability: c.appointments > 0 ? (c.completed / c.appointments) * 100 : 0
    }))
    .sort((a, b) => b.stability - a.stability)
    .slice(0, 5);
  
  document.getElementById('statStability').innerHTML = stabilityClients.map((c, i) => `
    <div class="stat-item">
      <span class="rank">#${i + 1}</span>
      <span class="name">${c.name}</span>
      <span class="value">${c.stability.toFixed(0)}% completed</span>
    </div>
  `).join('') || '<p>Need at least 2 appointments to calculate stability</p>';
  
  const serviceStats = {};
  filteredAppointments.forEach(apt => {
    const serviceId = apt.service;
    if (!serviceStats[serviceId]) {
      serviceStats[serviceId] = {
        name: apt.serviceName,
        count: 0,
        revenue: 0
      };
    }
    serviceStats[serviceId].count++;
    serviceStats[serviceId].revenue += (apt.price - apt.discount);
  });
  
  const popularServices = Object.values(serviceStats)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  document.getElementById('statPopularServices').innerHTML = popularServices.map((s, i) => `
    <div class="stat-item">
      <span class="rank">#${i + 1}</span>
      <span class="name">${s.name}</span>
      <span class="value">${s.count} x (€${s.revenue.toFixed(2)})</span>
    </div>
  `).join('') || '<p>No data</p>';
  
  const monthlyRevenue = {};
  completedAppointments.forEach(apt => {
    const date = new Date(apt.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyRevenue[key] = (monthlyRevenue[key] || 0) + (apt.price - apt.discount);
  });
  
  const sortedMonths = Object.keys(monthlyRevenue).sort().slice(-6);
  document.getElementById('statMonthlyRevenue').innerHTML = sortedMonths.map(m => `
    <div class="chart-bar">
      <div class="bar" style="height: ${Math.max(10, (monthlyRevenue[m] / Math.max(...Object.values(monthlyRevenue))) * 100)}%"></div>
      <span class="label">${m}</span>
      <span class="value">€${monthlyRevenue[m].toFixed(0)}</span>
    </div>
  `).join('') || '<p>No data</p>';
  
  const today = new Date();
  const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const upcomingBirthdays = clients
    .filter(c => c.birthday)
    .map(c => {
      const bday = new Date(c.birthday);
      bday.setFullYear(today.getFullYear());
      if (bday < today) bday.setFullYear(today.getFullYear() + 1);
      return { ...c, bday };
    })
    .filter(c => c.bday >= today && c.bday <= thirtyDaysLater)
    .sort((a, b) => a.bday - bday)
    .slice(0, 5);
  
  document.getElementById('statBirthdays').innerHTML = upcomingBirthdays.length > 0 
    ? upcomingBirthdays.map(c => `
        <div class="stat-item">
          <span class="name">${c.name}</span>
          <span class="value">${c.bday.toLocaleDateString()}</span>
        </div>
      `).join('')
    : '<p>No birthdays in the next 30 days</p>';
}
