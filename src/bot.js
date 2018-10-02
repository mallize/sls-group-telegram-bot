'use strict';

import botRepo from './bot-repo';

const commands = `
  /about - describes the bot and the requests it accepts\n
  /help - describes the bot and the requests it accepts\n
  /next - displays information about the next meeting\n
  /setStudy - sets the study topic
  /clearStudy - clear the group study topic\n
  /setNotes - sets group notes
  /clearNotes - clear the group notes\n
  /prayers - displays the prayer requests from the last meeting.
  /addPrayer - add a prayer to the prayer list\n    example: /addPrayer Matt's mom has been sick
  /removePrayer - remove a prayer from the prayer list\n    example: /removePrayer 1
  /clearPrayers - clears the prayer list\n
  /food - displays a list of food people have offered to bring
  /bringFood - offer to bring something\n    example: /bringFood pizza
  /removeFood - remove an item from the food list\n    example: /removeFood 2
  /clearFood - clear the food list
  `;

const generalMessage = `I am a bot designed by Matt Clement to help keep track of group meetings and activities.\n\nI support the following requests:\n${commands}`;

module.exports.handle = (request, repo = botRepo) => {
  return new Promise((resolve, reject) => {

    const argIndex = request.command.indexOf(" ");
    const command = (argIndex == -1) ? request.command : request.command.slice(0, argIndex); 
    const args = (argIndex == -1) ? undefined : request.command.slice(argIndex + 1, request.command.length); 
    
    const params = {chatId : request.chatId, repo : repo, resolve : resolve, reject : reject, args : args, from : request.from};

    switch (command.toLowerCase()) {
      case "/help": resolve({message : generalMessage}); break;

      case "/about": resolve({message : generalMessage}); break;

      case "/next": handleRequest(getNext, params); break;

      case "/create": handleRequest(create, params); break;

      case "/setmeeting" : handleRequest(setMeeting, params); break;

      case "/setstudy": handleRequest(setStudy, params); break;
      case "/clearstudy": handleRequest(clearStudy, params); break;  
      
      case "/setnotes": handleRequest(setNotes, params); break;
      case "/clearnotes": handleRequest(clearNotes, params); break; 

      case "/prayers": handleRequest(getPrayers, params); break;
      case "/addprayer": handleRequest(addPrayer, params); break;
      case "/removeprayer": handleRequest(removePrayer, params); break;
      case "/clearprayers": handleRequest(clearPrayers, params); break;
        
      case "/food": handleRequest(getFood, params); break;
      case "/bringfood": handleRequest(bringFood, params); break;
      case "/removefood": handleRequest(removeFood, params); break;
      case "/clearfood": handleRequest(clearFood, params); break; 

      default: resolve({message : 'I do not support the command you sent me.'}); break;

    }
  });
}

const handleRequest = (fn, params) => {
  const {chatId, repo, resolve, reject, args, from} = params;
  const promiseResult = args ? fn(chatId, args, repo, from) : fn(chatId, repo, from)

  promiseResult
    .then(msg => resolve({message : msg}))
    .catch(err => reject({error : err}));
}

const formatOptional = (value, text) => value ? `\n\n${text} ${value}` : '';

const getNext = (chatId, repo) => { return new Promise((resolve, reject) => {
  repo.getGroup(chatId)
    .then(group => resolve(`${getNextMeeting(group.meeting)}${formatOptional(group.study, "We will study")}.${formatOptional(group.notes, "Notes:")}`))
    .catch(error => reject(`Error retrieving the meeting for this chatId: ${chatId}: ${JSON.stringify(error)}`));
  });
}

const setStudy = (chatId, study, repo) => { return new Promise((resolve, reject) => {
  repo.getGroup(chatId)
    .then(group => {
      repo.update({chatId : chatId, study : study})
        .then(resolve('Study updated. Type /next to see the group meeting time, study and notes.'))
        .catch(reject(`Unable to update the study`));
    })
    .catch(error => reject(`Error updating the study for this chatId: ${chatId}: ${JSON.stringify(error)}`));
  });
}

const setNotes = (chatId, notes, repo) => { return new Promise((resolve, reject) => {
  repo.getGroup(chatId)
    .then(group => {
      repo.update({chatId : chatId, notes : notes})
        .then(resolve('Notes updated. Type /next to see the group meeting time, study and notes.'))
        .catch(reject(`Unable to update the study`));
    })
    .catch(error => reject(`Error updating the study for this chatId: ${chatId}: ${JSON.stringify(error)}`));
  });
}

const getPrayers = (chatId, repo) => { return new Promise((resolve, reject) => {
  repo.getGroup(chatId)
    .then(group => {
      const prayers = group.prayers;
      if(!Array.isArray(prayers) || !prayers.length) {
        resolve('There are currently no prayer reqeusts. Type /addPrayer followed by your request to add a prayer to the list.');
      } else {
        resolve(`*Current Prayer Requests*\n${group.prayers.map(prayer => `${prayer.id} - ${prayer.request}\n`).join('')}`);
      }
    })
    .catch(error => reject(`Error retrieving the prayers for this chatId: ${chatId}: ${JSON.stringify(error)}`));
  });
}

const create = (chatId, title, repo) => { return new Promise((resolve, reject) => {
  console.log(`creating group for id: ${chatId} title: ${title}`);

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

const addPrayer = (chatId, prayer, repo) => { return new Promise((resolve, reject) => {
  repo.getGroup(chatId)
    .then(group => {
      group.prayers.push({id : getNextId(group.prayers), request : prayer});
      repo.update({chatId : chatId, prayers : group.prayers})
        .then(resolve('Prayer added. Type /prayers to see the full list.'))
        .catch(reject(`Unable to add prayer to list`));
    })
    .catch(error => reject(`Error adding prayers for this chatId: ${chatId}: ${JSON.stringify(error)}`));
  });
}

const removePrayer = (chatId, prayerId, repo) => { return new Promise((resolve, reject) => {
  repo.getGroup(chatId)
    .then(group => {
      const newList = removeFromList(group.prayers, parseInt(prayerId, 10));

      repo.update({chatId : chatId, prayers : newList})
        .then(resolve('Prayer removed. Type /prayers to see the full list.'))
        .catch(reject(`Unable to remove prayer to list`));
    })
    .catch(error => reject(`Error removing prayers for this chatId: ${chatId}: ${JSON.stringify(error)}`));
  });
}

const removeFromList = (list, listId) => {
  let seq = 1;
  return list
    .filter(item => item.id != listId)
    .map(item => { return { ...item, id : seq++ } });
}

const getNextId = (list) => {
  if(!Array.isArray(list) || !list.length) {
    return 1;
  } else {
    const ids = list.map(x => x.id);
    return Math.max( ...ids ) + 1;
  }
}

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

const bringFood = (chatId, food, repo, from) => { return new Promise((resolve, reject) => {
  repo.getGroup(chatId)
    .then(group => {
      const newFood = {id : getNextId(group.food), item : food, name : from};
      console.log(`*** food added ***\n ${JSON.stringify(newFood)}`);
      group.food.push(newFood);
      repo.update({chatId : chatId, food : group.food})
        .then(resolve('Food added. Type /food to see the full list.'))
        .catch(reject(`Unable to add food to list`));
    })
    .catch(error => reject(`Error adding food for this chatId: ${chatId}: ${JSON.stringify(error)}`));
  });
}

const removeFood = (chatId, foodId, repo) => { return new Promise((resolve, reject) => {
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

const setMeeting = (chatId, meeting, repo) => { return new Promise((resolve, reject) => {
  const splitCommand = meeting.split(" ");
  const weekDay = splitCommand[0];
  const time = splitCommand[1];
  const day = days.indexOf(weekDay);

  repo.getGroup(chatId)
    .then(group => {
      repo.update({chatId : chatId, meeting : {day : day, time : time}})
        .then(resolve('Meeting set. Type /next to see the group meeting time, study and notes.'))
        .catch(reject(`Unable to set meeting`));
    })
    .catch(error => reject(`Error setting the meeting for this chatId: ${chatId}: ${JSON.stringify(error)}`));
  });
}

const getNextMeeting = (meeting) => {
  if(!meeting) { return "No meeting time set."; }

  const { day, time } = meeting;
  const date = new Date();
  const resultDate = new Date(date.getTime());

  resultDate.setDate(date.getDate() + (7 + day - date.getDay()) % 7);

  return `Our next meeting is ${days[day]} ${resultDate.getMonth() + 1}-${resultDate.getDate()}-${resultDate.getFullYear()}, ${time}`;
}







