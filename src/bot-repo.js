'use strict';
import AWS from 'aws-sdk';
import {DynamoDBUpdateObject} from './dynamodb-util';

let dynamoDb;
if (process.env.IS_OFFLINE === 'true') {
    dynamoDb = new AWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000',
        accessKeyId: 'accessKeyId', // for tests
        secretAccessKey: 'secretAccessKey' // for tests
    });
} else {
    dynamoDb = new AWS.DynamoDB.DocumentClient();
}

module.exports.getGroup = (chatId) => {
    const params = {
        TableName: process.env.GROUP_TABLE,
        Key: {
            chatId : chatId
        }
    };

    return new Promise((resolve, reject) => {
        dynamoDb.get(params, (error, result) => {
            (error)
                ? reject({error: `${error}`})
                : resolve(result.Item);
        });
    });
}

module.exports.update = (group) => {
    return new Promise((resolve, reject) => {

        const updatedGroup = DynamoDBUpdateObject(group);

        console.log(`Updated Group update object = ${JSON.stringify(updatedGroup)}`);

        const params = {
            TableName: process.env.GROUP_TABLE,
            ...updatedGroup,
            ReturnValues: 'ALL_NEW',
        };

        dynamoDb.update(params, (error, result) => {
            (error)
                ? reject({error: `${error}`})
                : resolve(result.Attributes);
        });
    });
};

module.exports.create = (group) => {
    const params = {
        TableName: process.env.GROUP_TABLE,
        Item: {...group}
    };

    return new Promise((resolve, reject) => {
        dynamoDb.put(params, (error, result) => {
            (error)
                ? reject({error: `${error}`})
                : resolve(params.Item);
        });
    });
};

// module.exports.delete = (chatId) => {
//     const params = {
//         TableName: process.env.GROUP_TABLE,
//         Key: {
//             id: chatId
//         }
//     };

//     return new Promise((resolve, reject) => {
//         dynamoDb.delete(params, (error, result) => {
//             (error)
//                 ? reject({error: `${error}`})
//                 : resolve(params.Item);
//         });
//     });
// };


