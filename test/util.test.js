
describe('test remove \n', () => {

    

    it('should remove \n', (done) => {
        const newline = "\nThis is a string with a newline at the beginning"
        const replaced = newline.trimStart()

        console.log(`newline = *${newline}*`)
        console.log(`replaced = *${replaced}*`)

        expect(replaced).toEqual('This is a string with a newline at the beginning')

        done()
    });

    it('should not remove \n', (done) => {
        const newline = "This\n is a string with a newline at the beginning"
        const replaced = newline.trimStart()

        console.log(`replaced = ${replaced}`)

        expect(replaced).toMatch('This\n is a string with a newline at the beginning')

        done()
    });

    
});