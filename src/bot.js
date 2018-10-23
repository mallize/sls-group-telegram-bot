'use strict';

import botRepo from './bot-repo';

module.exports.handle = (request, repo = botRepo) => {
  return new Promise((resolve, reject) => {

    const {commandItem, args} = findCommandItem(request.command);

    if(commandItem) {
      commandItem.fn(request.chatId, repo, args, request.from)
        .then(msg => resolve({message : msg}))
        .catch(err => reject({error : err}));
    } else {
      resolve({message : 'I do not support the request you sent me.'});
    }

  });
}

const findCommandItem = (request, stop = false) => {
  const argIndex = request.indexOf(" ");
  const command = (argIndex == -1) ? request : request.slice(0, argIndex); 
  const args = (argIndex == -1) ? undefined : request.slice(argIndex + 1, request.length);

  const commandItem = commands.find(cmd => cmd.command === command.toLowerCase());
  return (commandItem) 
    ? {commandItem: commandItem, args: args}
    : stop ? undefined : findCommandItem(request.replace(' ', ''), true); //check for auto correct version (i.e. /set meeting)
}

const formatOptional = (value, text) => value ? `\n\n${text} ${value}` : '';

const getNext = (chatId, repo) => { return new Promise((resolve, reject) => {
  repo.getGroup(chatId)
    .then(group => resolve(`${getNextMeeting(group.meeting)}${formatOptional(group.study, "We will study")}${formatOptional(group.notes, "Notes:")}`))
    .catch(error => reject(`Error retrieving the meeting for this chatId: ${chatId}: ${JSON.stringify(error)}`));
  });
}

const getHelp = () => Promise.resolve(generalMessage);

const setStudy = (chatId, repo, study) => { return new Promise((resolve, reject) => {
  repo.update({chatId : chatId, study : study})
    .then(resolve('Study updated. Type /next to see the group meeting time, study and notes.'))
    .catch(error => reject(`Error updating the study for this chatId: ${chatId}: ${JSON.stringify(error)}`));
  });
}

const setNotes = (chatId, repo, notes) => { return new Promise((resolve, reject) => {
    repo.update({chatId : chatId, notes : notes})
      .then(resolve('Notes updated. Type /next to see the group meeting time, study and notes.'))
      .catch(error => reject(`Error updating the study for this chatId: ${chatId}: ${JSON.stringify(error)}`));    
  });
}

const create = (chatId, repo, title) => { return new Promise((resolve, reject) => {
  repo.create({chatId : chatId, title: title})
    .then(resolve('Group created. Type /help to see a list of commands I support.'))
    .catch(reject(`Unable to create a group for this group chat`));
  });
}

const clearPrayers = (chatId, repo) => { return new Promise((resolve, reject) => {
  repo.update({chatId : chatId, prayers : []})
    .then(resolve('Prayer list cleared.'))
    .catch(reject(`Unable to clear prayer list`));
  });
}

const clearNotes = (chatId, repo) => { return new Promise((resolve, reject) => {
  repo.update({chatId : chatId, notes : null})
    .then(resolve('Notes cleared.'))
    .catch(reject(`Unable to clear notes`));
  });
}

const clearStudy = (chatId, repo) => { return new Promise((resolve, reject) => {
  repo.update({chatId : chatId, study : null})
    .then(resolve('Study cleared.'))
    .catch(reject(`Unable to clear study`));
  });
}

const formatPrayers = (prayers) => `*Current Prayer Requests*\n${prayers.map(prayer => `${prayer.id} - ${prayer.request}\n`).join('')}`;

const getPrayers = (chatId, repo) => { return new Promise((resolve, reject) => {
  repo.getGroup(chatId)
    .then(group => {
      const prayers = group.prayers;
      if(!Array.isArray(prayers) || !prayers.length) {
        resolve('There are currently no prayer reqeusts. Type /addPrayer followed by your request to add a prayer to the list.');
      } else {
        resolve(formatPrayers(prayers));
      }
    })
    .catch(error => reject(`Error retrieving the prayers for this chatId: ${chatId}: ${JSON.stringify(error)}`));
  });
}

const addPrayer = (chatId, repo, prayer, from) => { return new Promise((resolve, reject) => {
  repo.getGroup(chatId)
    .then(group => {
      if(!group.prayers) { group.prayers = []; }
      group.prayers.push({id : getNextId(group.prayers), request : `${prayer} - requested by ${from}`});
      repo.update({chatId : chatId, prayers : group.prayers})
        .then(resolve('Prayer added. Type /prayers to see the full list.'))
        .catch(reject(`Unable to add prayer to list`));
    })
    .catch(error => reject(`Error adding prayers for this chatId: ${chatId}: ${JSON.stringify(error)}`));
  });
}

const removePrayer = (chatId, repo, prayerId) => { return new Promise((resolve, reject) => {
  repo.getGroup(chatId)
    .then(group => {
      const newList = removeFromList(group.prayers, parseInt(prayerId, 10));

      repo.update({chatId : chatId, prayers : newList})
        .then(resolve(`*Prayer removed. ${formatPrayers(newList)}`))
        .catch(reject(`Unable to remove prayer to list`));
    })
    .catch(error => reject(`Error removing prayers for this chatId: ${chatId}: ${JSON.stringify(error)}`));
  });
}

const removeFromList = (list, listId) => {
  return list
    .filter(item => item.id != listId)
    .map((item, index) => ({ ...item, id : index + 1 }));
}

const isEmptyArray = (list) => (!Array.isArray(list) || !list.length);

const nextId = (list) => {
  const ids = list.map(x => x.id);
  return Math.max( ...ids ) + 1;
}

const getNextId = (list) => isEmptyArray(list) ? 1 : nextId(list);

const getFood = (chatId, repo) => { return new Promise((resolve, reject) => {
  repo.getGroup(chatId)
    .then(group => {
      const food = group.food;
      if(!Array.isArray(food) || !food.length) {
        resolve('No one has offered to bring food. Type /bringFood to offer to bring something. (Example: /bringFood Pizza)');
      } else {
        resolve(group.food.map(entry => `${entry.id} - ${entry.name} offered to bring ${entry.item}\n`).join(''));
      }
    })
    .catch(error => reject(`Error retrieving the food for this chatId: ${chatId}: ${JSON.stringify(error)}`));
  });
}

const bringFood = (chatId, repo, food, from) => { return new Promise((resolve, reject) => {
  repo.getGroup(chatId)
    .then(group => {
      if(!group.food) { group.food = []; }
      group.food.push({id : getNextId(group.food), item : food, name : from});
      
      repo.update({chatId : chatId, food : group.food})
        .then(resolve('Food added. Type /food to see the full list.'))
        .catch(reject(`Unable to add food to list`));
    })
    .catch(error => reject(`Error adding food for this chatId: ${chatId}: ${JSON.stringify(error)}`));
  });
}

const removeFood = (chatId, repo, foodId) => { return new Promise((resolve, reject) => {
  repo.getGroup(chatId)
    .then(group => {
      const newList = removeFromList(group.food, parseInt(foodId, 10));

      repo.update({chatId : chatId, food : newList})
        .then(resolve('Food removed. Type /food to see the full list.'))
        .catch(reject(`Unable to remove food to list`));
    })
    .catch(error => reject(`Error removing food for this chatId: ${chatId}: ${JSON.stringify(error)}`));
  });
}

const clearFood = (chatId, repo) => { return new Promise((resolve, reject) => {
  repo.update({chatId : chatId, food : []})
      .then(resolve('Food list cleared.'))
      .catch(reject(`Unable to clear food list`));
  });
}

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const setMeeting = (chatId, repo, meeting) => { return new Promise((resolve, reject) => {
  const splitCommand = meeting.split(" ");
  const weekDay = splitCommand[0];
  const time = splitCommand[1];
  const day = days.indexOf(weekDay);

  repo.update({chatId : chatId, meeting : {day : day, time : time}})
    .then(resolve('Meeting set. Type /next to see the group meeting time, study and notes.'))
    .catch(error => reject(`Error setting the meeting for this chatId: ${chatId}: ${JSON.stringify(error)}`));
  });
}

const getNextMeeting = (meeting) => {
  if(!meeting) { return "No meeting time set, use /setmeeting to set. example: /setMeeting Monday 6 p.m."; }

  const { day, time } = meeting;
  const date = new Date();
  const resultDate = new Date(date.getTime());

  resultDate.setDate(date.getDate() + (7 + day - date.getDay()) % 7);

  return `Our next meeting is ${days[day]} ${resultDate.getMonth() + 1}-${resultDate.getDate()}-${resultDate.getFullYear()}, ${time}`;
}

const commands = [
  {command : '/about', fn : getHelp, description : 'describes this bot and the requests it accepts'},
  {command : '/help', fn : getHelp, description : 'describes this bot and the requests it accepts'},
  {command : '/next', fn : getNext, description : 'displays information about the next meeting'},
  {command : '/setstudy', fn : setStudy, description : 'sets the study topic', usage : '/setStudy Romans 13'},
  {command : '/setmeeting', fn : setMeeting, description : 'sets the meeting.', usage : '/setMeeting Monday 6:30 p.m.'},
  {command : '/clearstudy', fn : clearStudy, description : 'clear the study topic'},
  {command : '/setnotes', fn : setNotes, description : 'sets group notes', usage : '/setNotes Remember to bring $5 for your book'},
  {command : '/clearnotes', fn : clearNotes, description : 'clear the group notes'},
  {command : '/prayers', fn : getPrayers, description : 'displays current prayer requests'},
  {command : '/addprayer', fn : addPrayer, description : 'add a prayer to the prayer list', usage : '/addPrayer Matt is having back surgery'},
  {command : '/removeprayer', fn : removePrayer, description : 'removes a prayer from the prayer list', usage : '/removePrayer 3'},
  {command : '/clearprayers', fn : clearPrayers, description : 'removes all prayers from the prayer list'},
  {command : '/food', fn : getFood, description : 'displays list of food people have offered to bring'},
  {command : '/bringfood', fn : bringFood, description : 'offer to bring food to the next group meeting', usage : '/bringFood pizza'},
  {command : '/removefood', fn : removeFood, description : 'removes an item from the food list', usage : '/removeFood 3'},
  {command : '/clearfood', fn : clearFood, description : 'removes all items from the food list'},
  {command : '/create', fn : create, description : 'sets up a new group'}
];

const getCommands = () => {
  return commands.map(cmd => ` ${cmd.command} - ${cmd.description}\n${(cmd.usage) ? '    example: ' + cmd.usage + '\n' : ''}`).join('');
}

const generalMessage = `I am a bot designed by Matt Clement to help keep track of group meetings and activities.\n\nI support the following requests:\n${getCommands()}`;








