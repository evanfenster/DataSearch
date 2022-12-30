import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";

var FileSaver = require('file-saver');

export default function Home() {

  const [categoryInput, setcategoryInput] = useState("");
  const [result, setResult] = useState();

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const inputElements = document.querySelectorAll('#att');
      const columns = Array.from(inputElements).map(inputElement => inputElement.value);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category: categoryInput, fields: columns, }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(data.result);
      setcategoryInput("");

      // add code to put the data into arrays 
      console.log("Results: \n" + result);
      var headers = "" + categoryInput;
      for (var i = 0; i < columns.length; i++) {
        const addition = " \\ " +  columns[i];
        headers += addition;
      }
      headers += " | ";

      const replacedHeaders = headers.replaceAll(',', ";");
      const replacedResult = data.result.replaceAll(',', ";");
      const results = replacedHeaders.concat(replacedResult);
      const totalResults = results.split('|');
      totalResults[1] = totalResults[1].replace("\n", "");
      console.log("Total Results: \n" + totalResults);
      
      const subResults = totalResults.map(element => element.split('\\'));

      console.log(subResults);

      // Create a CSV string
      var blob = new Blob(subResults, {type: "text/plain;charset=utf-8"});
      FileSaver.saveAs(blob, "results.csv");

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

      <main className={styles.main}>
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
            type="text"
            name="attribute"
            placeholder="Enter an attribute for this category"
            id="att"
          />
          <button id="addAttributeBtn" type="button" onClick={addInputField}>Add another attribute</button>
          <input type="submit" value="Search" />
        </form>
        <div className={styles.result}>{result}</div>
      </main>
    </div>
  );

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


}
