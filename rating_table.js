document.addEventListener('DOMContentLoaded', async function () {
    const beginDate = new Date();
    const endDate = new Date();
    const reportDiv = "alarm_datman";

    // Display the loading indicator for water quality alarm
    const loadingIndicator = document.getElementById(`loading_${reportDiv}`);
    loadingIndicator.style.display = 'block'; // Show the loading indicator

    console.log("beginDate: ", beginDate);
    console.log("endDate: ", endDate);
    console.log("type_flow: ", type_flow);

    let setBaseUrl = null;
    if (cda === "internal") {
        setBaseUrl = `https://wm.${office.toLowerCase()}.ds.usace.army.mil:8243/${office.toLowerCase()}-data/`;
        // console.log("setBaseUrl: ", setBaseUrl);
    } else if (cda === "public") {
        setBaseUrl = `https://cwms-data.usace.army.mil/cwms-data/`;
        // console.log("setBaseUrl: ", setBaseUrl);
    }

    // Define the URL to fetch location groups based on category
    const categoryApiUrl = setBaseUrl + `ratings/${rating_id}?office=${office}`;
    console.log("categoryApiUrl: ", categoryApiUrl);


    // Fetch location group data from the API
    fetch(categoryApiUrl, {
        method: 'GET',
        headers: {
            'Accept': 'application/json;version=2'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log("data: ", data);

            const table = createTable(data);
            const container = document.getElementById(`table_container_${reportDiv}`);
            container.appendChild(table);

            loadingIndicator.style.display = 'none';
        })
        .catch(error => {
            console.error('There was a problem with the initial fetch operation:', error);
            loadingIndicator.style.display = 'none';
        });

    function createTable(ratingData) {
        let simpleRatings = ratingData['simple-rating'];

        // Ensure `simpleRatings` is always an array
        if (!Array.isArray(simpleRatings)) {
            simpleRatings = [simpleRatings];
        }

        // Sort `simpleRatings` by the latest `create-date`
        const sortedRatings = simpleRatings.sort((a, b) => {
            const dateA = new Date(a['create-date']);
            const dateB = new Date(b['create-date']);
            return dateB - dateA; // Sort in descending order (latest first)
        });

        // Use the first element (latest create-date)
        const latestRating = sortedRatings[0];
        console.log(latestRating['create-date']);
        console.log(latestRating['effective-date']);

        // Extract the necessary data
        const points = latestRating['rating-points']['point'];

        // Create the table element
        const table = document.createElement('table');
        table.id = 'customers';

        // Add table header row
        const headerRow = document.createElement('tr');
        const indHeader = document.createElement('th');
        indHeader.textContent = "Stage (ft)";
        const depHeader = document.createElement('th');
        depHeader.textContent = "Flow (cfs)";
        headerRow.appendChild(indHeader);
        headerRow.appendChild(depHeader);
        table.appendChild(headerRow);

        // Add data rows
        points.forEach(point => {
            const row = document.createElement('tr');

            const indCell = document.createElement('td');
            const depCell = document.createElement('td');

            // Format values to two decimal places
            const indValue = parseFloat(point.ind).toFixed(2);
            const depValue = parseFloat(point.dep).toFixed(0);

            indCell.textContent = indValue;
            depCell.textContent = depValue;

            row.appendChild(indCell);
            row.appendChild(depCell);
            table.appendChild(row);
        });

        // Return the generated table
        return table;
    }
});