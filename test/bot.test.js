import * as bot from '../src/bot';
import * as botTestRepo from './bot-repo.mock';

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

    it('should list help with /help or /about', (done) => {
        bot.handle({chatId : "-11111111111", command : "/about", from : "Matt"}, botTestRepo)
            .then(response => {
                console.log(`commands = ${response.message}`);
                done();
            });
    });

    it('should handle /next', (done) => {

        const expected = `Our next meeting is ${getNextMeeting()}\n\nWe will study Chapter 2 of The Blessed Life\n\nNotes: Don't forget to bring $15 for your book!`;

        bot.handle({chatId : "-11111111111", command : "/next", from : "Matt"}, botTestRepo)
            .then(response => {
                expect(response.message).toEqual(expected)
                done();
            })
            .catch((error) => {
                chai.assert.fail(0, 1, `failed with ${JSON.stringify(error)}`);
                done(error);
            });
    });


    it('should reject when an error in /next', (done) => {

        const repo = {
            getGroup : (chatId) => {
                return Promise.reject('error');
            }
        }

        bot.handle({chatId : "-11111111111", command : "/next", from : "Matt"}, repo)
            .then(response => {
                done("should hit catch");
            })
            .catch((error) => {
                expect(error.error).toMatch(/Can not find group:/);
                done();
            });
    });

    it('should handle /prayers', (done) => {
        const expected = '*Current Prayer Requests*\n1 - Jimmy Surgery\n2 - Anne Surgery\n';

        bot.handle({chatId : "-11111111111", command : "/prayers"}, botTestRepo)
            .then(response => {
                expect(response.message).toEqual(expected);
                done();
            })
            .catch((error) => {
                done(`failed with ${JSON.stringify(error)}`);
            });

    });

    it('should handle /clearPrayers', (done) => {  
        bot.handle({chatId : "-11111111111", command : "/clearPrayers"}, botTestRepo)
            .then(response => {
                expect(response.message).toEqual("Prayer list cleared.");
                done();
            })
            .catch((error) => {
                done(error);
            });
    });

    it('should handle /addPrayer', (done) => {  
        bot.handle({chatId : "-11111111111", command : "/addPrayer This is a test prayer"}, botTestRepo)
            .then(response => {
                expect(response.message).toEqual("Prayer added. Type /prayers to see the full list.");
                done();
            })
            .catch((error) => {
                done(error);
            });
    });

    it('should handle /addPrayer with @', (done) => {  
        bot.handle({chatId : "-11111111111", command : "/addPrayer@LifeGroup_Bot This is a test prayer"}, botTestRepo)
            .then(response => {
                expect(response.message).toEqual("Prayer added. Type /prayers to see the full list.");
                done();
            })
            .catch((error) => {
                done(error);
            });
    });

    it('should handle /add prayer', (done) => {  
        bot.handle({chatId : "-11111111111", command : "/add prayer This is a test prayer"}, botTestRepo)
            .then(response => {
                expect(response.message).toEqual("Prayer added. Type /prayers to see the full list.");
                done();
            })
            .catch((error) => {
                done(error);
            });
    });

    it('should handle /addPrayer when prayers do not exist', (done) => {  
        const repo = {
            getGroup : (chatId) => {
                return new Promise((resolve, reject) => {
                    const newGroup = {
                        chatId: "-11111111"
                    };
                    resolve(newGroup);
                });
            },

            update : (group) => {
                return new Promise((resolve, reject) => {
                    resolve("");
                });
            }
        }

        bot.handle({chatId : "-11111111111", command : "/addPrayer This is a test prayer"}, repo, "Joe Smith")
            .then(response => {
                expect(response.message).toEqual("Prayer added. Type /prayers to see the full list.");
                done();
            })
            .catch((error) => {
                done(error);
            });
    });

    it('should handle /removePrayer', (done) => {  
        bot.handle({chatId : "-11111111111", command : "/removePrayer 2"}, botTestRepo)
            .then(response => {
                console.log(`response = ${response.message}`);
                expect(response.message).toMatch(/Prayer removed/);
                done();
            })
            .catch((error) => {
                done(error);
            });
    });

    it('should handle /food', (done) => {
        const expected = '1 - Jenny Smith offered to bring dessert\n2 - Jill Smith offered to bring steak\n';

        bot.handle({chatId : "-11111111111", command : "/food"}, botTestRepo)
            .then(response => {
                expect(response.message).toEqual(expected);
                done();
            })
            .catch((error) => {
                done(error);
            });

    });

    it('should handle /bringFood', (done) => {  
        bot.handle({chatId : "-11111111111", command : "/bringFood Pizza", from : 'Matt Clement'}, botTestRepo)
            .then(response => {
                console.log(`response: ${JSON.stringify(response, null, 2)}`)
                expect(response.message).toEqual("Food added. \n1 - Jenny Smith offered to bring dessert\n2 - Jill Smith offered to bring steak\n3 - Matt Clement offered to bring Pizza\n");
                done();
            })
            .catch((error) => {
                done(error);
            });
    });

    it('should handle /bringFood when food does not exist', (done) => {  
        
        const repo = {
            getGroup : (chatId) => {
                return new Promise((resolve, reject) => {
                    const newGroup = {
                        chatId: "-11111111"
                    };
                    resolve(newGroup);
                });
            },

            update : (group) => {
                return new Promise((resolve, reject) => {
                    resolve("");
                });
            }
        }

        bot.handle({chatId : "-11111111111", command : "/bringFood Pizza", from : 'Matt Clement'}, repo)
            .then(response => {
                console.log(`response: ${JSON.stringify(response, null, 2)}`)
                expect(response.message).toEqual("Food added. \n1 - Matt Clement offered to bring Pizza\n");
                done();
            })
            .catch((error) => {
                done(error);
            });
    });

    it('should handle /clearFood', (done) => {  
        bot.handle({chatId : "-11111111111", command : "/clearFood"}, botTestRepo)
            .then(response => {
                expect(response.message).toEqual("Food list cleared.");
                done();
            })
            .catch((error) => {
                done(error);
            });
    });

    it('should handle /removeFood', (done) => {  
        bot.handle({chatId : "-11111111111", command : "/removeFood 1"}, botTestRepo)
            .then(response => {                
                expect(response.message).toMatch(/Food removed/);
                done();
            })
            .catch((error) => {
                done(error);
            });
    });

    it('should handle /removeFood when multiple ids are passed', (done) => {  
        bot.handle({chatId : "-11111111111", command : "/removeFood 1,2"}, botTestRepo)
            .then(response => {                
                expect(response.message).toMatch(/Food removed/);
                done();
            })
            .catch((error) => {
                done(error);
            });
    });

    it('should handle /setStudy', (done) => {  
        bot.handle({chatId : "-11111111111", command : "/setStudy Ch. 1 of Matt's great bood", from : 'Matt Clement'}, botTestRepo)
            .then(response => {
                expect(response.message).toEqual("Study updated. Type /next to see the group meeting time, study and notes.");
                done();
            })
            .catch((error) => {
                done(error);
            });
    });

    it('should handle /setNotes', (done) => {  
        bot.handle({chatId : "-11111111111", command : "/setNotes bring money for book", from : 'Matt Clement'}, botTestRepo)
            .then(response => {
                expect(response.message).toEqual("Notes updated. Type /next to see the group meeting time, study and notes.");
                done();
            })
            .catch((error) => {
                done(error);
            });
    });

    it('should handle /create', (done) => {  
        bot.handle({chatId : "-11111111111", command : "/create Matt's bot", from : 'Matt Clement'}, botTestRepo)
            .then(response => {
                expect(response.message).toEqual("Group created. Type /help to see a list of commands I support.");
                done();
            })
            .catch((error) => {
                done(error);
            });
    });


    it('should handle /setMeeting', (done) => {  
        bot.handle({chatId : "-11111111111", command : "/setMeeting Monday 5pm", from : 'Matt Clement'}, botTestRepo)
            .then(response => {
                expect(response.message).toEqual("Meeting set. Type /next to see the group meeting time, study and notes.");
                done();
            })
            .catch((error) => {
                done(error);
            });
    });
    
});