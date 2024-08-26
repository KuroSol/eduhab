document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed");

    function toggleDropdown(event) {
      console.log("Dropdown clicked");
      const dropdownContent = event.currentTarget.nextElementSibling;
      console.log("Toggling visibility for:", dropdownContent);
      if (dropdownContent.style.display === 'block') {
        dropdownContent.style.display = 'none';
      } else {
        dropdownContent.style.display = 'block';
      }
    }
  
    // Attach event listeners to all dropdown buttons
    const buttons = document.querySelectorAll('.dropdown-btn');
    console.log("Dropdown buttons found:", buttons.length);
    buttons.forEach(button => {
      button.addEventListener('click', toggleDropdown);
    });
});
