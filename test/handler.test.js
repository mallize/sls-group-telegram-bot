import event from './resources/event.json';
import joinevent from './resources/joingroup-event.json';
import ignoreevent from './resources/wedontcare-event.json';
import * as handler from '../src/handler';
import * as testRepo from './bot-repo.mock';

describe('sending command events to handler', () => {
    it('should handle /next', (done) => {
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

        const callback = (err, success) => {
            if (success.statusCode != 200) {
                try {
                    done(`Expected ${success.statusCode} to be ${200}`);
                } catch (error) {
                    done(error);
                }
            } else {
                done();
            }
        };

        handler.process(next, null, callback, mockHttp, "token", testRepo);
    });

    it('should create a new group when being invited', (done) => {
        
        const event = joinevent;

        const mockHttp = {
            post(url, response) { 
                return new Promise((resolve) => {
                    resolve({'success': 'it worked'});
                });
            }
        };

        const callback = (err, success) => {
            if (success.statusCode != 200) {
                try {
                    done(`Expected ${success.statusCode} to be ${200}`);
                } catch (error) {
                    done(error);
                }
            } else {
                done();
            }
        };

        handler.process(event, null, callback, mockHttp, "token", testRepo);
    });

    it('should ignore events we do not care about', (done) => {
        
        const event = ignoreevent;

        const mockHttp = {
            post(url, response) { 
                return new Promise((resolve) => {
                    resolve({'success': 'it worked'});
                });
            }
        };

        const callback = (err, success) => {
            if (success.statusCode != 200) {
                try {
                    done(`Expected ${success.statusCode} to be ${200}`);
                } catch (error) {
                    done(error);
                }
            } else {
                done();
            }
        };

        handler.process(event, null, callback, mockHttp, "token", testRepo);
    });
});