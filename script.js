const contacts = JSON.parse(localStorage.getItem("contacts")) || [];
const form = document.getElementById("contactForm");
const list = document.getElementById("contactList");
const search = document.getElementById("search");

function save() {
  localStorage.setItem("contacts", JSON.stringify(contacts));
}

function render(filter = "") {
  list.innerHTML = "";

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(filter) ||
    c.email.toLowerCase().includes(filter)
  );

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state"><p>No contacts found. Start by adding a new contact!</p></div>';
    return;
  }

  filtered.forEach((c, index) => {
    const actualIndex = contacts.indexOf(c);
    const li = document.createElement("li");
    li.draggable = true;
    li.dataset.index = actualIndex;

    const contactInfo = document.createElement("div");
    contactInfo.className = "contact-item";

    const info = document.createElement("div");
    info.className = "contact-info";

    const nameSpan = document.createElement("div");
    nameSpan.innerHTML = `<strong>${escapeHtml(c.name)}</strong>`;
    
    const emailSpan = document.createElement("div");
    emailSpan.textContent = `📧 ${c.email}`;
    emailSpan.style.fontSize = "13px";
    emailSpan.style.color = "#666";
    emailSpan.style.marginTop = "4px";
    
    const phoneSpan = document.createElement("div");
    phoneSpan.textContent = `📱 ${c.phone}`;
    phoneSpan.style.fontSize = "13px";
    phoneSpan.style.color = "#666";
    phoneSpan.style.marginTop = "4px";

    info.append(nameSpan, emailSpan, phoneSpan);

    const actions = document.createElement("div");
    actions.className = "contact-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "edit-btn";
    editBtn.textContent = "✏️ Edit";
    editBtn.onclick = (e) => {
      e.stopPropagation();
      const n = prompt("Edit name:", c.name) || "";
      if (!n.trim()) return;
      
      const e_val = prompt("Edit email:", c.email) || "";
      if (!e_val.trim()) return;
      
      const p = prompt("Edit phone:", c.phone) || "";
      if (!p.trim()) return;

      contacts[actualIndex] = { 
        name: n.trim(), 
        email: e_val.trim(), 
        phone: p.trim() 
      };
      save();
      render(search.value.toLowerCase());
    };

    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "🗑️ Delete";
    delBtn.onclick = (e) => {
      e.stopPropagation();
      if (confirm(`Delete contact "${c.name}"?`)) {
        contacts.splice(actualIndex, 1);
        save();
        render(search.value.toLowerCase());
      }
    };

    actions.append(editBtn, delBtn);
    contactInfo.append(info, actions);
    li.appendChild(contactInfo);

    li.addEventListener("dragstart", () => li.classList.add("dragging"));
    li.addEventListener("dragend", () => {
      li.classList.remove("dragging");
      updateOrder();
    });

    list.appendChild(li);
  });
}

function updateOrder() {
  const items = [...list.querySelectorAll("li[data-index]")];
  const newArr = [];

  items.forEach(li => {
    const index = parseInt(li.dataset.index);
    newArr.push(contacts[index]);
  });

  contacts.splice(0, contacts.length, ...newArr);
  save();
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

list.addEventListener("dragover", e => {
  e.preventDefault();
  const dragging = document.querySelector("li.dragging");
  if (!dragging) return;
  
  const after = [...list.querySelectorAll("li:not(.dragging)")].find(li => {
    const box = li.getBoundingClientRect();
    return e.clientY < box.top + box.height / 2;
  });
  after ? list.insertBefore(dragging, after) : list.appendChild(dragging);
});

form.addEventListener("submit", e => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();

  if (!name || !email || !phone) {
    alert("Please fill in all fields");
    return;
  }

  if (!email.includes("@")) {
    alert("Please enter a valid email address");
    return;
  }

  contacts.push({ name, email, phone });
  save();
  render(search.value.toLowerCase());
  form.reset();
  document.getElementById("name").focus();
});

search.addEventListener("input", () => {
  render(search.value.toLowerCase());
});

render();
