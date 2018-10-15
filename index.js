/* eslint-disable  func-names */
/* eslint-disable  no-console */

'use strict';

const Alexa = require('ask-sdk');
const UmbracoHeadless = require('umbraco-headless');

var config = {
    url: "{{your headless url}}",
    username: "{{your headless username}}",
    password: "{{your headless username}}",
    imageBaseUrl: "https://domain.s1.umbraco.io"
};

const GetNewsHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'IntentRequest'
        && request.intent.name === 'NewsIntent');
      
  },
  async handle(handlerInput) {
	var headlessService = new UmbracoHeadless.HeadlessService(config);
    await headlessService.authenticate();
    
	var newsRoot = await headlessService.getById(1053);
	var newsList = await headlessService.getChildren(newsRoot)
  let speechOutput = '';
	for(var i=0;i<newsList.totalResults;i++)
	{
	    speechOutput += newsList.results[i].shortIntro;
	    speechOutput += '. ';
		
	}
	var site = await headlessService.getById(1056);
	const welcome= site.welcomeMessage;
	const menuPrompt = site.menuPrompt;
    const sessionAttributes = {};

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withSimpleCard(SKILL_NAME)
      .reprompt(menuPrompt)
      .getResponse();
  },
};
  
const GetMeetupsHandler= {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'IntentRequest'
        && request.intent.name === 'MeetupsIntent');
      
  },
  async handle(handlerInput) {
	var headlessService = new UmbracoHeadless.HeadlessService(config);

    //the client will implicitly authenticate if you don't do it manually
    await headlessService.authenticate();
	var meetupsRoot = await headlessService.getById(1059);
	var meetupsList = await headlessService.getChildren(meetupsRoot)
    let speechOutput = '';
	for(var i=0;i<meetupsList.totalResults;i++)
	{
	    speechOutput += meetupsList.results[i].name;
	    speechOutput += ' ';
	    speechOutput += meetupsList.results[i].description;
	    speechOutput += '. ';
		
	}
	var site = await headlessService.getById(1056);
	const welcome= site.welcomeMessage;
	const menuPrompt = site.menuPrompt;
    const sessionAttributes = {};

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withSimpleCard(SKILL_NAME)
      .reprompt(menuPrompt)
      .getResponse();
  },
};

const GetWelcomeHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest';  
  },
  async handle(handlerInput) {
	const headlessService = new UmbracoHeadless.HeadlessService(config);
    await headlessService.authenticate();
	var site = await headlessService.getById(1056);
	
	const welcome= site.welcomeMessage;
	const menuPrompt = site.menuPrompt;
    const sessionAttributes = {};
    const speechOutput = welcome + menuPrompt;

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withSimpleCard(SKILL_NAME)
      .reprompt(menuPrompt)
      .getResponse();
  },
};


const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, an error occurred.')
      .reprompt('Sorry, an error occurred.')
      .getResponse();
  },
};

const SKILL_NAME = 'CRL Umbraco Headless';
const STOP_MESSAGE = 'Goodbye!';
const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetWelcomeHandler,
    GetNewsHandler,
    GetMeetupsHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
