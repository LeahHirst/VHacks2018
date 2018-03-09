function myMap() {
	var mapOptions = {
		center: new google.maps.LatLng(51.5, -0.12),
		zoom: 10,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	var map = new google.maps.Map(document.getElementById("map"), mapOptions);
};

function fundJob(){
	console.log("fund job");
	var fundForm = document.getElementById("money-form");
	var fundButton = document.getElementById("fund-job-btn");
	console.log(fundButton.innerHTML);
	var alreadyCompletedText = "<span class='bold-text'>THANK YOU</span>";
	// Donation is inactive and the form should be displayed
	if (fundForm.classList.contains("inactive-donation") && (fundButton.innerHTML.indexOf("THANK YOU") == -1)) {
		fundButton.innerHTML = "<span>SUBMIT DONATION</span>";
		fundForm.classList.remove("inactive-donation");
		fundForm.classList.add("active-donation");
	}

	// Donation is active and should be submitted
	else {
		fundButton.innerHTML = "<span class='bold-text'>THANK YOU</span>";
		fundForm.classList.remove("active-donation");
		fundButton.classList.add("complete-donation");
		fundForm.classList.add("inactive-donation");
	}	

};

function cancelDonation(){
	var fundForm = document.getElementById("money-form");
	var fundButton = document.getElementById("fund-job-btn");
	fundButton.innerHTML = "<span>FUND JOB</span>";
	fundForm.classList.remove("active-donation");
	fundForm.classList.add("inactive-donation");
};
