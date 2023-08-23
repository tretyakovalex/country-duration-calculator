document.addEventListener('DOMContentLoaded', function () {
    // Listen for the form's submit event
    document.getElementById('dates').addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission behavior

        // Get form input values
        var entryDateInput = document.getElementById('entryDate');
        var exitDateInput = document.getElementById('exitDate');

        var entryDate = entryDateInput.value;
        var exitDate = exitDateInput.value;

        // Log the values for demonstration purposes
        console.log('Entry Date:', entryDate);
        console.log('Exit Date:', exitDate);

        // You can perform further actions with the form data here
    });
});
