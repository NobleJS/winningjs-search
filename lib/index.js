"use strict";
/*global Windows */

var makeEmitter = require("pubit-as-promised").makeEmitter;

var searchEvents = ["query", "suggestionsRequested", "resultSuggestionChosen"];

module.exports = function SearchPlugin() {
    var that = this;

    var publish = makeEmitter(that, searchEvents);
    var searchPane = Windows.ApplicationModel.Search.SearchPane.getForCurrentView();

    that.handleKind = function (args) {
        var queryText = args.detail.queryText;
        publish("query", queryText);
    };

    // http://msdn.microsoft.com/en-us/library/windows/apps/windows.applicationmodel.search.searchpane
    searchPane.addEventListener("suggestionsrequested", function (eventObject) {
        var deferral = eventObject.request.getDeferral();
        var queryText = eventObject.queryText.toLowerCase();
        var suggestionService = eventObject.request.searchSuggestionCollection;
        publish.when("suggestionsRequested", {
            language: eventObject.language,
            queryText: queryText,
            suggestionService: suggestionService
        }).done(deferral.complete.bind(deferral));
    });

    searchPane.addEventListener("resultsuggestionchosen", function (eventObject) {
        publish("resultSuggestionChosen", {
            tag: eventObject.tag,
            queryText: eventObject.target.queryText
        });
    });

};
