// Initialize Firebase
var config = {
    apiKey: "AIzaSyAX4iXu6HpkJGyEKONFuMfjSXK1FhBgK9w",
    authDomain: "uber-rail.firebaseapp.com",
    databaseURL: "https://uber-rail.firebaseio.com",
    storageBucket: "uber-rail.appspot.com",
};
firebase.initializeApp(config);

var database = firebase.database();

// Capture Button Click
$("#addTrainButton").on("click", function() {

	// Grabs user input
	var trainName = $('#trainNameInput').val().trim();
	var trainDestination = $('#destinationInput').val().trim();
	var trainFirst = moment($('#firstTrainInput').val().trim(), "HH:mm").format("X");
	var trainFrequency = $('#frequencyInput').val().trim();

	console.log("Submit button pushed!");

	// Prevents an incomplete train from being added
	if (trainName != "" && trainDestination != "" && trainFirst != "" && trainFrequency != ""){
		// Push the Add Train data to FB db
		database.ref().push({
			name: trainName,
			dest: trainDestination,
			first: trainFirst,
			freq: trainFrequency,
		});

		// Alert
		alert("Train added!");
	} else { // Incomplete train form!
		alert("Please complete each field to add a train to the schedule.");
	}

	// Clears the input text boxes
	$('#trainNameInput').val("");
	$('#destinationInput').val("");
	$('#firstTrainInput').val("");
	$('#frequencyInput').val("");

	// Don't refresh the page!
	return false;
});


// Watches Firebase and runs this upon initial page load + when a train is added
database.ref().on("child_added", function(snapshot) {

	// Store the child's snapshot data in local variables to make life easier
	var trainName = snapshot.val().name;
	var trainDestination = snapshot.val().dest;
	var trainFirst = snapshot.val().first;
	var trainFrequency = snapshot.val().freq;

	// Log everything that's coming out of snapshot
	console.log("Train name: " + trainName);
	console.log("Destination: " + trainDestination);
	console.log("First train of the day: " + trainFirst);
	console.log("Freq of train (min): " + trainFrequency);

	// Current Time
	var currentTime = moment();
	console.log("CURRENT TIME: " + moment(currentTime).format("HH:mm"));

	// Convert the current time to Unix time for moment.js
	var currentTimeConverted = moment(currentTime).format("X");
	console.log("CURRENT TIME CONVERTED TO UNIX: " + currentTimeConverted);

	// Push back the trainFirst time by 1 day to make sure it comes before the current time
	// (if you don't have this, diffTime could be a negative number)
	var firstTimePushed = moment(trainFirst,"X").subtract(1, "days");
	console.log("FIRST TIME PUSHED BACK BY 1 DAY: " + firstTimePushed);

	// Difference between the current time and firstTimePushed
	var diffTime = moment(currentTimeConverted, "X").diff(moment(firstTimePushed, "X"), "minutes");
	console.log("DIFFERENCE IN TIME (min): " + diffTime);

	// Time apart (remainder, or time since the last train)
	var trainRem = diffTime % trainFrequency;
	console.log("TIME SINCE LAST TRAIN (min): "+ trainRem);

	// Minutes until next train (wait time)
	var trainWait = trainFrequency - trainRem;
	
	// Calculate nextTrain time
	var nextTrain = moment().add(trainWait, "minutes");
	console.log("NEXT ARRIVAL: " + moment(nextTrain).format("hh:mm A"));
	console.log("MINUTES AWAY: " + trainWait);

	// Checks if a train has started running today yet
	if (currentTimeConverted > trainFirst) { // Train has started running
		// Display each train's data in the table
		$("#trainTable > tbody").append("<tr><td>" + trainName + "</td><td>" 
			+ trainDestination + "</td><td>" 
			+ trainFrequency + "</td><td>"
			+ moment(nextTrain).format("hh:mm A") + "</td><td>"
			+ trainWait + "</td></tr>");
	} else {  // Train has not yet started running today
		console.log(currentTimeConverted + " < " + trainFirst + " This train hasn't started its run yet today.");
		trainWait = moment(trainFirst, "X").diff(moment(currentTimeConverted, "X"), "minutes");

		$("#trainTable > tbody").append("<tr><td>" + trainName + "</td><td>" 
			+ trainDestination + "</td><td>" 
			+ trainFrequency + "</td><td>"
			+ moment(trainFirst, "X").format("hh:mm A") + "</td><td>"
			+ trainWait + "</td></tr>");
	}

	console.log("-------------------------------------------");

// Handle the errors
}, function(errorObject){

	console.log("Errors handled: " + errorObject.code)
})