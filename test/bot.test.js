import chai from 'chai';
import bot from '../src/bot';
import botTestRepo from './bot-repo.test';

chai.config.includeStack = true;

describe('sending commands to bot', () => {

    const getNextMeeting = () => {
        const { day, time } = {
            "day": 3,
            "time" : "6:30 p.m. - 8:30 p.m."
        };
        const date = new Date();
        const resultDate = new Date(date.getTime());

        resultDate.setDate(date.getDate() + (7 + day - date.getDay()) % 7);

        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        return `${days[day]} ${resultDate.getMonth() + 1}-${resultDate.getDate()}-${resultDate.getFullYear()}, ${time}`;
    }

    it('should handle /next', (done) => {

        const expected = `Our next meeting is ${getNextMeeting()}\n\nWe will study Chapter 2 of The Blessed Life.\n\nNotes: Don't forget to bring $15 for your book!`;

        bot.handle({chatId : "-271298166", command : "/next", from : "Matt"}, botTestRepo)
            .then(response => {
                chai.expect(response.message).to.deep.equal(expected)
                done();
            })
            .catch((error) => {
                chai.assert.fail(0, 1, `failed with ${JSON.stringify(error)}`);
                done(error);
            });
    });

    it('should handle /prayers', (done) => {
        const expected = '*Current Prayer Requests*\n1 - Jimmy Surgery\n2 - Anne Surgery\n';

        bot.handle({chatId : "-271298166", command : "/prayers"}, botTestRepo)
            .then(response => {
                chai.expect(response.message).to.deep.equal(expected);
                done();
            })
            .catch((error) => {
                chai.assert.fail(0, 1, `failed with ${JSON.stringify(error)}`);
                done(error);
            });

    });

    it('should handle /clearPrayers', (done) => {  
        bot.handle({chatId : "-271298166", command : "/clearPrayers"}, botTestRepo)
            .then(response => {
                chai.expect(response.message).to.deep.equal("Prayer list cleared.");
                done();
            })
            .catch((error) => {
                chai.assert.fail(0, 1, `failed with ${JSON.stringify(error)}`);
                done(error);
            });
    });

    it('should handle /addPrayer', (done) => {  
        bot.handle({chatId : "-271298166", command : "/addPrayer This is a test prayer"}, botTestRepo)
            .then(response => {
                chai.expect(response.message).to.deep.equal("Prayer added. Type /prayers to see the full list.");
                done();
            })
            .catch((error) => {
                chai.assert.fail(0, 1, `failed with ${JSON.stringify(error)}`);
                done(error);
            });
    });

    it('should handle /removePrayer', (done) => {  
        bot.handle({chatId : "-271298166", command : "/removePrayer 2"}, botTestRepo)
            .then(response => {
                chai.expect(response.message).to.deep.equal("Prayer removed. Type /prayers to see the full list.");
                done();
            })
            .catch((error) => {
                chai.assert.fail(0, 1, `failed with ${JSON.stringify(error)}`);
                done(error);
            });
    });

    it('should handle /food', (done) => {
        const expected = '1 - Jenny Smith offered to bring dessert\n2 - Jill Smith offered to bring steak\n';

        bot.handle({chatId : "-271298166", command : "/food"}, botTestRepo)
            .then(response => {
                chai.expect(response.message).to.deep.equal(expected);
                done();
            })
            .catch((error) => {
                chai.assert.fail(0, 1, `failed with ${JSON.stringify(error)}`);
                done(error);
            });

    });

    it('should handle /bringFood', (done) => {  
        bot.handle({chatId : "-271298166", command : "/bringFood Pizza", from : 'Matt Clement'}, botTestRepo)
            .then(response => {
                chai.expect(response.message).to.deep.equal("Food added. Type /food to see the full list.");
                done();
            })
            .catch((error) => {
                chai.assert.fail(0, 1, `failed with ${JSON.stringify(error)}`);
                done(error);
            });
    });

    it('should handle /clearFood', (done) => {  
        bot.handle({chatId : "-271298166", command : "/clearFood"}, botTestRepo)
            .then(response => {
                chai.expect(response.message).to.deep.equal("Food list cleared.");
                done();
            })
            .catch((error) => {
                chai.assert.fail(0, 1, `failed with ${JSON.stringify(error)}`);
                done(error);
            });
    });

    it('should handle /removeFood', (done) => {  
        bot.handle({chatId : "-271298166", command : "/removeFood 1"}, botTestRepo)
            .then(response => {
                chai.expect(response.message).to.deep.equal("Food removed. Type /food to see the full list.");
                done();
            })
            .catch((error) => {
                chai.assert.fail(0, 1, `failed with ${JSON.stringify(error)}`);
                done(error);
            });
    });

    it('should handle /setStudy', (done) => {  
        bot.handle({chatId : "-271298166", command : "/setStudy Ch. 1 of Matt's great bood", from : 'Matt Clement'}, botTestRepo)
            .then(response => {
                chai.expect(response.message).to.deep.equal("Study updated. Type /next to see the group meeting time, study and notes.");
                done();
            })
            .catch((error) => {
                chai.assert.fail(0, 1, `failed with ${JSON.stringify(error)}`);
                done(error);
            });
    });

    it('should handle /setNotes', (done) => {  
        bot.handle({chatId : "-271298166", command : "/setNotes bring money for book", from : 'Matt Clement'}, botTestRepo)
            .then(response => {
                chai.expect(response.message).to.deep.equal("Notes updated. Type /next to see the group meeting time, study and notes.");
                done();
            })
            .catch((error) => {
                chai.assert.fail(0, 1, `failed with ${JSON.stringify(error)}`);
                done(error);
            });
    });

    it('should handle /create', (done) => {  
        bot.handle({chatId : "-271298166", command : "/create Matt's bot", from : 'Matt Clement'}, botTestRepo)
            .then(response => {
                chai.expect(response.message).to.deep.equal("Group created. Type /help to see a list of commands I support.");
                done();
            })
            .catch((error) => {
                chai.assert.fail(0, 1, `failed with ${JSON.stringify(error)}`);
                done(error);
            });
    });


    it('should handle /setMeeting', (done) => {  
        bot.handle({chatId : "-271298166", command : "/setMeeting Monday 5pm", from : 'Matt Clement'}, botTestRepo)
            .then(response => {
                chai.expect(response.message).to.deep.equal("Meeting set. Type /next to see the group meeting time, study and notes.");
                done();
            })
            .catch((error) => {
                chai.assert.fail(0, 1, `failed with ${JSON.stringify(error)}`);
                done(error);
            });
    });
    
});