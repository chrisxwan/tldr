$(document).ready(function() {

	$('#btnSubmit').click(function() {
		$.post('/adduser', {
			firstname : $('#inputFirstName').val(),
			lastname : $('#inputLastName').val(),
			useremail : $('#inputUserEmail').val()
		});
	}); 

  $("form").submit(function(){
    var isFormValid = true;
    $("input").each(function(){
        if ($.trim($(this).val()).length == 0){
            isFormValid = false;
    });
    if (!isFormValid) alert("Please fill in all the required fields");
    return isFormValid;
	});
});