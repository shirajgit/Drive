 
    function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");

    sidebar.classList.toggle("-translate-x-full");
    overlay.classList.toggle("hidden");
  }
 
    

   
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn');

    // Highlight based on URL
    buttons.forEach(button => {
        const link = button.closest('a');
        if (link && link.getAttribute('href') === window.location.pathname) {
            button.classList.add('btn--active');
        }
    });

    // Keep your click logic too (optional)
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            buttons.forEach(btn => btn.classList.remove('btn--active'));
            this.classList.add('btn--active');
        });
    });
}); 

 
     function showpop(){
      document.querySelector('.pop').style.display = 'flex';    
     } 

     function hidepop(){
      document.querySelector('.pop').style.display = 'none';    
     }
 
  
 
  
 
