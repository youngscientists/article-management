const Router = require('../es6/Router.js');
const express = require("express")
const url = require("url")
const {
  removeEmpty
} = require("../es6/utils/Utils")
const {
  schedule
} = require("./Scheduler")
const AMS = require("../es6/AMS")

{
  const app = express()
  const port = process.env.PORT || 8000

  app.use(express.json())

  app.all("*", async (request, response) => {
    if (req.method === "OPTIONS") {
      return response.status(200).end();
    }

    const parts = url.parse(request.url, true)
    const router = new Router({
      path: parts.pathname,
      method: request.method,
      params: parts.query,
      body: request.body
    }, request.method)

    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    response.setHeader("Content-Type", "application/json")
    //router.route().then(data => response.send(JSON.stringify(data)))
    router.route().then(data => {
      response.send(JSON.stringify(removeEmpty(data)))
    })
    //response.send(JSON.stringify(await router.route()))
  })

  app.listen(port, () => console.log(`AMS v2 running on ${port}`))

  /**
   * Register tasks
   */
  schedule(() => {}, 1500)
}