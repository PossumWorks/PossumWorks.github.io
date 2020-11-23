$(document).ready(function() {

	$('#submitButton').prop("disabled", true);

	function updateFormEnabled() {
		if (verifySelect()) {
			$('#submitButton').prop("disabled", false);
		} else {
			$('#submitButton').prop("disabled", true);
		}
	}

	function verifySelect() {
		if ($("#countySel :selected").val() !== '') {
			return true;
		} else {
			return false;
		}
	}

	$("#countySel").on('change', function() {
		alert($("#countySel :selected").val());
		updateFormEnabled();

	});

	// Create the connector object
	var myConnector = tableau.makeConnector();

	// Define the schema
	myConnector.getSchema = function(schemaCallback) {
		var cols = [{
			id: "CountyName",
			alias: "County Name",
			dataType: tableau.dataTypeEnum.string
		}, {
			id: "tested",
			alias: "Number Tested",
			dataType: tableau.dataTypeEnum.int
		}, {
			id: "confirmed_cases",
			alias: "Total Cases",
			dataType: tableau.dataTypeEnum.int
		}, {
			id: "deaths",
			alias: "Deaths",
			dataType: tableau.dataTypeEnum.int
		}, {
			id: "reportDate",
			alias: "Date",
			dataType: tableau.dataTypeEnum.datetime
		}, {
			id: "latitude",
			alias: "Lat",
			dataType: tableau.dataTypeEnum.float
		}, {
			id: "longitude",
			alias: "Lon",
			dataType: tableau.dataTypeEnum.float
		}];

		var tableSchema = {
			id: "countyTemproalCovidFeed",
			alias: "Temporal COVID data by County - IL DPH Public Data",
			columns: cols
		};

		schemaCallback([tableSchema]);
	};

	tableau.registerConnector(myConnector);

	$("#submitButton").click(function() {
		// Download the data
		myConnector.getData = function(table, doneCallback) {
			var apiUri = "https://idph.illinois.gov/DPHPublicInformation/api/COVID/GetCountyHistorical?application=json&";
			var paramsObj = JSON.parse(tableau.connectionData),
				paramsString = "countyName=" + paramsObj.countyName,
				apiCall = apiUri + paramsString;

			$.getJSON(apiCall, function(resp) {
				var vals = resp.values,
					tableData = [];

				// Iterate over the JSON object
				for (var i = 0, len = vals.length; i < len; i++) {
					tableData.push({
						"CountyName": vals[i].CountyName,
						"tested": vals[i].tested,
						"confirmed_cases": vals[i].confirmed_cases,
						"deaths": vals[i].deaths,
						"reportDate": vals[i].reportDate,
						"latitude": vals[i].latitude,
						"longitude": vals[i].longitude
					});
				}

				table.appendRows(tableData);
				doneCallback();
			});
		};


		// Create event listeners for when the user submits the form
		// $(document).ready(function() {
		// $("#submitButton").click(function() {
		var cntyName = {
			countyName: $("#countySel :selected").val()
		};

		tableau.connectionData = JSON.stringify(cntyName); // Use this variable to pass data to your getSchema and getData functions
		tableau.connectionName = "County Level COVID Data"; // This will be the data source name in Tableau
		tableau.submit(); // This sends the connector object to Tableau

		// });

		// });
	});
})();
