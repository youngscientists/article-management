import Authentication from './Authentication';
import AMS from './AMS';
import Utils from './Utils';
import SheetUtils from './SheetUtils';

/**
 * This class will be used to route requests to the appropriate function,
 * then allowing either a result or a promise to be returned.
 * 
 * Actions that require authorisation will be checked against
 * the main auth db.
 * 
 * @param {request} e
 * @param {String} type is the request a Get or Post
 */
export class Router {
    constructor(e, type) {
        this.type = type;

        this.setOptions(e)

        // Instantiate the interface
        this.ams = new AMS()
    }

    get allowedRoutes() {
        return {
          "GET": {
            "articles": {
              "list" : AMS.getAllArticles()
            },
            "article": ["info"],
            "authentication": {
                "authenticate" : this.authenticate()
            }
          },
          "POST": {
            "article": {
                "create": AMS.createArticle(), 
                "update": AMS.updateArticle(), 
                "delete": AMS.deleteArticle()
            },
            "editor": {
                "create": AMS.createEditor(), 
                "update": AMS.updateEditor()
            }
          }
        }
      }

    /**
     * Applies the parameter options to the router.
     * 
     * @param {Object} e the request
     * @param {Object} e.parameter request parameters
     * @param {String} e.parameter.email a supplied email
     * @param {String} e.parameter.authToken a supplied authToken
     * @param {String} e.parameter.path alternative to supplying an actual path to the API.
     *                                  if there is no real path specified this will be used 
     */
    setOptions(e) {
        if (!e.parameter)
            return

        this.email = e.parameter.email
        this.key = e.parameter.key
        this.authToken = e.parameter.authToken

        let pathInfo = Utils.get(['pathInfo'], e)
        if (pathInfo)
            this.paths = pathInfo.split('/')
        else if (e.parameter.path) {
            this.paths = e.parameter.path.split('/')
        } else {
            return new Error('No path supplied @ setOptions')
        }
    }

    /**
     * @returns the first level of the two level API
     */
    get context() {
        return this.paths[0];
    }

    /**
     * @returns the second level of the API
     */
    get action() {
        return this.paths[1];
    }


    route() {
        if (!this.paths)
            return {}

        const context = this.context
        const action = this.action
        const type = this.type

        // Check context is valid
        let selectedContext = Utils.get([type, context], this.allowedRoutes)
        if (!selectedContext)
            throw new Error("No such context exists.")
        else if (!(selectedContext instanceof Object))
            throw new Error("Conext exists but has no actions")
        else if (!selectedContext[action])
            throw new Error(`No such action ${action} exists for context ${context}`)

        if (context == "authentication") {
            return this.authenticate()
        } else if (this.authenticate() !== true) {
            return "unauth"
        }

        // AUTHENTICATED TRACKS
        return this.allowedRoutes[type][context][action]
    }

    /**
     * Checks whet
     * @returns an authentication object
     */
    authenticate() {
        let auth = new Authentication({
            email: this.email,
            key: this.key,
            authToken: this.authToken
        })

        return auth.authenticate()
    }
}

