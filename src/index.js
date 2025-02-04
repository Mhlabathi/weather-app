import "./styles.css";

const dropdownBtn = document.getElementById('dropbtn');

dropdownBtn.addEventListener('click', ()=>{showDropdownList();
});

function showDropdownList (){document.getElementById("myDropdown").classList.toggle("show");}