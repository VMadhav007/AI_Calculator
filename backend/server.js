const bodyParser = require("body-parser");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config(); // Load environment variables from .env

const app = express();
const port = 5000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI("your_gemini_api_key"); // Replace with your actual API key
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro" });

app.post("/upload", async (req, res) => {
  const { image } = req.body;

  try {
    const base64Image = image.split(",")[1]; // Remove the data URL prefix

    const prompt = `
      You have been given an image with some mathematical expressions, equations, or graphical problems, and you need to solve them.
      Note: Use the PEMDAS rule for solving mathematical expressions. PEMDAS stands for the Priority Order: Parentheses, Exponents, Multiplication and Division (from left to right), Addition and Subtraction (from left to right).
      
      For example:
      Q. 2 + 3 * 4
      (3 * 4) => 12, 2 + 12 = 14.
      Q. 2 + 3 + 5 * 4 - 8 / 2
      5 * 4 => 20, 8 / 2 => 4, 2 + 3 => 5, 5 + 20 => 25, 25 - 4 => 21.

      YOU CAN HAVE FIVE TYPES OF EQUATIONS/EXPRESSIONS IN THIS IMAGE, AND ONLY ONE CASE SHALL APPLY EVERY TIME:

      Following are the cases:
      1. Simple mathematical expressions like 2 + 2, 3 * 4, 5 / 6, 7 - 8, etc.: In this case, solve and return the answer in the format of a LIST OF ONE DICT [{"expr": given expression, "result": calculated answer}].
      2. Set of Equations like x^2 + 2x + 1 = 0, 3y + 4x = 0, 5x^2 + 6y + 7 = 12, etc.: In this case, solve for the given variable, and the format should be a COMMA SEPARATED LIST OF DICTS, with dict 1 as {"expr": "x", "result": 2, "assign": true} and dict 2 as {"expr": "y", "result": 5, "assign": true}. This example assumes x was calculated as 2, and y as 5. Include as many dicts as there are variables.
      3. Assigning values to variables like x = 4, y = 5, z = 6, etc.: In this case, assign values to variables and return another key in the dict called {"assign": true}, keeping the variable as "expr" and the value as "result" in the original dictionary. RETURN AS A LIST OF DICTS.
      4. Analyzing Graphical Math problems, which are word problems represented in drawing form, such as cars colliding, trigonometric problems, problems on the Pythagorean theorem, adding runs from a cricket wagon wheel, etc. These will have a drawing representing some scenario and accompanying information with the image. PAY CLOSE ATTENTION TO DIFFERENT COLORS FOR THESE PROBLEMS. You need to return the answer in the format of a LIST OF ONE DICT [{"expr": given expression, "result": calculated answer}].
      5. Detecting Abstract Concepts that a drawing might show, such as love, hate, jealousy, patriotism, or a historic reference to war, invention, discovery, quote, etc. USE THE SAME FORMAT AS OTHERS TO RETURN THE ANSWER, where "expr" will be the explanation of the drawing, and "result" will be the abstract concept.

      Analyze the equation or expression in this image and return the answer according to the given rules.
      
      Make sure to use extra backslashes for escape characters like \\f -> \\\\f, \\n -> \\\\n, etc.
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/png", // Change based on image type (jpeg, png, etc.)
        },
      },
      prompt,
    ]);

    // Ensure the response is valid JSON
    const responseText = result.response.text();
    const validJsonResponse = responseText.replace(/"assign": True/g, '"assign": true'); // Replace True with true
    const answerArray = JSON.parse(validJsonResponse);

    res.json({ description: answerArray });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to process image" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});