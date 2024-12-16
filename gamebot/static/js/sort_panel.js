document.addEventListener('DOMContentLoaded', function() {
    const table = document.getElementById('leaderboardTable');
    const headers = table.querySelectorAll('th');
    const tableBody = table.querySelector('tbody');
    const rows = tableBody.querySelectorAll('tr');

    // Sort direction for each column
    const directions = Array.from(headers).map(() => '');

    // Add click event for all headers
    headers.forEach((header, index) => {
        header.addEventListener('click', () => {
            sortColumn(index);
        });
    });

    function sortColumn(index) {
        // Remove sort-icon class from all headers
        headers.forEach(header => header.classList.remove('sort-icon', 'desc'));

        // Get current direction
        const direction = directions[index] || 'asc';
        const multiplier = (direction === 'asc') ? 1 : -1;

        // Add sort-icon class to the clicked header
        headers[index].classList.add('sort-icon');
        if (direction === 'desc') {
            headers[index].classList.add('desc');
        }

        const newRows = Array.from(rows);

        newRows.sort((rowA, rowB) => {
            const cellA = rowA.querySelectorAll('td')[index].textContent.trim();
            const cellB = rowB.querySelectorAll('td')[index].textContent.trim();

            if (index === 0) {
                return multiplier * cellA.localeCompare(cellB);
            } else {
                const numA = parseFloat(cellA);
                const numB = parseFloat(cellB);
                return multiplier * (numA - numB);
            }
        });

        // Remove old rows
        rows.forEach(row => {
            tableBody.removeChild(row);
        });

        // Append new sorted rows
        newRows.forEach(newRow => {
            tableBody.appendChild(newRow);
        });

        // Update direction
        directions[index] = direction === 'asc' ? 'desc' : 'asc';
    }
});