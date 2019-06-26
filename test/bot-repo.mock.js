'use strict';

import group from './resources/group.json';

module.exports.getGroup = (chatId) => {
    return new Promise((resolve, reject) => {
        resolve(group);
    });
}

module.exports.update = (group) => {
    return new Promise((resolve, reject) => {
        resolve("");
    });
}

module.exports.create = (group) => {
    return new Promise((resolve, reject) => {
        resolve("");
    });
}