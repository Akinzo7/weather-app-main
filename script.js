console.log("Hello, World!");

// handle dropdown toggle for units dropdown
const unitBtn = document.querySelector(".unit_button");
const unitDropdown = document.querySelector(".units_dropdown");

unitBtn.addEventListener("click", () => {
  console.log("Dropdown clicked");
  unitDropdown.classList.toggle("show");
});

document.addEventListener("click", (e) => {
  if (
    unitDropdown.classList.contains("show") &&
    !unitBtn.contains(e.target) &&
    !unitDropdown.contains(e.target)
  ) {
    console.log("clicked outside the dropdown");
    unitDropdown.classList.remove("show");
  }
});

// handle dropdown option selection
const dropdownOptions = document.querySelectorAll(".dropdown_option");

dropdownOptions.forEach((option) => {
  option.addEventListener("click", (e) => {
    const clickedButton = e.currentTarget;
    const section = clickedButton.closest(".dropdown_section");
    const currentActive = section.querySelector(".active_option");

    currentActive.classList.remove("active_option");
    currentActive.querySelector("span").remove();
    clickedButton.classList.add("active_option");

    const span = document.createElement("span");
    const img = document.createElement("img");
    img.src = "./assets/images/icon-checkmark.svg";
    img.alt = "checkmark icon";

    clickedButton.appendChild(span);
    span.appendChild(img);
  });
});
  
// handle switch toggle between imperial and metic

const toggleSwitch = document.querySelector('.switch_units');

toggleSwitch.addEventListener('click', () => {
  
toggleSwitch.textContent= (toggleSwitch.textContent === "Switch to Imperial") ? "Switch to Metric" : "Switch to Imperial";

})
