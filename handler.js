'use strict';

import axios from 'axios';
import bot from './src/bot';
import botRepo from './src/bot-repo';

module.exports.process = (event, context, callback, http = axios, token = process.env.TELEGRAM_TOKEN, repo = botRepo) => {
  //console.log(`Received event ${JSON.stringify(event)}`);
  const apiURL = `https://api.telegram.org/bot${token}`;

  if (!token) { 
    console.error("TELEGRAM_TOKEN env var not set");
    return callback(null, { statusCode: 200, body: 'OK' });
  }
  
  const body = JSON.parse(event.body); //console.log(`body = ${JSON.stringify(body)}`);
  const message = body.message; console.log(`\n\n***** message: ${JSON.stringify(message)}\n\n`);
  if(!message) {
    console.error("bad request event");
    return callback(null, { statusCode: 200, body: 'OK' });
  }
  
  const chatId = `${message.chat.id}`; //convert to string

  const sendMessage = (message) => {
    const response = {
      chat_id : chatId,
      text : message,
      parse_mode : 'Markdown'
    }

    http.post(`${apiURL}/sendMessage`, response)
      .then((success) => callback(null, { statusCode: 200, body: 'OK' }))
      .catch((error) => {
        console.error(`error sending message: ${error}`);
        callback(null, { statusCode: 200, body: 'OK' });
      });
  };

  try {
    if(message.new_chat_member) {
      if(message.new_chat_member.username === "LifeGroup_Bot") {
        message.text = `/create ${message.chat.title}`;
      } else {
        callback(null, { statusCode: 200, body: 'OK' });
      }
    } 

    if(message.group_chat_created) {
      message.text = `/create ${message.chat.title}`;
    }

    if(!message.text) {
      callback(null, { statusCode: 200, body: 'OK' }); //event we don't care about
    }

    bot.handle({chatId : chatId, command : message.text, from : `${message.from.first_name} ${message.from.last_name}`}, repo)
      .then(response => sendMessage(response.message))
      .catch((error) => {
        console.error(`error occured interacting with bot ${JSON.stringify(error)}`);
        sendMessage(`There was an error processing your request.`);
      });
  } catch(err) {
    console.error(`an unexpected error occured ${err}`);
    callback(null, { statusCode: 200, body: 'OK' });
  }

};


