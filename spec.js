//protractor testing doesn't work yet because this is not yet an angular app


describe('roadwarrior homepage', function(){
	it('should have a title', function(){
		browser.get('http://localhost:3000');
		expect(browser.getTitle()).toEqual('Simple Map')

	});
});