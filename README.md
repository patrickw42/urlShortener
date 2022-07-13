# urlShortener2
Any valid URL entered into the form will be saved to new record in MongoDB as full_url, along with short_url (id generated).

Post from form responds with json object containing url entered in form as original_url property, and id generated as short_url property.
           
Get requests to '/api/shorturl/<short_url>' will redirect to website addressed at full_url matching short_url in the database.

Will need Node.js installed, and inside root directory of project will need to install modules used in program by running commands:

npm i mongoose                   

npm i express

npm i body-parser

npm i dotenv


Will need to update MONGO_URI in the .env file to match a valid deployed mongo cluster.


To run program open a terminal from the root directory of project and run: 'node index.js'

Open up web browser and enter:
'localhost:3000'

HTML and CSS provided by freecodecamp.org

