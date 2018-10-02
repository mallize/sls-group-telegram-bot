export const DynamoDBUpdateObject = (state) => {
    const names = createExpressionAttributeNames(state);
    const values = createExpressionAttributeValues(state);

    return {
        Key: createKey(state.chatId),
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        UpdateExpression: `SET ${createUpdateExpression(names, values)}`
    };
};

const toOneObject = (result, item) => {
    const key = Object.keys(item)[0];
    result[key] = item[key];
    return result;
};

const expressionAttributeNamesExp = ([key, value]) => ({[`#${key}`]: key});
const expressionAttributeValuesExp = ([key, value]) => ({[`:${key}`]: value});
const filterOutKey = ([key, value]) => !key.includes('chatId');
const createKey = (chatId) => ({chatId : chatId});
const createExpressionAttributeNames = (state) => Object.entries(state)
    .filter(filterOutKey)
    .map(expressionAttributeNamesExp)
    .reduce(toOneObject, {});
const createExpressionAttributeValues = (state) => Object.entries(state)
    .filter(filterOutKey)
    .map(expressionAttributeValuesExp)
    .reduce(toOneObject, {});
const createUpdateExpression = (names, values) => {
    const expressionObject = Object.assign({}, Object.keys(names).map((names, index) => ({[names]: Object.keys(values)[index]})).reduce(toOneObject, {}));

    return Object.entries(expressionObject).map(([key, value]) => `${key} = ${value}`).toString();
};
