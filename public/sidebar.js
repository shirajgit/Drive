const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuBtn");
const overlay = document.getElementById("overlay");

menuBtn.addEventListener("click", () => {
    console.log("Menu button clicked");
  sidebar.classList.toggle("-translate-x-full");
  overlay.classList.toggle("hidden");
});

overlay.addEventListener("click", closeSidebar);

function closeSidebar() {
  sidebar.classList.add("-translate-x-full");
  overlay.classList.add("hidden");
}

// auto-close on mobile when link clicked
document.querySelectorAll(".sidebar-link1").forEach(link => {
  link.addEventListener("click", () => {
    if (window.innerWidth < 768) closeSidebar();
  });
});
