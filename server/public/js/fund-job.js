$('button').on('click', function (event) {
	console.log("firing");
	event.preventDefault();
	$('form div').addClass('active');
});