import event from './resources/event.json';
import joinevent from './resources/joingroup-event.json';
import sendmessageevent from './resources/sendmessage-event.json';
import ignoreevent from './resources/wedontcare-event.json';
import * as handler from '../src/handler';
import * as testRepo from './bot-repo.mock';

describe('sending command events to handler', () => {
  process.env.TELEGRAM_TOKEN = "";

    it('should handle /next', async (done) => {
        event.body = event.body.replace("{{command}}", "/next");
        const next = event;

        const expected = 'Our next meeting is Wednesday 9-26-2018, 6:30 p.m. - 8:30 p.m.\n\nWe will study Chapter 1 of The Blessed Life.\n\nDon\'t forget to bring $15 for your book!';

        const mockHttp = {
            post(url, response) {
                return new Promise((resolve) => {
                    resolve({'success': 'it worked'});
                });
            }
        };

        const success = await handler.handle(next, null, null, mockHttp, "token", testRepo)

        if (success.statusCode != 200) {
          try {
              done(`Expected ${success.statusCode} to be ${200}`);
          } catch (error) {
              done(error);
          }
        } else {
            done();
        }          

    });

    it('should create a new group when being invited', async (done) => {
        
        const event = joinevent;

        const mockHttp = {
            post(url, response) { 
                return new Promise((resolve) => {
                    resolve({'success': 'it worked'});
                });
            }
        };

        const success = await handler.handle(event, null, null, mockHttp, "token", testRepo)
          
        if (success.statusCode != 200) {
            try {
                done(`Expected ${success.statusCode} to be ${200}`);
            } catch (error) {
                done(error);
            }
        } else {
            done();
        }          
        
    });

    it('should send a message', async (done) => {
        
        const event = sendmessageevent;

        const mockHttp = {
            post(url, response) { 
                return new Promise((resolve) => {
                    resolve({'success': 'it worked'});
                });
            }
        };

        const success = await handler.handle(event, null, null, mockHttp, "token", testRepo)
          
        if (success.statusCode != 200) {
            try {
                done(`Expected ${success.statusCode} to be ${200}`);
            } catch (error) {
                done(error);
            }
        } else {
            done();
        }          
        
    });

    it('should ignore events we do not care about', async (done) => {
        
        const event = ignoreevent;

        const mockHttp = {
            post(url, response) { 
                return new Promise((resolve) => {
                    resolve({'success': 'it worked'});
                });
            }
        };

        const success = await handler.handle(event, null, null, mockHttp, "token", testRepo);

        if (success.statusCode != 200) {
          try {
              done(`Expected ${success.statusCode} to be ${200}`);
          } catch (error) {
              done(error);
          }
        } else {
            done();
        }
    });
});