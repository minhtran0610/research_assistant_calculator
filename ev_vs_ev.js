// Effect of the environment on the trip
const ENVIRONMENT_EFFECT = {
    temperature: {
        '-20': 50,
        '-10': 60,
        0: 80,
        10: 100,
        20: 115,
        30: 105,
        40: 80,
    }
}

// Global variables to store the figures obtained from the database
let efficiency_1 = 0;
let efficiency_2 = 0;
let distance_1 = 0;
let distance_2 = 0;
let temperature_1 = 0;
let temperature_2 = 0;
let emissionFactor = 0;

// Main program
// Get the necessary elements to process the car data and process it
const inputMake_1 = document.getElementById("input_make_1");
const inputMake_2 = document.getElementById("input_make_2");
const inputModel_1 = document.getElementById("input_model_1");
const inputModel_2 = document.getElementById("input_model_2");
const carMakerOptions_1 = document.getElementById("car_make_options_1");
const carMakerOptions_2 = document.getElementById("car_make_options_2");
const carModelOptions_1 = document.getElementById("car_model_options_1");
const carModelOptions_2 = document.getElementById("car_model_options_2");
const efficiencyElement_1 = document.getElementById("efficiency_1")
const efficiencyElement_2 = document.getElementById("efficiency_2")

getEVInformation(inputMake_1, inputModel_1, carMakerOptions_1, carModelOptions_1, efficiencyElement_1);
getEVInformation(inputMake_2, inputModel_2, carMakerOptions_2, carModelOptions_2, efficiencyElement_2);

// Get the CO2 emission factor from Fingrid
const emissionFactorField = document.getElementById("emission_factor");
getEmissionFactor(emissionFactorField);



// Necessary functions
// Retrieve the car data
async function fetchEVData() {
    const url  = 'https://minhtran0610.github.io/data/ev_data.json';

    try {
        let response = await fetch(url);
        if (response.ok) {
            let jsonResponse = await response.json();
            return jsonResponse;
        }
    } catch (err) {
        console.log(err);
    }
}

// Using the input fields to process the car data
async function getEVInformation(inputMake, inputModel, carMakerOptions, carModelOptions, efficiencyElement) {
    // Fetch the data
    const carDatabase = await fetchEVData();

    // The events of the input fields
    // Create a datalist for the car maker input
    finishDatalist(carDatabase, 'brand', carMakerOptions);

    // When the car maker input is changed, process the next input field
    inputMake.onchange = () => {
        // Empty the next field
        emptyInputAndDatalist(inputModel, carModelOptions);
        inputModel.disabled = false;

        // Filter the database
        let make = inputMake.value;
        let carMakerFiltered = carDatabase.filter((car) => {
            return car.brand === make;
        })
        // Create a datalist for the car model input
        finishDatalist(carMakerFiltered, 'model', carModelOptions);
    }

    inputModel.onchange = () => {
        // Get the inputs and filter the database
        let make = inputMake.value;
        let model = inputModel.value;

        let EV = carDatabase.filter((car) => {
            return car.brand === make && car.model === model;
        })

        // Update the result to the GUI
        efficiencyElement.textContent = `${EV[0].efficiency} Wh/km`;
    }
}

// Create a list of options for an input field
function createOptions(optionsArray, datalistElement) {
    optionsArray.forEach((option) => {
        const myOption = document.createElement("option");
        myOption.value = option;
        datalistElement.appendChild(myOption);
    });
}

// Find the different values of a field in the data
function findDifferentValues(obj, field) {
    let results = [];
    obj.forEach((entry) => {
        if (!results.includes(entry[field])) {
            results.push(entry[field]);
        }
    });
    return results;
}

// Empty the input field and its options
function emptyInputAndDatalist(input, datalist) {
    datalist.innerHTML = "";
    input.value = "";
}

// Create datalist for an input field
function finishDatalist(obj, field, datalistElement) {
    let option = findDifferentValues(obj, field).sort();
    createOptions(option, datalistElement);
}

// Check which value is smaller and bold it
function checkSmallerValue(field_1, field_2, value_1, value_2) {
    value_1 = parseFloat(field_1.textContent);
    value_2 = parseFloat(field_2.textContent);

    if (value_1 < value_2) {
        value_1.style.fontWeight = 'bold';
    } else if (value_1 > value_2) {
        value_2.style.fontWeight = 'bold';
    }
}

// Retrieve the emission factor information from Fingrid
async function fetchFingridData() {
    const url = 'https://api.fingrid.fi/v1/variable/265/event/json';
    const header = {
        'x-api-key': '0F7Lvj4uQT9qjVQzs23SH57x0ynbM8AB8hrHpaWe',
    }

    try {
        let response = await fetch(url, {
            headers: header,
        });
        if (response.ok) {
            let jsonResponse = response.json();
            return jsonResponse;
        }
    } catch (err) {
        console.log(err);
    }
}

// Get the emission figure and update to the GUI
async function getEmissionFactor(emissionFactorField) {
    let response = await fetchFingridData();
    
    // Update to the GUI
    emissionFactorField.textContent =
        `The emission per 1kWh consumed, updated on ${response.start_time}`
        + `, is ${response.value} gCO2/kWh.`;

    emissionFactor = response.value;
}