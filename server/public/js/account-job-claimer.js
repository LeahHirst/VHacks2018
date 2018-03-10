function jobCompletionForm(){ 
	var fundForm = document.getElementById("job-completion-form");
	var submitButton =  document.getElementById("complete-form-submission");
	if (fundForm.classList.contains("inactive-completion") && (submitButton.innerHTML.indexOf("FEEDBACK SUBMITTED") == -1)){
		fundForm.classList.remove("inactive-completion");
		fundForm.classList.add("active-completion");
	}

	// Completion should be submitted
	else{
		fundForm.classList.add("inactive-completion");
		fundForm.classList.remove("active-completion")
		submitButton.innerHTML = "<span>Job Completion Submitted</span"
	}

};

function cancelCompletedForm(){
	var fundForm = document.getElementById("job-completion-form");
	fundForm.classList.add("inactive-completion");
	fundForm.classList.remove("active-completion")
};