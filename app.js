const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 4000;

app.use(bodyParser.urlencoded({ extended: true })); // Parse form data
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index');
});

// New route to send data from dates.json
app.get('/get-data', (req, res) => {
    if (fs.existsSync('dates.json')) {
        const jsonData = fs.readFileSync('dates.json', 'utf8');
        const data = JSON.parse(jsonData);
        res.json(data);
    } else {
        res.json([]); // Return an empty array if the file doesn't exist
    }
});

app.post('/submit', (req, res) => {
    const submittedData = req.body; // Access the submitted form data
    const jsonData = JSON.stringify(submittedData);

    fs.writeFile('dates.json', jsonData, err => {
        if (err) {
            console.error('Error writing JSON file:', err);
            res.status(500).json({ message: 'Error saving data.' });
        } else {
            res.json({ message: 'Data saved successfully.' });
        }
    });

    const entryDates = [];
    const exitDates = [];
    const timeSpent = [];

    submittedData.forEach(dataEntry => {
        const entryDate = new Date(dataEntry.entry);
        const exitDate = new Date(dataEntry.exit);

        // Calculate the difference in milliseconds between entry and exit
        const timeDifference = exitDate - entryDate;
        // Calculate the number of days
        const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

        entryDates.push(entryDate);
        exitDates.push(exitDate);
        timeSpent.push(daysDifference);
        // Perform processing logic here (e.g., database insertion)
        console.log('Processing:', entryDate, exitDate);
    });

    const dateDifferences = calculateTimeDifferences(entryDates, exitDates);
    const daysRemaining = nextEntry(dateDifferences, timeSpent, exitDates);
    console.log(dateDifferences);
    console.log(daysRemaining);

    

    console.log(entryDates);
    console.log(exitDates);
    console.log(timeSpent);
    
    const response = { message: daysRemaining };
    res.json(response);
});

function nextEntry(dateDifferences, timeSpent, exitDates){
    const greaterThan90 = dateDifferences.some(diff => diff > 90);

    if (greaterThan90) {
        console.log("Day counter is reset.");
    } else {
        const daysSpent = timeSpent.reduce((sum, currentValue) => sum + currentValue, 0);
        const daysRemaining = 90 - daysSpent;
        if(daysRemaining > 0){
            return(`${daysRemaining} day(s) remaining.`);
        } else if(daysRemaining < 0) {
            return(`You exceeded your stay. You spent ${daysSpent} days`);
        } else if(daysRemaining === 0){
            const lastExitDate = exitDates[exitDates.length - 1]; // Get the current date
            const nextEntryDate = new Date(lastExitDate); // Create a new Date object
            nextEntryDate.setDate(nextEntryDate.getDate() + 90); // Add 90 days
            
            return(`You have 0 days remaining. You can re-enter on ${nextEntryDate}`);
        }
    }
}

function calculateTimeDifferences(entryDates, exitDates) {
    const timeDifferences = [];

    let previousExitDate = null;

    for (let i = 0; i < entryDates.length; i++) {
        const entryDate = new Date(entryDates[i]);
        const exitDate = new Date(exitDates[i]);

        let daysDifference = null;

        if (previousExitDate) {
            // Calculate the difference in milliseconds between previous exit and current entry
            const timeDifference = entryDate - previousExitDate;
            daysDifference = timeDifference / (1000 * 60 * 60 * 24);
        }

        // Update previousExitDate with the current exitDate
        previousExitDate = exitDate;

        timeDifferences.push(daysDifference);
    }

    return timeDifferences;
}

app.listen(PORT, () => {
    console.log(`listening on http://localhost:${PORT}`);
});