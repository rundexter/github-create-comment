var _ = require('lodash'),
    util = require('./util.js'),
    GitHubApi = require("github"),
    github = new GitHubApi({ version: '3.0.0' });

var pickInputs = {
        'user': 'owner',
        'repo': 'repo',
        'body': 'body',
        'path': 'path',
        'position': 'position',
        'number': 'line',
        'commit_id': 'sha'
    },
    pickOutputs = {
        'html_url': 'html_url',
        'id': 'id',
        'body': 'body',
        'path': 'path',
        'position': 'position',
        'line': 'line',
        'commit_id': 'commit_id',
        'user_login': 'user.login',
        'created_at': 'created_at'
    };

module.exports = {
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var credentials = dexter.provider('github').credentials(),
            inputs = util.pickInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs);
        // check params.
        if (validateErrors)
            return this.fail(validateErrors);

        github.authenticate({
            type: 'oauth',
            token: credentials.token
        });

        github.pullRequests.createComment(inputs, function (err, comment) {

           err? this.fail(err) : this.complete(util.pickOutputs(comment, pickOutputs));
        }.bind(this));

    }
};
