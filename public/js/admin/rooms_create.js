const categoryButtons = document.querySelectorAll('.category-button');
const selectedCategoriesInput = document.getElementById('selectedCategories');
const createRoomButton = document.getElementById('createRoomButton');
let selectedCategories = [];

function checkIfCategoriesSelected() {
    createRoomButton.disabled = selectedCategories.length === 0;
}

categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        const category = button.getAttribute('data-category');

        if (selectedCategories.includes(category)) {
            selectedCategories = selectedCategories.filter(cat => cat !== category);
            button.classList.remove('selected');
        } else {
            selectedCategories.push(category);
            button.classList.add('selected');
        }

        selectedCategoriesInput.value = JSON.stringify(selectedCategories);
        checkIfCategoriesSelected();
    });
});

checkIfCategoriesSelected();