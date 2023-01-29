function allclick (checkbox) {
    const checkboxes = document.querySelectorAll('form input[type="checkbox"]');

    checkboxes.forEach((el) => {
        el.checked = checkbox.checked;
    });
}