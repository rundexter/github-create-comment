var GitHubApi = require("github");
var _ = require('lodash');

var pickResultData = [
    'html_url',
    'id',
    'body',
    'path',
    'position',
    'line',
    'commit_id',
    'user.login',
    'created_at'
];

module.exports = {
    /**
     * Pick API result.
     *
     * @param events
     * @returns {Array}
     */
    pickResultData: function (comment) {
        var result = [];

        pickResultData.forEach(function (dataKey) {
            if (!_.isUndefined(_.get(comment, dataKey, undefined))) {

                _.set(result, dataKey, _.get(comment, dataKey));
            }
        });

        return result;
    },

    /**
     * Authenticate gitHub user.
     *
     * @param dexter
     * @param github
     */
    gitHubAuthenticate: function (dexter, github) {

        if (dexter.environment('GitHubUserName') && dexter.environment('GitHubPassword')) {

            github.authenticate({
                type: dexter.environment('GitHubType') || "basic",
                username: dexter.environment('GitHubUserName'),
                password: dexter.environment('GitHubPassword')
            });
        } else {
            this.fail('A GitHubUserName and GitHubPassword environment variable is required for this module');
        }
    },

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {

        var github = new GitHubApi({
            // required 
            version: "3.0.0"
        });

        this.gitHubAuthenticate(dexter, github);

        if (
            step.input('body', undefined).first() !== undefined &&
            step.input('path', undefined).first() !== undefined &&
            step.input('position', undefined).first() !== undefined &&
            step.input('line', undefined).first() !== undefined &&
            step.input('owner', undefined).first() !== undefined &&
            step.input('repo', undefined).first() !== undefined &&
            step.input('sha', undefined).first() !== undefined
        ) {
            var commentParams = {
                user: step.input('owner').first(),
                repo: step.input('repo').first(),
                body: step.input('body').first(),
                path: step.input('path').first(),
                position: step.input('position').first(),
                number: step.input('line').first(),
                commit_id: step.input('sha').first()
            };

            github.pullRequests.createComment(commentParams, function (err, comment) {

               err? this.fail(err) : this.complete(this.pickResultData(comment));
            }.bind(this));

        } else {

            this.fail('All inputs variable is required for this module');
        }
    }
};
