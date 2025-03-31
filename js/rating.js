document.addEventListener('DOMContentLoaded', async function () {
    const beginDate = new Date();
    const endDate = new Date();
    const reportDiv = "alarm_datman";

    // Display the loading indicator for water quality alarm
    const loadingIndicator = document.getElementById(`loading_${reportDiv}`);
    loadingIndicator.style.display = 'block'; // Show the loading indicator

    console.log("beginDate: ", beginDate);
    console.log("endDate: ", endDate);

    let setBaseUrl = null;
    if (cda === "internal") {
        setBaseUrl = `https://wm.${office.toLowerCase()}.ds.usace.army.mil/${office.toLowerCase()}-data/`;
    } else if (cda === "public") {
        setBaseUrl = `https://cwms-data.usace.army.mil/cwms-data/`;
    }
    console.log("setBaseUrl: ", setBaseUrl);

    // Define the URL to fetch location groups based on category
    const categoryApiUrl = setBaseUrl + `ratings/metadata?office=${office}&page-size=500`;
    console.log("categoryApiUrl: ", categoryApiUrl);


    // Fetch location group data from the API
    fetch(categoryApiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log("data: ", data);

            data = data["rating-metadata"].filter(metadata =>
                metadata["rating-spec"].version === `${version_id}` &&
                metadata["rating-spec"]["template-id"] === `${template_id}`
            );
            console.log("data: ", data);

            const table = createTable(data);

            // Append the table to the specified container
            const container = document.getElementById(`table_container_${reportDiv}`);
            container.appendChild(table);

            loadingIndicator.style.display = 'none';
        })
        .catch(error => {
            console.error('There was a problem with the initial fetch operation:', error);
            loadingIndicator.style.display = 'none';
        });

    function createTable(data, setBaseUrl) {
        // Create table elements
        const table = document.createElement('table');
        table.id = 'customers';

        // Create the header row
        const headerRow = document.createElement('tr');
        const headers = ['Rating ID', 'Create Date', 'Effective Date'];
        headers.forEach(headerText => {
            const header = document.createElement('th');
            header.textContent = headerText;
            header.style.padding = '8px';
            header.style.textAlign = 'left';
            headerRow.appendChild(header);
        });
        table.appendChild(headerRow);

        // Populate table rows with data
        data.forEach(item => {
            const row = document.createElement('tr');

            // Extract rating-id
            const ratingId = item['rating-spec']['rating-id'];

            // Sort ratings by effective-date in descending order
            const sortedRatings = [...item['ratings']].sort((a, b) => new Date(b['effective-date']) - new Date(a['effective-date']));

            // Get the latest create-date and effective-date
            const latestRating = sortedRatings[0];
            const createDate = latestRating ? latestRating['create-date'] : 'N/A';
            const effectiveDate = latestRating ? latestRating['effective-date'] : 'N/A';

            // Create and append cells
            // Rating ID as a link
            const ratingIdCell = document.createElement('td');
            const link = document.createElement('a');
            if (ratingId) {
                link.href = `rating_table.html?office=MVS&rating_id=${encodeURIComponent(ratingId)}`;
                link.textContent = ratingId;
            } else {
                link.href = '#';
                link.textContent = 'Undefined';
            }
            link.target = '_blank';
            ratingIdCell.appendChild(link);
            ratingIdCell.style.padding = '8px';
            row.appendChild(ratingIdCell);

            // Create Date
            const createDateCell = document.createElement('td');
            createDateCell.textContent = createDate;
            createDateCell.style.padding = '8px';
            row.appendChild(createDateCell);

            // Effective Date
            const effectiveDateCell = document.createElement('td');
            effectiveDateCell.textContent = effectiveDate;
            effectiveDateCell.style.padding = '8px';
            row.appendChild(effectiveDateCell);

            table.appendChild(row);
        });

        return table;
    }
});