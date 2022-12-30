import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";

var FileSaver = require('file-saver');

export default function Home() {

  const [categoryInput, setcategoryInput] = useState("");
  const [result, setResult] = useState();
  var cleanedResult = "";

  async function onSubmit(event) {
    event.preventDefault();
    try {
      // get some of the input values from the form 
      const inputElements = document.querySelectorAll('#att');
      const columns = Array.from(inputElements).map(inputElement => inputElement.value);
      const rows = document.getElementById("rows").value;

      // create the API request from OpenAI
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category: categoryInput, fields: columns, numRows: rows,}),
      });

      // await the response and handle errors
      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      // update our result and categoryInput variables
      setResult(data.result);
      setcategoryInput("");

      // reset the attribute input fields and previous data
      inputElements[0].value = "";
      for (var j = 1; j < inputElements.length; j++) {
        inputElements[j].remove();
      }

      const prevCsvBtn = document.getElementById("csvBtn");
      if (prevCsvBtn) {
        prevCsvBtn.remove();
      }

      const prevGrid = document.getElementById("grid");
      prevGrid.innerHTML = "";

      // add code to put the data into arrays 
      // create the headers based off the user inputs
      // make the headers lowercase (and capitalize the first character)
      var headers = "" + categoryInput.charAt(0).toUpperCase() + categoryInput.slice(1).toLowerCase();;
      for (var i = 0; i < columns.length; i++) {
        var next = "" + columns[i];
        const addition = " \\ " +  next.charAt(0).toUpperCase() + next.slice(1).toLowerCase();
        headers += addition;
      }
      headers += " | ";

      // parse into an array of arrays
      const replacedResult = data.result.replaceAll(',', ";");
      const results = headers.concat(replacedResult);
      const totalResults = results.split('|');
      totalResults[1] = totalResults[1].replace("\n", "");
      
      const subResults = totalResults.map(element => element.split('\\'));

      // set as the result 
      cleanedResult = subResults;

      // create the grid preview to be displayed on-screen
      const grid = document.getElementById('grid');

      for (const row of subResults) {
        const tr = document.createElement('tr');
        for (const col of row) {
          const td = document.createElement('td');
          td.textContent = col;
          tr.appendChild(td);
        }
        grid.appendChild(tr);
      }

      // create the button that allows the user to download as a CSV
      const csvBtn = document.createElement('button');
      csvBtn.textContent = 'Download CSV';
      csvBtn.setAttribute("id", "csvBtn");
      const main = document.getElementById("main");
      main.appendChild(csvBtn);

      // add an event listener 
      csvBtn.addEventListener('click', downloadCSV);

    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <div>
      <Head>
        <title>DataSearch</title>
        <link rel="icon" href="/data-icon.png" />
      </Head>

      <main className={styles.main} id="main">
        <img src="/data-icon.png" className={styles.icon} />
        <h3>DataSearch</h3>
        <form onSubmit={onSubmit} id="inputForm">
          <input
            type="text"
            name="category"
            placeholder="Enter a category"
            value={categoryInput}
            onChange={(e) => setcategoryInput(e.target.value)}
          />
          <input
            type="number"
            name="rows"
            placeholder="Number of desired rows"
            id="rows"
          />
          <input
            type="text"
            name="attribute"
            placeholder="Enter an attribute for this category"
            id="att"
          />
          <button id="addAttributeBtn" type="button" onClick={addInputField}>Add another attribute</button>
          <input type="submit" value="Search" />
        </form>
        <table id="grid">
        </table>
      </main>
    </div>
  );

  // add an extra attribute field
  function addInputField() {
    // Create a new input field
    var inputField = document.createElement("input");
    inputField.type = "text";
    inputField.name = "attribute"; // or some other name
    inputField.placeholder = "Enter an attribute for this category"; // optional
    inputField.id = "att";
  
    // Add the input field to the form
    var form = document.getElementById("inputForm");
    var attBtn = document.getElementById("addAttributeBtn");
    form.insertBefore(inputField, attBtn);
  }

  // download the results as a CSV
  function downloadCSV() {
    // Create a CSV string
    var blob = new Blob(cleanedResult, {type: "text/plain;charset=utf-8"});
    FileSaver.saveAs(blob, "results.csv");
  }


}
