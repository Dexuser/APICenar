$(document).ready(function () {
    
  // Initialize the delete button with a confirmation dialog
  $('.delete-assets').on('click', function (e) {
    e.preventDefault();
    const form = $(this).closest('form');
    if (confirm('Are you sure you want to delete this asset?')) {
      form.submit();
    }
  });

});