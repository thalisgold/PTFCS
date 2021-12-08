expect = require('chai').expect // import chai for assertion (after having installed it with npm install)

const got = require("got")
let port = 3000

describe ("Route testing", () => // define a suite of tests
{
    let urlHome = `http://localhost:${port}/home`

    it ("/home route: returns status 200", async () =>
    {
        const response = await got(urlHome);
        expect(response.statusCode).to.equal(200);

    })

    let urlEdit = `http://localhost:${port}/edit`

    it ("/edit route: returns status 200", async () =>
    {
        const response = await got(urlEdit);
        expect(response.statusCode).to.equal(200);
    })

    let urlValidFiles = `http://localhost:${port}/validFiles`

    it ("/edit route: returns status 200", async () =>
    {
        const response = await got(urlValidFiles);
        expect(response.statusCode).to.equal(200);
    })
})


describe ("Wikipedia API Testing", () => {

    // put lat/long of Münster (or another place)
    
    let wikiSightName = 'Domplatz_(Münster)'

    it ("API returns result", async() => {

        let dataurl = 'http://de.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=true&exsentences=3&explaintext=true&titles=' + wikiSightName + '&origin=*'
        let res = await got(dataurl)
        expect(res.statusMessage).to.equal("OK") 
    })
})