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
		//alert($("#countySel :selected").val());
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
			id: "TotalTested",
			alias: "TotalTested",
			dataType: tableau.dataTypeEnum.int
		}, {
			id: "CumulativeCases",
			alias: "CumulativeCases",
			dataType: tableau.dataTypeEnum.int
		}, {
			id: "Deaths",
			alias: "Deaths",
			dataType: tableau.dataTypeEnum.int
		}, {
			id: "ReportDate",
			alias: "ReportDate",
			dataType: tableau.dataTypeEnum.datetime
		}];

		var tableSchema = {
			id: "countyTemproalCovidFeed",
			alias: "Temporal COVID data by County - IL DPH Public Data",
			columns: cols
		};

		schemaCallback([tableSchema]);
	};


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
					"TotalTested": vals[i].TotalTested,
					"CumulativeCases": vals[i].CumulativeCases,
					"Deaths": vals[i].Deaths,
					"ReportDate": vals[i].ReportDate

				});
			}

			table.appendRows(tableData);
			doneCallback();
		});
	};

	tableau.connectionName = "County Level COVID Data"; // This will be the data source name in Tableau
	tableau.registerConnector(myConnector);
	
	$("#submitButton").click(function() {
		// Create event listeners for when the user submits the form
		// $(document).ready(function() {
		// $("#submitButton").click(function() {
		var cntyName = {
			countyName: $("#countySel :selected").val()
		};

		tableau.connectionData = JSON.stringify(cntyName); // Use this variable to pass data to your getSchema and getData functions
		tableau.submit(); // This sends the connector object to Tableau

		// });

		// });
	});
});
