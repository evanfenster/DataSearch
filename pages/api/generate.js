import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const category = req.body.category || '';
  const attributes = req.body.fields;
  const rows = req.body.numRows;
  if (category.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid category",
      }
    });
    return;
  }

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(category, attributes, rows),
      // 0 temperature returns the same result per prompt; looking for data and not variability
      temperature: 0,
      // 1k tokens is around 750 words; can adjust but affects pricing; 1k tokens ~ $0.02
      max_tokens: 1000,
    });
    res.status(200).json({ result: completion.data.choices[0].text });
  } catch(error) {
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}


function generatePrompt(category, attributes, rows) {
  //set the first line of the prompt with the num of rows and category
  var prompt = `A string of the top ${rows} ${category} and its `;
  // add in each of the attributes
  for (var i = 0; i < attributes.length - 1; i++) {
    const addition = "" + attributes[i] + ", ";
    prompt += addition;
  }
  //deal with the last attribute depending on if it was the only one or not
  if (attributes.length > 1) {
    prompt += "and " + attributes[attributes.length - 1] + "\n Format: \n";
  } else {
    prompt += attributes[attributes.length - 1] + "\n Format: \n";
  }

  // create the part of the prompt where we specify was format we want 
  var format = "" + category + ' \\ ';
  for (var i = 0; i < attributes.length - 1; i++) {
    const addition = "" + attributes[i] + ` \\ `;
    format += addition;
  }
  format += attributes[attributes.length - 1] + " | ";

  // add this format line to the end of the prompt
  prompt += format;

  // return our crafted prompt
  return prompt;
}
